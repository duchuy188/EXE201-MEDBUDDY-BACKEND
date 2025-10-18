const User = require("../models/User");
const Package = require("../models/Package");
const Payment = require("../models/Payment");
const { now, addDays, addMonths, addYears, formatVN, formatPackageExpiry } = require("../utils/dateHelper");


// Kích hoạt gói cho user sau khi thanh toán thành công
async function activateUserPackage(userId, packageId) {
    try {

        // Guard: only activate if there's a PAID payment for this user & package
        const paidExists = await Payment.exists({ userId, packageId, status: "PAID" });
        if (!paidExists) {
            console.warn(`activateUserPackage skipped for user=${userId}, package=${packageId} because no PAID payment found`);
            return await User.findById(userId);
        }

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

        // Chỉ cộng dồn thời gian khi gói cũ vẫn còn hiệu lực và có packageId
        if (currentUser.activePackage &&
            currentUser.activePackage.packageId &&
            currentUser.activePackage.endDate &&
            currentUser.activePackage.isActive) {
            const currentEndDate = new Date(currentUser.activePackage.endDate);
            const currentStartDate = new Date(currentUser.activePackage.startDate);
            const nowDate = now().toDate();

            // Chỉ cộng dồn nếu gói cũ vẫn còn hiệu lực (chưa hết hạn)
            if (currentEndDate > nowDate) {
                startDate = currentStartDate;
                actionType = "extended";

                // Cộng dồn thời gian từ ngày kết thúc của gói cũ
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
                // Gói cũ đã hết hạn, tạo gói mới từ ngày hiện tại
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
            // Lần đầu tiên kích hoạt gói
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

        // Merge features từ gói cũ và gói mới (loại bỏ duplicate)
        let mergedFeatures = [...(packageInfo.features || [])];
        if (currentUser.activePackage && currentUser.activePackage.features) {
            const oldFeatures = currentUser.activePackage.features;
            mergedFeatures = [...new Set([...oldFeatures, ...mergedFeatures])]; // Loại bỏ duplicate
        }

        // Cập nhật User với gói mới
        const user = await User.findByIdAndUpdate(
            userId, {
                activePackage: {
                    packageId: packageId,
                    startDate: startDate,
                    endDate: endDate,
                    features: mergedFeatures,
                    isActive: true
                }
            }, { new: true }
        ).populate("activePackage.packageId");

        console.log(`Package ${actionType} for user ${userId}: ${packageInfo.name} (${packageInfo.duration} ${packageInfo.unit}) until ${formatPackageExpiry(endDate)}`);

        // Debug logging để kiểm tra logic cộng dồn
        if (actionType === "extended") {
            console.log(`DEBUG: Extended existing package. Old endDate: ${formatPackageExpiry(currentUser.activePackage.endDate)}, New endDate: ${formatPackageExpiry(endDate)}`);
        }

        return user;
    } catch (error) {
        console.error("Error activating user package:", error);
        throw error;
    }
}

// Recalculate active package strictly from PAID payments only
async function reconcileActivePackageFromPaid(userId) {
    const payments = await Payment.find({ userId, status: "PAID" })
        .populate("packageId")
        .sort({ paidAt: 1 });

    if (!payments || payments.length === 0) {
        await User.findByIdAndUpdate(userId, { "activePackage.isActive": false });
        return null;
    }

    let startDate = payments[0].paidAt || now().toDate();
    let endDate = new Date(startDate);
    let mergedFeatures = [];

    for (const p of payments) {
        const pkg = p.packageId;
        if (!pkg) continue;
        // union features
        mergedFeatures = [...new Set([...(mergedFeatures || []), ...((pkg.features) || [])])];

        switch (pkg.unit) {
            case "day":
                endDate = addDays(endDate, pkg.duration).toDate();
                break;
            case "month":
                endDate = addMonths(endDate, pkg.duration).toDate();
                break;
            case "year":
                endDate = addYears(endDate, pkg.duration).toDate();
                break;
            default:
                break;
        }
    }

    const isActive = now().toDate() <= endDate;
    const user = await User.findByIdAndUpdate(
        userId, {
            activePackage: {
                packageId: (payments[payments.length - 1].packageId && payments[payments.length - 1].packageId._id) ?
                    payments[payments.length - 1].packageId._id : payments[payments.length - 1].packageId,
                startDate,
                endDate,
                features: mergedFeatures,
                isActive
            }
        }, { new: true }
    ).populate("activePackage.packageId");

    return user && user.activePackage && user.activePackage.isActive ? user.activePackage : null;
}

// Kiểm tra gói active của user
async function getActivePackage(userId) {
    try {
        // First, reconcile from PAID payments to eliminate any PENDING side-effects
        await reconcileActivePackageFromPaid(userId);

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

        // Ensure there is a PAID payment for the current active package
        // This guards against showing packages that only have PENDING payments
        const currentPackageId = (user.activePackage && user.activePackage.packageId && user.activePackage.packageId._id) ?
            user.activePackage.packageId._id :
            user.activePackage.packageId;

        const hasPaidPayment = await Payment.exists({
            userId,
            packageId: currentPackageId,
            status: "PAID",
        });

        if (!hasPaidPayment) {
            return null;
        }

        return user.activePackage;
    } catch (error) {
        console.error("Error getting active package:", error);
        throw error;
    }
}

// Kiểm tra user có quyền sử dụng feature không
async function hasFeatureAccess(userId, feature) {
    try {
        const activePackage = await getActivePackage(userId);
        if (!activePackage || !activePackage.features) {
            return false;
        }
        return activePackage.features.includes(feature);
    } catch (error) {
        console.error("Error checking feature access:", error);
        throw error;
    }
}

// Hủy gói của user
async function cancelUserPackage(userId) {
    try {
        const user = await User.findByIdAndUpdate(
            userId, {
                "activePackage.isActive": false
            }, { new: true }
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
            userId, {
                "activePackage.endDate": newEndDate
            }, { new: true }
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
        const stats = await User.aggregate([{
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