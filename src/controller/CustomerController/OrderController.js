import orderService from "../../services/CustomerServices/OrderService";

const handleGetMyOrders = async (req, res) => {
    try {
        const cusId = req.user.id;

        let data = await orderService.getMyOrders(cusId);

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
}