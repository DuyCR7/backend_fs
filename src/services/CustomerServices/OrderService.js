import db from "../../models/index";
import { Op } from "sequelize";

const getMyOrders = async (cusId, page, limit) => {
    try {
        console.log("Getting", cusId, page, limit);
        const customer = await db.Customer.findByPk(cusId);
        if (!customer) {
            return {
                EM: "Không tìm thấy khách hàng!",
                EC: 1,
                DT: ""
            };
        }

        let offset = (page - 1) * limit;

        const [totalCount, orders] = await Promise.all([
            db.Order.count({
                where: { cusId: cusId }
            }),
            db.Order.findAll({
                where: {
                    cusId: cusId,
                },
                order: [
                    ['id', 'DESC']
                ],
                include: [
                    {
                        model: db.Order_Detail,
                        include: [
                            {
                                model: db.Product_Detail,
                                include: [
                                    {
                                        model: db.Product,
                                        attributes: ['id', 'name', 'price', 'price_sale', 'isSale', 'slug'],
                                    },
                                    {
                                        model: db.Color,
                                        attributes: ['id', 'name']
                                    },
                                    {
                                        model: db.Size,
                                        attributes: ['id', 'code']
                                    }
                                ]
                            }
                        ]
                    },
                ],
                offset: offset,
                limit: limit,
            })
        ])

        return {
            EM: `Lấy danh sách đơn hàng của khách hàng ${customer.email} thành công!`,
            EC: 0,
            DT: {
                totalRows: totalCount, 
                orders: orders,
                totalPages: Math.ceil(totalCount / limit)
            }
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

const cancelOrder = async (orderId, cusId) => {
    try {
        const order = await db.Order.findOne({
            where: {
                id: orderId,
                cusId: cusId,
                status: 1
            }
        });

        if (!order) {
            return {
                EM: "Đơn hàng không thể hủy! Refresh lại trang để cập nhật!",
                EC: 1,
                DT: ""
            };
        }

        order.status = 0;
        await order.save();

        return {
            EM: "Hủy đơn hàng thành công!",
            EC: 0,
            DT: ""
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

const confirmReceivedOrder = async (orderId, cusId) => {
    try {
        const order = await db.Order.findOne({
            where: {
                id: orderId,
                cusId: cusId,
                status: 3
            }
        });

        if (!order) {
            return {
                EM: "Đơn hàng không thể xác nhận! Refresh lại trang để cập nhật!",
                EC: 1,
                DT: ""
            };
        }

        order.status = 4;
        await order.save();

        return {
            EM: "Xác nhận đơn hàng thành công!",
            EC: 0,
            DT: ""
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

module.exports = {
    getMyOrders,
    cancelOrder,
    confirmReceivedOrder,
}