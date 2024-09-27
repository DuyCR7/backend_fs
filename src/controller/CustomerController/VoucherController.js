import voucherService from "../../services/CustomerServices/VoucherService";

const handleGetAllVoucherForGuest = async (req, res) => {
    try {
        let page = req.query.page;
        let limit = req.query.limit;

        let data = await voucherService.getAllVouchersForGuest(+page, +limit);

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

const handleGetAllVouchers = async (req, res) => {
    try {
        let cusId = req.user.id;
        let page = req.query.page;
        let limit = req.query.limit;

        let data = await voucherService.getAllVouchers(cusId, +page, +limit);

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

const handleSaveVoucher = async (req, res) => {
    try {
        const cusId = req.user.id;
        const voucherId = req.body.voucherId;

        let data = await voucherService.saveVoucher(cusId, voucherId);

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
    handleGetAllVoucherForGuest,
    handleGetAllVouchers,
    handleSaveVoucher,
}