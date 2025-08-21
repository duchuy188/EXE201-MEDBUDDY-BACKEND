const Tesseract = require('tesseract.js');
const path = require('path');
const { uploadImage } = require('../services/uploadService');
const { cloudinary } = require('../services/cloudinaryService');

// POST /api/ocr
// Body: multipart/form-data (field: image)
exports.ocrPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }


    // Upload ảnh lên Cloudinary
    let imageUrl = '';
    let publicId = '';
    try {
      const uploadResult = await uploadImage(req.file.buffer, { folder: 'ocr-prescriptions' });
      imageUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    } catch (err) {
      return res.status(500).json({ message: 'Upload image to Cloudinary failed', error: err.message });
    }

    const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'vie+eng', {
      langPath: 'tessdata',
    });

    // Trích xuất thông tin thuốc, số lượng, hướng dẫn sử dụng
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const medicines = [];
    
    // Regex patterns cải thiện
    const regexQty = /(\d+)\s*(viên|ống|vỉ|gói|chai|ml|mg|mcg|lọ|tuýp|ông)/gi;
    
    // Mở rộng regex để bắt nhiều format hơn: "1/", "1)", "1.", "1 ", "1-"
    const regexMedStart = /^\d+\s*[\/\)\.\-\s]/;
    
    // Regex để extract tên thuốc từ dòng bắt đầu - cải thiện để tách quantity
    const regexName = /^\d+\s*[\/\)\.\-\s]\s*([A-Za-zÀ-ỹ0-9\(\)\s\.%\-\+\,\;]+?)(?:\s+(\d+\s*(?:viên|ống|vỉ|gói|chai|ml|mg|mcg|lọ|tuýp|ông)))?$/i;
    
    // Keywords cho usage
    const regexUsage = /(uống|nhỏ mắt|dùng|sử dụng|ngày|lần|viên|ống|vỉ|gói|chai|ml|mg|mcg|mỗi ngày|mỗi lần|lần\/ngày|lần ngày|HDSD|hướng dẫn|sáng|chiều|tối)/i;
    
    // Keywords để detect medicine lines
    const medicineKeywords = /(natri|magnesi|paracetamol|amoxicillin|vitamin|aspirin|ibuprofen|acetaminophen|diclofenac|cetirizine|loratadine|omeprazole)/i;
    
    // Regex để loại bỏ timestamp và các dòng không phải thuốc
    const invalidLines = /^\d{2}\.\d{2}|^\d{2}:\d{2}|^trang|^mã đơn|^họ và tên|^cân nặng|^địa chỉ|^chẩn đoán|^thị lực|^nhãn áp|^soi đáy|^lời dặn|^tái khám|^cộng khoản|\d{2}\.\d{2}:\d{2}PM|\d{2}:\d{2}:\d{2}PM|trang:\s*\d+\/\d+/i;
    
    let currentMed = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      console.log(`Line ${i}: "${line}"`); // Debug log
      
      // Skip invalid lines
      if (invalidLines.test(line) || line.length < 3) {
        continue;
      }
      
      // Case 1: Dòng bắt đầu thuốc mới với số thứ tự
      if (regexMedStart.test(line)) {
        // Save previous medicine
        if (currentMed && currentMed.name) {
          medicines.push({ ...currentMed });
        }
        
        // Start new medicine
        currentMed = { name: '', quantity: '', usage: '' };
        
        // Sử dụng regex cải thiện để tách name và quantity
        const fullMatch = line.match(/^\d+\s*[\/\)\.\-\s]\s*(.+)$/);
        if (fullMatch) {
          let content = fullMatch[1].trim();
          
          // Tìm quantity ở cuối dòng trước
          const qtyMatch = content.match(/(.+?)\s+(\d+\s*(?:viên|ống|vỉ|gói|chai|ml|mg|mcg|lọ|tuýp|ông))(?:\s|$)/i);
          
          if (qtyMatch) {
            currentMed.name = qtyMatch[1].trim();
            currentMed.quantity = qtyMatch[2].trim();
            
            // Phần còn lại sau quantity có thể là usage
            const afterQty = content.substring(content.indexOf(qtyMatch[2]) + qtyMatch[2].length).trim();
            if (afterQty && regexUsage.test(afterQty)) {
              currentMed.usage = afterQty;
            }
          } else {
            currentMed.name = content;
          }
        }
        continue;
      }
      
      // Case 2: Dòng có thể là tên thuốc (không có số thứ tự nhưng có keywords thuốc)
      if (!currentMed && medicineKeywords.test(line)) {
        currentMed = { name: '', quantity: '', usage: '' };
        
        const qtyMatch = line.match(regexQty);
        if (qtyMatch) {
          currentMed.name = line.substring(0, line.indexOf(qtyMatch[0])).trim();
          currentMed.quantity = qtyMatch[0];
          
          const afterQty = line.substring(line.indexOf(qtyMatch[0]) + qtyMatch[0].length).trim();
          if (afterQty && regexUsage.test(afterQty)) {
            currentMed.usage = afterQty;
          }
        } else {
          currentMed.name = line.trim();
        }
        continue;
      }
      
      // Case 3: Xử lý thông tin bổ sung cho thuốc hiện tại
      if (currentMed && currentMed.name) {
        // Tìm quantity nếu chưa có - kiểm tra các pattern khác nhau
        if (!currentMed.quantity) {
          // Pattern 1: "30 Viên" 
          let qtyMatch = line.match(/^(\d+\s*(?:viên|ống|vỉ|gói|chai|ml|mg|mcg|lọ|tuýp|ông))(?:\s|$)/i);
          
          // Pattern 2: "/ _' 30 Viên -"
          if (!qtyMatch) {
            qtyMatch = line.match(/[\/\-_\s]+(\d+\s*(?:viên|ống|vỉ|gói|chai|ml|mg|mcg|lọ|tuýp|ông))/i);
          }
          
          // Pattern 3: Anywhere in line
          if (!qtyMatch) {
            qtyMatch = line.match(/(\d+\s*(?:viên|ống|vỉ|gói|chai|ml|mg|mcg|lọ|tuýp|ông))/i);
          }
          
          if (qtyMatch) {
            currentMed.quantity = qtyMatch[1].trim();
            
            // Kiểm tra có usage trong cùng dòng không
            const restOfLine = line.replace(qtyMatch[0], '').trim();
            if (restOfLine && regexUsage.test(restOfLine)) {
              currentMed.usage = restOfLine;
            }
            continue;
          }
        }
        
        // Tìm usage - bỏ qua nếu dòng chỉ có quantity
        if (regexUsage.test(line) && !line.match(/^\d+\s*(?:viên|ống|vỉ|gói|chai|ml|mg|mcg|lọ|tuýp|ông)\s*$/i)) {
          currentMed.usage += (currentMed.usage ? ' ' : '') + line;
          continue;
        }
        
        // Nếu dòng chứa từ khóa thuốc và currentMed.name ngắn, có thể là phần tiếp theo của tên
        if (currentMed.name.length < 20 && medicineKeywords.test(line) && !line.match(/^\d+\s*(?:viên|ống|vỉ|gói|chai|ml|mg|mcg|lọ|tuýp|ông)/i)) {
          currentMed.name += ' ' + line.trim();
          continue;
        }
      }
    }
    
    // Thêm thuốc cuối cùng
    if (currentMed && currentMed.name) {
      medicines.push({ ...currentMed });
    }
    
    // Clean up và validate
    const result = medicines
      .filter(m => {
        // Lọc tên thuốc hợp lệ
        if (!m.name || m.name.length < 3) return false;
        
        // Loại bỏ timestamp patterns
        if (/^\d{2}\.\d{2}:\d{2}PM|trang:\s*\d+\/\d+|\d{2}:\d{2}:\d{2}PM/i.test(m.name)) return false;
        
        // Loại bỏ các dòng chứa thông tin không phải thuốc
        if (/^(mã đơn|họ và tên|cân nặng|địa chỉ|chẩn đoán|thị lực|nhãn áp|soi đáy|lời dặn|tái khám|cộng khoản)/i.test(m.name)) return false;
        
        return true;
      })
      .map(m => ({
        name: m.name.trim(),
        quantity: m.quantity.trim(), 
        usage: m.usage.trim()
      }));;
    
    console.log('Extracted medicines:', result); // Debug log
    

    // Nếu không nhận diện được thuốc nào thì xóa ảnh vừa upload và trả về lỗi
    if (!result || result.length === 0) {
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (e) {
          console.error('Failed to delete image from Cloudinary:', e.message);
        }
      }
      return res.status(400).json({ message: 'Không nhận diện được thuốc nào từ ảnh. Ảnh có thể bị mờ hoặc không hợp lệ.' });
    }

    res.json({ 
      medicines: result,
      rawText: text, // Để debug
      totalFound: result.length,
      imageUrl
    });
    
  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({ message: 'OCR failed', error: error.message });
  }
};