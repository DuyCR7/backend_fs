import wishListService from "../../services/CustomerServices/WishListService";

const handleAddToWishList = async (req, res) => {
    try {
        const { productId } = req.body;
        const cusId = req.user.id;

        let data = await wishListService.addToWishList(cusId, productId);

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
        const cusId = req.query.cusId;

        let data = await wishListService.getCount(cusId);

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

const handleGetWishList = async (req, res) => {
    try {
        const cusId = req.query.cusId;

        let data = await wishListService.getWishList(cusId);

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

const handleDeleteWishListItem = async (req, res) => {
    try {
        const cusId = req.body.cusId;
        const productId = req.body.productId;

        let data = await wishListService.deleteWishListItem(cusId, productId);

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
    handleAddToWishList,
    handleGetCount,
    handleGetWishList,
    handleDeleteWishListItem,
}