import checkOutService from "../../services/CustomerServices/CheckOutService";

const handleGetAddress = async (req, res) => {
    try {
        const cusId = req.user.id;

        let data = await checkOutService.getAddress(cusId);

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

const handleAddNewAddress = async (req, res) => {
    if(!req.body.name){
        return res.status(200).json({
            EM: 'Vui lòng nhập tên!',   // error message
            EC: 1,   // error code
            DT: 'name',   // data
        })
    }
    
    if(!req.body.address){
        return res.status(200).json({
            EM: 'Vui lòng nhập địa chỉ!',   // error message
            EC: 1,   // error code
            DT: 'address',   // data
        })
    }

    if(!req.body.phone){
        return res.status(200).json({
            EM: 'Vui lòng nhập số điện thoại!',   // error message
            EC: 1,   // error code
            DT: 'phone',   // data
        })
    }

    if(!req.body.email){
        return res.status(200).json({
            EM: 'Vui lòng nhập email!',   // error message
            EC: 1,   // error code
            DT: 'email',   // data
        })
    }
    
    const cusId = req.user.id;
    let name = req.body.name;
    let address = req.body.address;
    let phone = req.body.phone;
    let email = req.body.email;
    let isDefault = req.body.isDefault;

    let dataAddress = {
        cusId: cusId,
        name: name,
        address: address,
        phone: phone,
        email: email,
        isDefault: isDefault
    }

    try {
        let data = await checkOutService.addNewAddress(dataAddress);

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

const handleUpdateAddress = async (req, res) => {
    if(!req.body.name){
        return res.status(200).json({
            EM: 'Vui lòng nhập tên!',   // error message
            EC: 1,   // error code
            DT: 'name',   // data
        })
    }
    
    if(!req.body.address){
        return res.status(200).json({
            EM: 'Vui lòng nhập địa chỉ!',   // error message
            EC: 1,   // error code
            DT: 'address',   // data
        })
    }

    if(!req.body.phone){
        return res.status(200).json({
            EM: 'Vui lòng nhập số điện thoại!',   // error message
            EC: 1,   // error code
            DT: 'phone',   // data
        })
    }

    if(!req.body.email){
        return res.status(200).json({
            EM: 'Vui lòng nhập email!',   // error message
            EC: 1,   // error code
            DT: 'email',   // data
        })
    }
    
    const cusId = req.user.id;
    let id = req.body.id;
    let name = req.body.name;
    let address = req.body.address;
    let phone = req.body.phone;
    let email = req.body.email;
    let isDefault = req.body.isDefault;

    let dataAddress = {
        cusId: cusId,
        id: id,
        name: name,
        address: address,
        phone: phone,
        email: email,
        isDefault: isDefault
    }

    try {
        let data = await checkOutService.updateAddress(dataAddress);

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

const handleDeleteAddress = async (req, res) => {
    try {
        const cusId = req.user.id;
        const addressId = req.body.addressId;
        console.log("cusId: " , cusId);
        console.log("addressId: " , req.body.addressId);

        let data = await checkOutService.deleteAddress(cusId, addressId);

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

const handleGetMyVoucher = async (req, res) => {
    try {
        const cusId = req.user.id;

        let data = await checkOutService.getMyVoucher(cusId);

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

const handleCreateOrder = async (req, res) => {
    try {
        const cusId = req.user.id;
        const { paymentMethod, shippingMethod, totalPrice, addLocation, addName, addPhone, addEmail, note, orderDetails, paypalOrderId, voucherId, appliedDiscount } = req.body;
        
        console.log("cusId", cusId);
        console.log("paymentMethod", paymentMethod);
        console.log("shippingMethod", shippingMethod);
        console.log("totalPrice", totalPrice);
        console.log("addLocation", addLocation);
        console.log("addName", addName);
        console.log("addPhone", addPhone);
        console.log("addEmail", addEmail);
        console.log("note", note);
        console.log("orderDetails", orderDetails);
        console.log("paypalOrderId", paypalOrderId);
        console.log("voucherId", voucherId);
        console.log("appliedDiscount", appliedDiscount);

        let data = await checkOutService.createOrder(cusId, paymentMethod, shippingMethod, totalPrice, addLocation, addName, addPhone, addEmail, note, orderDetails, paypalOrderId, voucherId, appliedDiscount);

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
    handleGetAddress,
    handleAddNewAddress,
    handleUpdateAddress,
    handleDeleteAddress,
    handleGetMyVoucher,
    handleCreateOrder,
}