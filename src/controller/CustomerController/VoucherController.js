import voucherService from "../../services/CustomerServices/VoucherService";

const handleGetAllVouchers = async (req, res) => {
    try {
        let page = req.query.page;
        let limit = req.query.limit;

        let data = await voucherService.getAllVouchers(+page, +limit);

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
  handleGetAllVouchers,
}