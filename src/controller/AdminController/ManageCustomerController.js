import manageCustomerService from "../../services/AdminServices/ManageCustomerService";

const handleGetCustomer = async (req, res) => {
    try {
        let search = req.query.search || "";
        let sortConfig = req.query.sort ? JSON.parse(req.query.sort) : {key: 'id', direction: 'DESC'};

        let page = req.query.page
        let limit = req.query.limit

        let data = await manageCustomerService.getCustomersWithPagination(+page, +limit, search, sortConfig);

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

const handleLockCustomer = async (req, res) => {
    try {
        let cusId = req.body.cusId;

        let data = await manageCustomerService.lockCustomer(cusId);

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
    handleGetCustomer,
    handleLockCustomer,
}