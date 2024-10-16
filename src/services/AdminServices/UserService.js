import db from "../../models/index";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import sendEmail from "../../utils/sendEmail";
import { io } from "../../server";

const salt = bcrypt.genSaltSync(10);

const hashUserPassword = (userPassword) => {
  let hashPassword = bcrypt.hashSync(userPassword, salt);
  return hashPassword;
};

const getAllRoles = async () => {
  try {
    let roles = await db.Role.findAll({
      attributes: ["id", "name"],
      where: {
        id: { [Op.ne]: 9 }
      }
    });
    return {
      EM: "Lấy danh sách quyền thành công!",
      EC: 0,
      DT: roles,
    };
  } catch (e) {
    console.log(e);
    return {
      EM: "Lỗi, vui lòng thử lại sau!",
      EC: -1,
    };
  }
};

const createUser = async (dataUser) => {
  try {
    const existsEmail = await db.User.findOne({
      where: { email: dataUser.email },
    });
    if (existsEmail) {
      return {
        EM: "Email đã tồn tại!",
        EC: -1,
        DT: "",
      };
    }

    const existsPhone = await db.User.findOne({
      where: { phone: dataUser.phone },
    });
    if (existsPhone) {
      return {
        EM: "Số điện thoại đã tồn tại!",
        EC: -1,
        DT: "",
      };
    }

    const existsUsername = await db.User.findOne({
      where: { username: dataUser.username },
    });
    if (existsUsername) {
      return {
        EM: "Tên người dùng đã tồn tại!",
        EC: -1,
        DT: "",
      };
    }

    let hashPassword = hashUserPassword(dataUser.password);

    let user = await db.User.create({
      email: dataUser.email,
      phone: dataUser.phone,
      username: dataUser.username,
      password: hashPassword,
      image: dataUser.image,
    });

    console.log("Role", typeof dataUser.roles);
    console.log("User created", dataUser.roles);

    const rolesToAssign = dataUser.roles.map((roleId) => ({
      userId: user.id,
      roleId: +roleId,
    }));

    console.log("Roles to assign", rolesToAssign);

    await db.User_Role.bulkCreate(rolesToAssign);

    const emailContent = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thông tin tài khoản quản trị của bạn</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
                .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                .header { text-align: center; padding: 20px 0; }
                .content { padding: 20px 0; }
                .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: #ffffff; text-decoration: none; border-radius: 5px; }
                .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Thông tin tài khoản quản trị của bạn</h1>
                </div>
                <div class="content">
                    <p>Chào mừng bạn đến với cửa hàng của chúng tôi!</p>
                    <p>Cảm ơn và chào mừng bạn đã gia nhập công ty của chúng tôi. Dưới đây là thông tin truy cập hệ thống quản trị của bạn:</p>
                    <div style="text-align: center;">
                      <div>
                        <b>Link truy cập: </b>http://localhost:3000/admin
                      </div>
                      <div>
                        <b>Email: </b>${user.email}
                      </div>
                      <div>
                        <b>Mật khẩu: </b>${dataUser.password}</br>
                      </div>
                    </div>
                </div>
                <div class="footer">
                    <p>© 2024 CR7 Shop. Tất cả các quyền được bảo lưu.</p>
                </div>
            </div>
        </body>
        </html>
        `;

    await sendEmail(user.email, "Thông tin tài khoản quản trị của bạn", emailContent);

    return {
      EM: "Thêm mới admin thành công! Đã gửi email đến cho admin.",
      EC: 0,
      DT: user,
    };
  } catch (e) {
    console.log(e);
    return {
      EM: "Lỗi, vui lòng thử lại sau!",
      EC: -1,
      DT: "",
    };
  }
};

const getUsersWithPagination = async (page, limit, search, sortConfig, userId) => {
  try {
    let offset = (page - 1) * limit;
    let order = [[sortConfig.key, sortConfig.direction]];

    const whereClause = {
      [Op.and]: [
        {
          id: { [Op.ne]: userId },
        },
        {
          [Op.or]: [
            { email: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } },
          ],
        }
      ]
    };

    const { count, rows } = await db.User.findAndCountAll({
      where: whereClause,
      attributes: ["id", "email", "phone", "image", "isActive"],
      order: order,
      offset: offset,
      limit: limit,
      include: [
        {
          model: db.Role,
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
    });

    let data = {
      totalRows: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      users: rows,
    };

    return {
      EM: "Lấy thông tin admin thành công!",
      EC: 0,
      DT: data,
    };
  } catch (e) {
    console.log(e);
    return {
      EM: "Lỗi, vui lòng thử lại sau!",
      EC: -1,
      DT: "",
    };
  }
};

const getUserById = async (id) => {
  try {
    let user = await db.User.findOne({
      where: {
        id: id,
      },
    });

    if (user) {
      return {
        EM: `Lấy thông tin admin thành công!`,
        EC: 0,
        DT: user,
      };
    } else {
      return {
        EM: "Không tìm thấy admin!",
        EC: 1,
        DT: "",
      };
    }
  } catch (e) {
    console.log(e);
    return {
      EM: "Lỗi, vui lòng thử lại sau!",
      EC: -1,
      DT: "",
    };
  }
};

const updateUser = async (dataUser) => {
  try {
    let user = await db.User.findOne({
      where: {
        id: dataUser.id,
      },
    });

    if (user) {
      let checkEmailExists = await db.User.findAll({
        where: {
          email: dataUser.email,
          id: { [Op.not]: dataUser.id },
        },
      });

      if (checkEmailExists.length > 0) {
        return {
          EM: "Email đã tồn tại!",
          EC: -1,
          DT: "",
        };
      }

      let hashPassword = hashUserPassword("12345678");

      await user.update({
        email: dataUser.email,
        image: dataUser.image,
        password: hashPassword
      });

      await db.User_Role.destroy({
        where: { userId: user.id },
      });

      console.log("Role", typeof dataUser.roles);
      console.log("User created", dataUser.roles);

      const rolesToAssign = dataUser.roles.map((roleId) => ({
        userId: user.id,
        roleId: +roleId,
      }));

      console.log("Roles to assign", rolesToAssign);

      await db.User_Role.bulkCreate(rolesToAssign);

      const emailContent = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cập nhật thông tin tài khoản quản trị của bạn</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
                .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                .header { text-align: center; padding: 20px 0; }
                .content { padding: 20px 0; }
                .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: #ffffff; text-decoration: none; border-radius: 5px; }
                .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Cập nhật thông tin tài khoản quản trị của bạn</h1>
                </div>
                <div class="content">
                    <p>Chào mừng bạn đến với cửa hàng của chúng tôi!</p>
                    <p>Cảm ơn và chào mừng bạn đã gia nhập công ty của chúng tôi. Dưới đây là thông tin cập nhật tài khoản truy cập hệ thống quản trị của bạn:</p>
                    <div style="text-align: center;">
                      <div>
                        <b>Link truy cập: </b>http://localhost:3000/admin
                      </div>
                      <div>
                        <b>Email: </b>${dataUser.email}
                      </div>
                      <div>
                        <b>Mật khẩu: </b>12345678</br>
                      </div>
                    </div>
                </div>
                <div class="footer">
                    <p>© 2024 CR7 Shop. Tất cả các quyền được bảo lưu.</p>
                </div>
            </div>
        </body>
        </html>
        `;

    await sendEmail(dataUser.email, "Cập nhật thông tin tài khoản quản trị của bạn", emailContent);

      return {
        EM: "Cập nhật thông tin admin thành công! Đã gửi email đến cho admin.",
        EC: 0,
        DT: user,
      };
    }
  } catch (e) {
    console.log(e);
    return {
      EM: "Lỗi, vui lòng thử lại sau!",
      EC: -1,
      DT: "",
    };
  }
};

const setActiveUser = async (id) => {
  try {
    let user = await db.User.findOne({
      where: {
        id: id,
      },
    });

    if (user) {
      if (user.isActive) {
        await user.update({ isActive: false });
        io.emit('lockUser', { id });
        return {
          EM: "Đã khóa tài khoản admin!",
          EC: 0,
          DT: user,
        };
      } else {
        await user.update({ isActive: true });
        return {
          EM: "Đã mở khóa tài khoản admin!",
          EC: 0,
          DT: user,
        };
      }
    } else {
      return {
        EM: "Không tìm thấy admin!",
        EC: 1,
        DT: "",
      };
    }
  } catch (e) {
    console.log(e);
    return {
      EM: "Lỗi, vui lòng thử lại sau!",
      EC: -1,
      DT: "",
    };
  }
};

module.exports = {
  getAllRoles,
  createUser,
  getUsersWithPagination,
  getUserById,
  updateUser,
  setActiveUser,
};
