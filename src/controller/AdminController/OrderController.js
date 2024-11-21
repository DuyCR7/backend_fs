import orderService from "../../services/AdminServices/OrderService";

const handleGetOrder = async (req, res) => {
    try {
        let search = req.query.search || "";
        let sortConfig = req.query.sort ? JSON.parse(req.query.sort) : {key: 'id', direction: 'DESC'};
        let statuses = req.query.statuses ? JSON.parse(req.query.statuses) : [];

        let page = req.query.page;
        let limit = req.query.limit;

        let data = await orderService.getOrdersWithPagination(+page, +limit, search, sortConfig, statuses);

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

const handleUpdateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const { newStatus } = req.body;
            
        if (!newStatus) {
            return res.status(400).json({
                EM: "Thiếu thông tin trạng thái mới!",
                EC: 1,
                DT: ""
            });
        }

        let data = await orderService.updateOrderStatus(orderId, newStatus);
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
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
    handleGetOrder,
    handleUpdateOrderStatus,
}