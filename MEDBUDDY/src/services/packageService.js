const User = require("../models/User");
const Package = require("../models/Package");
const { now, addDays, addMonths, addYears, formatVN, formatPackageExpiry } = require("../utils/dateHelper");


// Kích hoạt gói cho user sau khi thanh toán thành công
async function activateUserPackage(userId, packageId) {
  try {
 
    const packageInfo = await Package.findById(packageId);
    if (!packageInfo) {
      throw new Error("Package không tồn tại");
    }
    

 
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new Error("User không tồn tại");
    }

    let startDate, endDate;
    let actionType = "";

  
    if (currentUser.activePackage && currentUser.activePackage.isActive) {
      const currentEndDate = new Date(currentUser.activePackage.endDate);
      const currentStartDate = new Date(currentUser.activePackage.startDate);
      const nowDate = now().toDate();
      
      if (currentEndDate > nowDate) {
     
        startDate = currentStartDate;
        actionType = "extended";
        
      
        switch (packageInfo.unit) {
          case "day":
            endDate = addDays(currentEndDate, packageInfo.duration).toDate();
            break;
          case "month":
            endDate = addMonths(currentEndDate, packageInfo.duration).toDate();
            break;
          case "year":
            endDate = addYears(currentEndDate, packageInfo.duration).toDate();
            break;
          default:
            throw new Error("Đơn vị thời gian không hợp lệ");
        }
      } else {
      
        startDate = now().toDate();
        actionType = "renewed";
        
  
        switch (packageInfo.unit) {
          case "day":
            endDate = addDays(startDate, packageInfo.duration).toDate();
            break;
          case "month":
            endDate = addMonths(startDate, packageInfo.duration).toDate();
            break;
          case "year":
            endDate = addYears(startDate, packageInfo.duration).toDate();
            break;
          default:
            throw new Error("Đơn vị thời gian không hợp lệ");
        }
      }
    } else {
  
      startDate = now().toDate();
      actionType = "activated";
      

      switch (packageInfo.unit) {
        case "day":
          endDate = addDays(startDate, packageInfo.duration).toDate();
          break;
        case "month":
          endDate = addMonths(startDate, packageInfo.duration).toDate();
          break;
        case "year":
          endDate = addYears(startDate, packageInfo.duration).toDate();
          break;
        default:
          throw new Error("Đơn vị thời gian không hợp lệ");
      }
    }

    // Cập nhật User với gói mới
    const user = await User.findByIdAndUpdate(
      userId,
      {
        activePackage: {
          packageId: packageId,
          startDate: startDate,
          endDate: endDate,
          features: packageInfo.features || [],
          isActive: true
        }
      },
      { new: true }
    ).populate("activePackage.packageId");

    console.log(`Package ${actionType} for user ${userId}: ${packageInfo.name} until ${formatPackageExpiry(endDate)}`);

    return user;
  } catch (error) {
    console.error("Error activating user package:", error);
    throw error;
  }
}

// Kiểm tra gói active của user
async function getActivePackage(userId) {
  try {
    const user = await User.findById(userId).populate("activePackage.packageId");
    
    if (!user || !user.activePackage.isActive) {
      return null;
    }

  
    if (now().toDate() > user.activePackage.endDate) {
    
      await User.findByIdAndUpdate(userId, {
        "activePackage.isActive": false
      });
      return null;
    }


    return user.activePackage;
  } catch (error) {
    console.error("Error getting active package:", error);
    throw error;
  }
}

// Kiểm tra user có quyền sử dụng feature không
async function hasFeatureAccess(userId, featureName) {
  try {
    const activePackage = await getActivePackage(userId);
    
    
    // Nếu không có gói active hoặc gói không có tính năng đó, từ chối truy cập
    if (!activePackage || !activePackage.features.includes(featureName)) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking feature access:", error);
    throw error;
  }
}

// Hủy gói của user
async function cancelUserPackage(userId) {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        "activePackage.isActive": false
      },
      { new: true }
    );

    return user;
  } catch (error) {
    console.error("Error cancelling user package:", error);
    throw error;
  }
}

// Gia hạn gói của user
async function extendUserPackage(userId, additionalDuration, unit) {
  try {
    const user = await User.findById(userId);
    
    if (!user || !user.activePackage.isActive) {
      throw new Error("User không có gói active");
    }

    const currentEndDate = user.activePackage.endDate;
    const newEndDate = new Date(currentEndDate);

    switch (unit) {
      case "day":
        newEndDate.setDate(newEndDate.getDate() + additionalDuration);
        break;
      case "month":
        newEndDate.setMonth(newEndDate.getMonth() + additionalDuration);
        break;
      case "year":
        newEndDate.setFullYear(newEndDate.getFullYear() + additionalDuration);
        break;
      default:
        throw new Error("Đơn vị thời gian không hợp lệ");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        "activePackage.endDate": newEndDate
      },
      { new: true }
    ).populate("activePackage.packageId");

    return updatedUser;
  } catch (error) {
    console.error("Error extending user package:", error);
    throw error;
  }
}

// Thống kê gói
async function getPackageStats() {
  try {
    const stats = await User.aggregate([
      {
        $match: {
          "activePackage.isActive": true
        }
      },
      {
        $group: {
          _id: "$activePackage.packageId",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "packages",
          localField: "_id",
          foreignField: "_id",
          as: "package"
        }
      },
      { $unwind: "$package" },
      {
        $project: {
          packageName: "$package.name",
          activeUsers: "$count"
        }
      },
      { $sort: { activeUsers: -1 } }
    ]);

    return stats;
  } catch (error) {
    console.error("Error getting package stats:", error);
    throw error;
  }
}

module.exports = {
  activateUserPackage,
  getActivePackage,
  hasFeatureAccess,
  cancelUserPackage,
  extendUserPackage,
  getPackageStats
};
