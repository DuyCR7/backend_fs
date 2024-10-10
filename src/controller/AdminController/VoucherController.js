import voucherService from "../../services/AdminServices/VoucherService";

const handleCreateVoucher = async (req, res) => {
    const { 
        code, 
        discountType, 
        discountValue, 
        maxDiscountAmount, 
        minOrderValue, 
        startDate, 
        endDate, 
        usageLimit 
    } = req.body;

    // console.log("code", typeof code);
    // console.log("discountType", discountType);
    // console.log("discountValue", discountValue);
    // console.log("maxDiscountAmount", maxDiscountAmount);
    // console.log("minOrderValue", minOrderValue);
    // console.log("startDate", startDate);
    // console.log("endDate", endDate);
    // console.log("usageLimit", usageLimit);

    if(!code || !code.trim()) {
        return res.status(400).json({
            EM: "Vui lòng nhập mã code giảm giá",
            EC: 1,
            DT: 'code',
        })
    }

    if (discountType === "fixed") {
        if (!discountValue || discountValue <= 0) {
            return res.status(400).json({
                EM: "Giá trị giảm phải lớn hơn 0",
                EC: 1,
                DT: 'discountValue',
            });
        }
    } else if (discountType === "percentage") {
        if (!discountValue || discountValue <= 0 || discountValue > 100) {
            return res.status(400).json({
                EM: "Giá trị giảm phải trong khoảng từ 1 đến 100",
                EC: 1,
                DT: 'discountValue',
            });
        }
        if (!maxDiscountAmount || maxDiscountAmount <= 0) {
            return res.status(400).json({
                EM: "Giá trị giảm tối đa phải lớn hơn 0",
                EC: 1,
                DT: 'maxDiscountAmount',
            });
        }
    } else {
        return res.status(400).json({
            EM: "Loại giảm giá không hợp lệ",
            EC: 1,
            DT: 'discountType',
        });
    }

    if (!minOrderValue || minOrderValue <= 0) {
        return res.status(400).json({
            EM: "Giá trị đơn hàng tối thiểu phải lớn hơn 0",
            EC: 1,
            DT: 'minOrderValue',
        });
    }

    if (!req.body.startDate) {
        return res.status(400).json({
            EM: "Vui lòng chọn ngày bắt đầu",
            EC: 1,
            DT:'startDate',
        });
    }

    if (!req.body.endDate) {
        return res.status(400).json({
            EM: "Vui lòng chọn ngày kết thúc",
            EC: 1,
            DT: 'endDate',
        });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
        return res.status(200).json({
            EM: "Ngày kết thúc phải sau ngày bắt đầu",
            EC: 1,
            DT: 'endDate',
        });
    }

    if (!usageLimit || usageLimit <= 0) {
        return res.status(400).json({
            EM: "Giới hạn sử dụng phải lớn hơn 0",
            EC: 1,
            DT: 'usageLimit',
        });
    }

    let dataVoucher = {
        code,
        discountType,
        discountValue,
        maxDiscountAmount,
        minOrderValue,
        startDate,
        endDate,
        usageLimit,
    }

    try {
        // create
        let data = await voucherService.createVoucher(dataVoucher);

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

const handleGetVoucher = async (req, res) => {
    try {
        let search = req.query.search || "";
        let sortConfig = req.query.sort ? JSON.parse(req.query.sort) : {key: 'id', direction: 'DESC'};
        let page = req.query.page
        let limit = req.query.limit
            
        let data = await voucherService.getVouchersWithPagination(+page, +limit, search, sortConfig);

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

const handleUpdateVoucher = async (req, res) => {
    const { 
        id,
        code, 
        discountType, 
        discountValue, 
        maxDiscountAmount, 
        minOrderValue, 
        startDate, 
        endDate, 
        usageLimit 
    } = req.body;

    // console.log("code", typeof code);
    // console.log("discountType", discountType);
    // console.log("discountValue", discountValue);
    // console.log("maxDiscountAmount", maxDiscountAmount);
    // console.log("minOrderValue", minOrderValue);
    // console.log("startDate", startDate);
    // console.log("endDate", endDate);
    // console.log("usageLimit", usageLimit);

    if(!code || !code.trim()) {
        return res.status(400).json({
            EM: "Vui lòng nhập mã code giảm giá",
            EC: 1,
            DT: 'code',
        })
    }

    if (discountType === "fixed") {
        if (!discountValue || discountValue <= 0) {
            return res.status(400).json({
                EM: "Giá trị giảm phải lớn hơn 0",
                EC: 1,
                DT: 'discountValue',
            });
        }
    } else if (discountType === "percentage") {
        if (!discountValue || discountValue <= 0 || discountValue > 100) {
            return res.status(400).json({
                EM: "Giá trị giảm phải trong khoảng từ 1 đến 100",
                EC: 1,
                DT: 'discountValue',
            });
        }
        if (!maxDiscountAmount || maxDiscountAmount <= 0) {
            return res.status(400).json({
                EM: "Giá trị giảm tối đa phải lớn hơn 0",
                EC: 1,
                DT: 'maxDiscountAmount',
            });
        }
    } else {
        return res.status(400).json({
            EM: "Loại giảm giá không hợp lệ",
            EC: 1,
            DT: 'discountType',
        });
    }

    if (!minOrderValue || minOrderValue <= 0) {
        return res.status(400).json({
            EM: "Giá trị đơn hàng tối thiểu phải lớn hơn 0",
            EC: 1,
            DT: 'minOrderValue',
        });
    }

    if (!req.body.startDate) {
        return res.status(400).json({
            EM: "Vui lòng chọn ngày bắt đầu",
            EC: 1,
            DT:'startDate',
        });
    }

    if (!req.body.endDate) {
        return res.status(400).json({
            EM: "Vui lòng chọn ngày kết thúc",
            EC: 1,
            DT: 'endDate',
        });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
        return res.status(400).json({
            EM: "Ngày kết thúc phải sau ngày bắt đầu",
            EC: 1,
            DT: 'endDate',
        });
    }

    if (!usageLimit || usageLimit <= 0) {
        return res.status(400).json({
            EM: "Giới hạn sử dụng phải lớn hơn 0",
            EC: 1,
            DT: 'usageLimit',
        });
    }

    let dataVoucher = {
        id,
        code,
        discountType,
        discountValue,
        maxDiscountAmount,
        minOrderValue,
        startDate,
        endDate,
        usageLimit,
    }

    try {
        let data = await voucherService.updateVoucher(dataVoucher);

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

const handleSetActive = async (req, res) => {
    try {
        let id = req.body.id;
        
        let data = await voucherService.setActiveVoucher(id);

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
  handleCreateVoucher,
  handleGetVoucher,
  handleUpdateVoucher,
  handleSetActive,
};