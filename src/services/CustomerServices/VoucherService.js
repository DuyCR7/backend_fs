import db from "../../models/index";
import { Op } from "sequelize";

const getAllVouchersForGuest = async (page, limit) => {
    try {
        let offset = (page - 1) * limit;

        const { count, rows } = await db.Voucher.findAndCountAll({
            where: {
                isActive: true,
                startDate: {
                    [Op.lt]: new Date()
                },
                endDate: {
                    [Op.gt]: new Date()
                },
                usageLimit: {
                    [Op.gt]: db.Sequelize.col('usedCount')
                }
            },
            order: [['id', 'DESC']],
            offset: offset,
            limit: limit,
        });

        let data = {
            totalRows: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            vouchers: rows,
        }

        return {
            EM: "Lấy thông tin vouchers cho khách thành công!",
            EC: 0,
            DT: data
        }
    } catch (e) {
        console.log(e);
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: ""
        }
    }
}

const getAllVouchers = async (cusId, page, limit) => {
    try {
        let offset = (page - 1) * limit;

        const { count, rows } = await db.Voucher.findAndCountAll({
            where: {
                isActive: true,
                startDate: {
                    [Op.lt]: new Date()
                },
                endDate: {
                    [Op.gt]: new Date()
                },
                usageLimit: {
                    [Op.gt]: db.Sequelize.col('usedCount')
                }
            },
            include: [
                {
                    model: db.Voucher_Customer,
                    required: false,
                    where: { cusId: cusId },
                    attributes: ['isUsed']
                }
            ],
            order: [['id', 'DESC']],
            offset: offset,
            limit: limit,
        });

        let data = {
            totalRows: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            vouchers: rows,
        }

        return {
            EM: "Lấy thông tin vouchers thành công!",
            EC: 0,
            DT: data
        }
    } catch (e) {
        console.log(e);
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: ""
        }
    }
}

const saveVoucher = async (cusId, voucherId) => {
    const t = await db.sequelize.transaction();
    try {
        const voucher = await db.Voucher.findOne({
            where: {
                id: voucherId,
                isActive: true,
                startDate: {
                    [Op.lt]: new Date()
                },
                endDate: {
                    [Op.gt]: new Date()
                },
                usageLimit: {
                    [Op.gt]: db.Sequelize.col('usedCount')
                },
            },
            transaction: t,
            lock: t.LOCK.UPDATE,
        });
        
        if (!voucher) {
            await t.rollback();
            return {
                EM: "Voucher này đã hết hạn hoặc đã hết sử dụng!",
                EC: -1,
                DT: ""
            }
        }

        const [savedVoucher, created] = await db.Voucher_Customer.findOrCreate({
            where: {
                voucherId: voucherId,
                cusId: cusId,
            },
            transaction: t,
        });

        if (!created) {
            await t.rollback();
            return {
                EM: "Bạn đã lưu voucher này rồi!",
                EC: -1,
                DT: ""
            }
        }

        await t.commit();
        return {
            EM: "Lưu voucher thành công!",
            EC: 0,
            DT: ""
        }

    } catch (e) {
        await t.rollback();
        console.log(e);
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: ""
        }
    }
}

module.exports = {
    getAllVouchersForGuest,
    getAllVouchers,
    saveVoucher,
}