require("dotenv").config();
import db from "../../models/index";
import bcrypt from "bcryptjs";
// import { getGroupWithRoles } from "./JWTService";
import { createJWT, refreshJWT } from "../../middleware/jwtAction";

const salt = bcrypt.genSaltSync(10);

const checkPassword = (inputPassword, hashPassword) => {
  return bcrypt.compareSync(inputPassword, hashPassword); // true or false
};

const signInUser = async (email, password) => {
  try {
    let user = await db.User.findOne({
      where: {
        email: email,
      },
    });

    // console.log("Check user js object: ", user.get({ plain: true}));
    // console.log("Check user sequelize object: ", user);
    if (user) {
      let isPasswordCorrect = checkPassword(
        password,
        user.password
      );
      if (isPasswordCorrect) {
        // let groupWithRoles = await getGroupWithRoles(user);
        let payload = {
          id: user.id,
          email: user.email,
          username: user.username,
        //   groupWithRoles,
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
            // groupWithRoles,
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

const getUserById = async (id) => {
    try {
      let user = await db.User.findOne({
        where: {
          id: id
        },
        attributes: ['id', 'email', 'username', 'phone','sex', 'address', 'image']
      });
  
      if (user) {
        return {
          EM: "Lấy thông tin người dùng dựa vào id thành công!",
          EC: 0,
          DT: user,
        };
      }
  
      return {
        EM: "Không tìm thấy người dùng!",
        EC: 1,
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
    signInUser,
    getUserById
};
