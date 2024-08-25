import db from "../../models/index";
import { Op } from "sequelize";

const addToCart = async (cusId, productId, productDetailId, quantity) => {
    try {
        const productDetail = await db.Product_Detail.findByPk(productDetailId, {
            include: [
                { model: db.Color },
                { model: db.Size },
                { model: db.Product, attributes: ['name'] }
            ]
        });
        if (!productDetail || productDetail.quantity < quantity) {
            return {
                EM: productDetail.quantity === 0 ?
                    `Sản phẩm ${productDetail.Product.name} với size ${productDetail.Size.code} và màu ${productDetail.Color.name} đã hết hàng!`
                    :
                    `Sản phẩm ${productDetail.Product.name} với size ${productDetail.Size.code} và màu ${productDetail.Color.name} không đủ số lượng sẵn có!`,
                EC: 1,
                DT: ""
            }
        }

        let cart = await db.Cart.findOne({
            where: {
                cusId: cusId,
            }
        });

        if (!cart) {
            cart = await db.Cart.create({
                cusId: cusId,
            });
        }

        let cartDetail = await db.Cart_Detail.findOne({
            where: {
                cartId: cart.id,
                productId: productId,
                productDetailId: productDetailId,
            }
        });

        if (!cartDetail) {
            cartDetail = await db.Cart_Detail.create({
                cartId: cart.id,
                productId: productId,
                productDetailId: productDetailId,
                quantity: quantity,
            });
        } else {
            if (cartDetail.quantity + quantity > productDetail.quantity) {
                return {
                    EM: productDetail.quantity - cartDetail.quantity > 0 ? 
                        `Hiện trong giỏ hàng đã có ${cartDetail.quantity} sản phẩm loại này! Chỉ có thể thêm tối đa ${productDetail.quantity - cartDetail.quantity} sản phẩm`
                        :
                        `Hiện trong giỏ hàng đã có cả ${cartDetail.quantity} sản phẩm loại này!`,
                    EC: 1,
                    DT: ""
                }
            }

            cartDetail.quantity += quantity;
            await cartDetail.save();
        }

        let count = await db.Cart_Detail.count({
            where: {
                cartId: cart.id,
            }
        });

        return {
            EM: "Thêm vào giỏ hàng thành công!",
            EC: 0,
            DT: count
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

const getCount = async (cusId) => {
    try {
        let cart = await db.Cart.findOne({
            where: {
                cusId: cusId,
            }
        });

        if (!cart) {
            return {
                EM: "Số lượng sản phầm trong giỏ hàng là 0!",
                EC: 1,
                DT: 0,
            };
        } else {
            let count = await db.Cart_Detail.count({
                where: {
                    cartId: cart.id,
                }
            });

            return {
                EM: `Số lượng sản phầm trong giỏ hàng là ${count}!`,
                EC: 0,
                DT: count,
            };
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
    addToCart,
    getCount,
}