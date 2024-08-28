import cartService from "../../services/CustomerServices/CartService";

const handleAddToCart = async (req, res) => {
    try {
        const { productId, productDetailId, quantity } = req.body;
        const cusId = req.user.id;

        let data = await cartService.addToCart(cusId, productId, productDetailId, quantity);

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: data.DT,   // data
        });
    
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

const handleGetCount = async (req, res) => {
    try {
        const cusId = req.user.id;

        let data = await cartService.getCount(cusId);

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: data.DT,   // data
        });
    
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

const handleGetCart = async (req, res) => {
    try {
        const cusId = req.user.id;

        let data = await cartService.getCart(cusId);

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: data.DT,   // data
        });
    
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

const handleUpdateCartItemQuantity = async (req, res) => {
    try {
        const cusId = req.user.id;
        const { cartDetailId, newQuantity } = req.body;

        let data = await cartService.updateCartItemQuantity(cusId, cartDetailId, newQuantity);

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: data.DT,   // data
        });
    
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

const handleDeleteCartItem = async (req, res) => {
    try {
        const cusId = req.user.id;

        let data = await cartService.deleteCartItem(cusId, req.body.cartDetailId);

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: data.DT,   // data
        });
    
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

const handleGetRelatedProducts = async (req, res) => {
    try {
        const cusId = req.user.id;

        let data = await cartService.getRelatedProducts(cusId);

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: data.DT,   // data
        });
    
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

module.exports = {
    handleAddToCart,
    handleGetCount,
    handleGetCart,
    handleUpdateCartItemQuantity,
    handleDeleteCartItem,
    handleGetRelatedProducts,
}