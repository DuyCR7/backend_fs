require("dotenv").config();
import db from "../../models/index";
import bcrypt from "bcryptjs";
// import { getGroupWithRoles } from "./JWTService";
import { createJWT, refreshJWT } from "../../middleware/jwtAction";

const salt = bcrypt.genSaltSync(10);

const checkPassword = (inputPassword, hashPassword) => {
  return bcrypt.compareSync(inputPassword, hashPassword); // true or false
};

const getRolesAndPermissions = async (userId) => {
  try {
    let user = await db.User.findByPk(userId, {
      include: [
        {
          model: db.Role,
          through: { model: db.User_Role, attributes: [] },
          include: [
            {
              model: db.Permission,
              through: { model: db.Role_Permission, attributes: [] },
            }
          ]
        }
      ]
    });

    const rolesAndPermissions = user.Roles.map(role => ({
      roleName: role.name,
      permissions: role.Permissions.map(permission => permission.url),
    }));

    return rolesAndPermissions ? rolesAndPermissions : [];

  } catch (e) {
    console.error(e);
  }
}

const signInUser = async (email, password) => {
  try {
    let user = await db.User.findOne({
      where: {
        email: email,
      },
    });

    if (user) {
      if (!user.isActive) {
        return {
          EM: "Tài khoản đã bị khoá!",
          EC: -1,
          DT: "",
        };
      }

      let isPasswordCorrect = checkPassword(
        password,
        user.password
      );
      if (isPasswordCorrect) {
        // let groupWithRoles = await getGroupWithRoles(user);
        let rolesAndPermissions = await getRolesAndPermissions(user.id);
        let payload = {
          id: user.id,
          email: user.email,
          username: user.username,
          rolesAndPermissions: rolesAndPermissions
        };

        // let token
        let token = createJWT(payload);
        let refresh_token = refreshJWT(payload);

        return {
          EM: "Đăng nhập thành công!",
          EC: 0,
          DT: {
            access_token: token,
            refresh_token: refresh_token,
            rolesAndPermissions: rolesAndPermissions,
            id: user.id,
            email: user.email,
            username: user.username,
            image: user.image,
          },
        };
      }
    }

    return {
      EM: "Email hoặc mật khẩu không đúng!",
      EC: -1,
      DT: "",
    };
  } catch (e) {
    console.log(e);
    return {
      EM: "Lỗi, vui lòng thử lại sau!",
      EC: -1,
    };
  }
};

module.exports = {
    signInUser,
};
