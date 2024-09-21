import orderService from "../../services/CustomerServices/OrderService";

const handleGetMyOrders = async (req, res) => {
    try {
        const cusId = req.user.id;
        let page = req.query.page;
        let limit = req.query.limit;

        let data = await orderService.getMyOrders(cusId, +page, +limit);

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

const handleCancelOrder = async (req, res) => {
    try {
        const cusId = req.user.id;
        const orderId = req.params.orderId;

        let data = await orderService.cancelOrder(orderId, cusId);

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

const handleConfirmReceivedOrder = async (req, res) => {
    try {
        const cusId = req.user.id;
        const orderId = req.params.orderId;

        let data = await orderService.confirmReceivedOrder(orderId, cusId);

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
    handleGetMyOrders,
    handleCancelOrder,
    handleConfirmReceivedOrder,
}