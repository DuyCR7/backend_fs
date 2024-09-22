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
                                        include: [
                                            {
                                                model: db.Review,
                                                where: {
                                                    cusId: cusId
                                                },
                                                required: false,
                                            }
                                        ]
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

const submitReview = async (productId, cusId, rating, comment) => {
    try {
        let hasReviewed = await db.Review.findOne({
            where: {
                productId: productId,
                cusId: cusId
            }
        });

        if (hasReviewed) {
            return {
                EM: "Bạn đã đánh giá sản phẩm này rồi!",
                EC: 1,
                DT: ""
            };
        }

        const review = await db.Review.create({
            productId: productId,
            cusId: cusId,
            rating: rating,
            comment: comment
        });

        return {
            EM: "Đánh giá sản phẩm thành công!",
            EC: 0,
            DT: review
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

const updateReview = async (reviewId, cusId, rating, comment) => {
    try {
        const review = await db.Review.findOne({
            where: {
                id: reviewId,
                cusId: cusId
            }
        });

        if (!review) {
            return {
                EM: "Không tìm thấy đánh giá!",
                EC: 1,
                DT: ""
            };
        }

        if (review.isUpdated) {
            return {
                EM: "Bạn đã sửa đánh giá này rồi và không thể sửa lại!",
                EC: 2,
                DT: ""
            };
        }

        const updatedReview = await review.update({
            rating: rating,
            comment: comment,
            isUpdated: true
        });

        return {
            EM: "Cập nhật đánh giá thành công!",
            EC: 0,
            DT: updatedReview
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
    submitReview,
    updateReview,
}