import db from "../../models/index";
import { Op } from "sequelize";

const getProfile = async (userId) => {
    try {
        const user = await db.User.findByPk(userId, {
            attributes: ['id', 'email', 'username', 'address', 'phone', 'sex', 'birthdate', 'image']
        });

        if (!user) {
            return {
                EM: "Không tìm thấy thông tin!",
                EC: 1,
                DT: "",
            };
        }

        return {
            EM: "Lấy thông tin thành công!",
            EC: 0,
            DT: user,
        };
    } catch (e) {
        console.log(e);
        return {
          EM: "Lỗi, vui lòng thử lại sau!",
          EC: -1,
        };
    }
}

const updateProfile = async (userId, address, username, phone, sex, birthdate, image) => {
    try {
        if (username) {
            const existsUsername = await db.User.findOne({
                where: {
                    username: username,
                    id: {
                        [Op.ne]: userId,
                    }
                },
            });

            if (existsUsername) {
                return {
                    EM: "Tên người dùng đã tồn tại!",
                    EC: 1,
                    DT: "",
                };
            }
        }

        if (phone) {
            const existsPhone = await db.User.findOne({
                where: {
                    phone: phone,
                    id: {
                        [Op.ne]: userId,
                    }
                },
            });

            if (existsPhone) {
                return {
                    EM: "Số điện thoại đã tồn tại!",
                    EC: 1,
                    DT: "",
                };
            }
        }

        const user = await db.User.findByPk(userId);
        if (!user) {
            return {
                EM: "Không tìm thấy người dùng!",
                EC: 1,
                DT: "",
            };
        }

        if (address) user.address = address;
        if (username) user.username = username;
        if (phone) user.phone = phone;
        if (sex) user.sex = sex;
        if (birthdate) user.birthdate = new Date(birthdate);
        if (image) user.image = image;

        await user.save();

        return {
            EM: "Cập nhật thông tin thành công!",
            EC: 0,
            DT: {
                id: user.id,
                email: user.email,
                username: user.username,
                address: user.address,
                phone: user.phone,
                sex: user.sex,
                birthdate: user.birthdate,
                image: user.image,
            },
        };

    } catch (e) {
        console.log(e);
        return {
          EM: "Lỗi, vui lòng thử lại sau!",
          EC: -1,
        };
    }
}

module.exports = {
    getProfile,
    updateProfile,
}