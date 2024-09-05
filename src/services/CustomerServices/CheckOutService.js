import db from "../../models/index";
import { Op } from "sequelize";

const getAddress = async (cusId) => {
    try {
        let addresses = await db.Cus_Address.findAll({
            where: {
                cusId: cusId
            },
            order: [
                ['isDefault', 'DESC'],
                ['id', 'DESC']
            ]
        });

        if (addresses) {
            return {
                EM: "Lấy thông tin địa chỉ thành công!",
                EC: 0,
                DT: addresses
            }
        } else {
            return {
                EM: "Không tìm thấy địa chỉ nào!",
                EC: -1,
                DT: []
            }
        }
    } catch (e) {
        console.log(e);
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: ""
        }
    }
}

const addNewAddress = async (dataAddress) => {
    try {
        let checkEmailPhone = await db.Cus_Address.findOne({
            where: {
                [Op.or]: [
                    { email: dataAddress.email },
                    { phone: dataAddress.phone }
                ],
                cusId: { [Op.not]: dataAddress.cusId }
            }
        });

        if (checkEmailPhone) {
            return {
                EM: "Email hoặc số điện thoại đã tồn tại!",
                EC: 1,
                DT: ""
            }
        }

        let address = await db.Cus_Address.findOne({
            where: {
                [Op.and]: [
                    { name: dataAddress.name }, 
                    { address: dataAddress.address },
                    { phone: dataAddress.phone },
                    { email: dataAddress.email },
                ],
                cusId: dataAddress.cusId
            }
        });

        if (address) {
            return {
                EM: "Thông tin địa chỉ đã tồn tại!",
                EC: 1,
                DT: ""
            }
        } else {
            if (dataAddress.isDefault) {
                await db.Cus_Address.update({ isDefault: false }, { where: { cusId: dataAddress.cusId } });
            }

            await db.Cus_Address.create(dataAddress);
            return {
                EM: "Thêm mới địa chỉ thành công!",
                EC: 0,
                DT: ""
            }
        }
    } catch (e) {
        console.log(e);
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: ""
        }
    }
}

const updateAddress = async (dataAddress) => {
    console.log("dataAddress", dataAddress.isDefault);
    try {
        let address = await db.Cus_Address.findOne({
            where: {
                id: dataAddress.id,
                cusId: dataAddress.cusId
            }
        });

        if (address) {
            let checkEmailPhone = await db.Cus_Address.findOne({
                where: {
                    [Op.or]: [
                        { email: dataAddress.email },
                        { phone: dataAddress.phone }
                    ],
                    id: { [Op.not]: dataAddress.id },
                    cusId: { [Op.not]: dataAddress.cusId }
                }
            });

            if (checkEmailPhone) {
                return {
                    EM: "Email hoặc số điện thoại đã tồn tại!",
                    EC: 1,
                    DT: ""
                }
            }

            let checkExists = await db.Cus_Address.findAll({
                where: {
                    [Op.and]: [
                        { name: dataAddress.name }, 
                        { address: dataAddress.address },
                        { phone: dataAddress.phone },
                        { email: dataAddress.email },
                        { id: { [Op.not]: dataAddress.id } }
                    ],
                    cusId: dataAddress.cusId
                }
            });

            if (checkExists.length > 0) {
                return {
                    EM: "Thông tin địa chỉ đã tồn tại!",
                    EC: 1,
                    DT: ""
                }
            } else {
                if (dataAddress.isDefault) {
                    await db.Cus_Address.update({ isDefault: false }, {
                        where: { 
                            id: { [Op.ne]: dataAddress.id },
                            cusId: dataAddress.cusId
                        }
                    });
                }

                await address.update(dataAddress);
                return {
                    EM: "Cập nhật địa chỉ thành công!",
                    EC: 0,
                    DT: ""
                }
            }
        } else {
            return {
                EM: "Địa chỉ không tồn tại!",
                EC: 1,
                DT: ""
            }
        }
    } catch (e) {
        console.log(e);
        return {
            EM: "Lỗi, vui lòng thử lại sau!",
            EC: -1,
            DT: ""
        }
    }
}

module.exports = {
    getAddress,
    addNewAddress,
    updateAddress,
}