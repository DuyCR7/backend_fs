import db from "../../models/index";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import sendEmail from "../../utils/sendEmail";

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
            const phoneRegex = /^0\d{9}$/;
            if (!phoneRegex.test(phone)) {
                return {
                    EM: "Vui lòng nhập số điện thoại hợp lệ!",
                    EC: 1,
                    DT: "",
                }
            }
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

const salt = bcrypt.genSaltSync(10);

const hashUserPassword = (userPassword) => {
  let hashPassword = bcrypt.hashSync(userPassword, salt);
  return hashPassword;
};


const changePassword = async (userId, oldPassword, newPassword, confirmPassword) => {
    try {
        const user = await db.User.findByPk(userId);
        if (!user) {
            return {
                EM: "Lỗi, vui lòng thử lại sau!",
                EC: -1,
                DT: "",
            };
        }

        if (!bcrypt.compareSync(oldPassword, user.password)) {
            return {
                EM: "Mật khẩu cũ không chính xác!",
                EC: 1,
                DT: "oldPassword",
            };
        }

        const hashNewPassword = hashUserPassword(newPassword);
        user.password = hashNewPassword;

        await user.save();

        const emailContent = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thay đổi mật khẩu tài khoản quản trị</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
                .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                .header { text-align: center; padding: 20px 0; }
                .content { padding: 20px 0; }
                .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Thay đổi mật khẩu tài khoản quản trị</h1>
                </div>
                <div class="content">
                    <p>Bạn đã thay đổi mật khẩu tài khoản quản trị thành công.</p>
                    <strong>Đây là mật khẩu mới của bạn! Hãy tránh để lộ thông tin!</strong>
                    <div style="text-align: center;">
                        <b>Mật khẩu mới: </b>${newPassword}
                    </div>
                </div>
                <div class="footer">
                    <p>© 2024 Seven Shop</p>
                </div>
            </div>
        </body>
        </html>
        `;

        await sendEmail(user.email, "Thay đổi mật khẩu tài khoản quản trị", emailContent);

        return {
            EM: "Thay đổi mật khẩu thành công!",
            EC: 0,
            DT: "",
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
    changePassword,
}