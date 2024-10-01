import db from "../../models/index";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import sendEmail from "../../utils/sendEmail";
import crypto from "crypto";

const getProfile = async (cusId) => {
    try {
        const customer = await db.Customer.findByPk(cusId, {
            attributes: ['id', 'email', 'username', 'fullname', 'phone', 'sex', 'birthdate', 'image']
        });

        if (!customer) {
            return {
                EM: "Không tìm thấy khách hàng!",
                EC: 1,
                DT: "",
            };
        }

        return {
            EM: "Lấy thông tin khách hàng thành công!",
            EC: 0,
            DT: customer,
        };
    } catch (e) {
        console.log(e);
        return {
          EM: "Lỗi, vui lòng thử lại sau!",
          EC: -1,
        };
    }
}

const sendVerifycationCode = async (cusId, email) => {
    try {
        const existsEmail = await db.Customer.findAll({
            where: {
                email: email,
                id: {
                    [Op.ne]: cusId,
                }
            },
        });

        if (existsEmail.length > 0) {
            return {
                EM: "Email đã tồn tại!",
                EC: 1,
                DT: "",
            };
        }

        const verificationCode = crypto.randomBytes(3).toString("hex").toUpperCase();
        const token = await db.Token.create({
            cusId: cusId,
            token: crypto.randomBytes(32).toString("hex"),
            email: email,
            verification_code: verificationCode,
            expiresAt: new Date(Date.now() + 60 * 1000)
        });

        const emailContent = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Xác nhận tài khoản Email mới</title>
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
                    <h1>Xác nhận tài khoản Email của bạn</h1>
                </div>
                <div class="content">
                    <p>Dưới đây là mã xác nhận tài khoản email mới của bạn</p>
                    <strong>Mã xác nhận sẽ hết hạn trong vòng 1 phút</strong>
                    <p style="text-align: center;">
                        ${verificationCode}
                    </p>
                </div>
                <div class="footer">
                    <p>© 2024 CR7 Shop. Tất cả các quyền được bảo lưu.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        await sendEmail(token.email, "Xác nhận tài khoản Email mới", emailContent);

        return {
            EM: "Truy cập email để lấy mã xác nhận! Mã xác nhận sẽ hết hạn trong vòng 1 phút.",
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

const updateProfileEmail = async (cusId, email, verificationCode) => {
    try {
        const token = await db.Token.findOne({
            where: {
                cusId: cusId,
                email: email,
                isVerified: false,
                expiresAt: {
                    [Op.gt]: new Date(),
                },
            },
            order: [['createdAt', 'DESC']],
        });

        if (!token) {
            return {
                EM: "Mã xác nhận không hợp lệ hoặc đã hết hạn!",
                EC: 1,
                DT: "",
            };
        }

        if (token.verification_code !== verificationCode) {
            return {
                EM: "Mã xác nhận không chính xác!",
                EC: 1,
                DT: "",
            };
        }

        await db.Customer.update({
            email: email,
        }, {
            where: {
                id: cusId,
            },
        });

        await token.update({
            isVerified: true,
        });

        await db.Token.update({
            expiresAt: new Date(),
        }, {
            where: {
                cusId: cusId,
                email: email,
                isVerified: false,
                id: {
                    [Op.ne]: token.id,
                },
            },
        });

        return {
            EM: "Cập nhật email thành công!",
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

const updateProfile = async (cusId, fullname, username, phone, sex, birthdate, image) => {
    try {
        if (username) {
            const existsUsername = await db.Customer.findOne({
                where: {
                    username: username,
                    id: {
                        [Op.ne]: cusId,
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
            const existsPhone = await db.Customer.findOne({
                where: {
                    phone: phone,
                    id: {
                        [Op.ne]: cusId,
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

        const customer = await db.Customer.findByPk(cusId);
        if (!customer) {
            return {
                EM: "Không tìm thấy người dùng!",
                EC: 1,
                DT: "",
            };
        }

        if (fullname) customer.fullname = fullname;
        if (username) customer.username = username;
        if (phone) customer.phone = phone;
        if (sex) customer.sex = sex;
        if (birthdate) customer.birthdate = new Date(birthdate);
        if (image) customer.image = image;

        await customer.save();

        return {
            EM: "Cập nhật thông tin thành công!",
            EC: 0,
            DT: {
                id: customer.id,
                email: customer.email,
                username: customer.username,
                fullname: customer.fullname,
                phone: customer.phone,
                sex: customer.sex,
                birthdate: customer.birthdate,
                image: customer.image,
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

const changePassword = async (cusId, oldPassword, newPassword, confirmPassword) => {
    try {
        const customer = await db.Customer.findByPk(cusId);
        if (!customer) {
            return {
                EM: "Lỗi, vui lòng thử lại sau!",
                EC: -1,
                DT: "",
            };
        }

        if (!bcrypt.compareSync(oldPassword, customer.password)) {
            return {
                EM: "Mật khẩu cũ không chính xác!",
                EC: 1,
                DT: "oldPassword",
            };
        }

        const hashNewPassword = hashUserPassword(newPassword);
        customer.password = hashNewPassword;

        await customer.save();

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
    sendVerifycationCode,
    updateProfileEmail,
    updateProfile,
    changePassword,
}