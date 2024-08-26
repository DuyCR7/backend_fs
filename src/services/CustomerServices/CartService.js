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

const getCart = async (cusId) => {
    try {
        let cart = await db.Cart.findOne({
            where: {
                cusId: cusId,
            }
        });
        if (!cart) {
            return {
                EM: "Giỏ hàng của bạn chưa có sản phẩm nào!",
                EC: 1,
                DT: [],
            }
        } else {
            let cartDetails = await db.Cart_Detail.findAll({
                where: {
                    cartId: cart.id,
                },
                include: [
                    { 
                        model: db.Product_Detail, 
                        include: [
                            { 
                                model: db.Product, 
                                attributes: ['name', 'price', 'price_sale', 'isSale', 'slug'] 
                            },
                            {
                                model: db.Color, 
                                attributes: ['name']
                            },
                            { 
                                model: db.Size, 
                                attributes: ['code']
                            }
                        ] 
                    },
                ]
            });
            return {
                EM: "Lấy danh sách giỏ hàng thành công!",
                EC: 0,
                DT: cartDetails,
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

const updateCartItemQuantity = async (cartDetailId, newQuantity) => {
    try {
        let cartItem = await db.Cart_Detail.findByPk(cartDetailId, {
            include: [
                { model: db.Product_Detail },
            ]
        });

        if (!cartItem) {
            return {
                EM: "Không tìm thấy sản phẩm trong giỏ hàng!",
                EC: 1,
                DT: ""
            }
        }

        let productDetail = cartItem.Product_Detail;
        if (newQuantity > productDetail.quantity) {
            newQuantity = productDetail.quantity;
            cartItem.quantity = newQuantity;
            await cartItem.save();

            return {
                EM: `Hiện sản phẩm này chỉ có ${productDetail.quantity} sản phẩm sẵn có!`,
                EC: 2,
                DT: cartItem
            }
        }

        cartItem.quantity = newQuantity;
        await cartItem.save();

        return {
            EM: "Cập nhật số lượng sản phẩm trong giỏ hàng thành công!",
            EC: 0,
            DT: cartItem,
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

const deleteCartItem = async (cartDetailId) => {
    try {
        let cartItem = await db.Cart_Detail.findByPk(cartDetailId, {
            include: [
                { model: db.Product_Detail },
            ]
        });

        if (!cartItem) {
            return {
                EM: "Không tìm thấy sản phẩm trong giỏ hàng!",
                EC: 1,
                DT: ""
            }
        }

        const cartId = cartItem.cartId;

        await cartItem.destroy();

        let count = await db.Cart_Detail.count({
            where: {
                cartId: cartId,
            }
        });

        return {
            EM: "Xóa sản phẩm khỏi giỏ hàng thành công!",
            EC: 0,
            DT: { 
                id: cartDetailId,
                count: count,
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

module.exports = {
    addToCart,
    getCount,
    getCart,
    updateCartItemQuantity,
    deleteCartItem,
}