require("dotenv").config();
import db from "../../models/index";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { createJWT, refreshJWT } from "../../middleware/jwtAction";
import sendEmail from "../../utils/sendEmail";
import crypto from "crypto";

const salt = bcrypt.genSaltSync(10);

const hashUserPassword = (userPassword) => {
  let hashPassword = bcrypt.hashSync(userPassword, salt);
  return hashPassword;
};

const checkEmailExists = async (email) => {
  let cus = await db.Customer.findOne({
    where: {
      email: email,
    },
  });

  if (cus) {
    return true;
  } else {
    return false;
  }
};

const signUpCustomer = async (rawCusData) => {
    try {
        // check email/phone number are exists
        let isEmailExists = await checkEmailExists(rawCusData.email);
        if (isEmailExists === true) {
          return {
            EM: "Email đã tồn tại!",
            EC: 1,
          };
        }
        console.log("pass", rawCusData.password);
        // hash user password
        let hashPassword = hashUserPassword(rawCusData.password);
    
        // create new customer
        let cus = await db.Customer.create({
          email: rawCusData.email,
          password: hashPassword,
          typeLogin: 'normal',
          image: "avatar.jpg"
        });

        const token = await db.Token.create({
          cusId: cus.id,
          token: crypto.randomBytes(32).toString("hex")
        });

        const url = `${process.env.REACT_URL}/cus/${cus.id}/verify/${token.token}`;
        await sendEmail(cus.email, "Xác nhận tài khoản", url);
    
        return {
          EM: "Hãy truy cập Email của bạn để xác nhận tài khoản!",
          EC: 0,
        };
      } catch (e) {
        console.log(e);
        return {
          EM: "Lỗi, vui lòng thử lại sau!",
          EC: -1,
        };
      }
};

const verifyEmail = async (id, tokenUrl) => {
  try {
    const cus = await db.Customer.findOne({
      where: {
        id: id,
      },
    });
    if (!cus) {
      return {
        EM: "Link không hợp lệ!",
        EC: -1,
      };
    }

    const token = await db.Token.findOne({
      where: {
        cusId: cus.id,
        token: tokenUrl,
      },
    });
    if (!token) {
      return {
        EM: "Link không hợp lệ!",
        EC: -1,
      };
    }

    await db.Customer.update({
      verified: true,
    }, {
      where: {
        id: cus.id,
      },
    })

    await db.Token.destroy({
      where: {
        cusId: cus.id,
      },
    });

    return {
      EM: "Email đã được xác nhận!",
      EC: 0,
    };
  } catch (e) {
    console.log(e);
    return {
      EM: "Lỗi, vui lòng thử lại sau!",
      EC: -1,
    };
  }
}

const checkPassword = (inputPassword, hashPassword) => {
    return bcrypt.compareSync(inputPassword, hashPassword); // true or false
  };

const signInCustomer = async (rawCusData) => {
    try {
        const delay = rawCusData.delay || 0;
        await new Promise((resolve) => setTimeout(resolve, delay));
    
        let cus = await db.Customer.findOne({
          where: {
            email: rawCusData.email,
          },
        });
    
        // Nếu không tìm thấy khách hàng
        if (!cus) {
          return {
            EM: "Email hoặc mật khẩu không đúng!",
            EC: 1,
            DT: "",
          };
        }

        if (cus.password === null) {
          return {
            EM: "Hãy đăng nhập tài khoản này bằng Google!",
            EC: 1,
            DT: "",
          };
        }

        // Kiểm tra mật khẩu
        let isPasswordCorrect = checkPassword(rawCusData.password, cus.password);
        if (!isPasswordCorrect) {
          return {
            EM: "Email hoặc mật khẩu không đúng!",
            EC: 1,
            DT: "",
          };
        }

        // Kiểm tra xem tài khoản đã được xác minh chưa
        if (!cus.verified) {
          let token = await db.Token.findOne({
            where: {
              cusId: cus.id,
            },
          });

          // Tạo token mới nếu không có token
          if (!token) {
            token = await db.Token.create({
              cusId: cus.id,
              token: crypto.randomBytes(32).toString("hex"),
            });
            const url = `${process.env.REACT_URL}/cus/${cus.id}/verify/${token.token}`;
            await sendEmail(cus.email, "Xác nhận tài khoản", url);
          }

          return {
            EM: "Hãy truy cập Email của bạn để xác nhận tài khoản!",
            EC: 2,
            DT: "",
          };
        }

        // Tạo payload và JWT
        let payload = {
          id: cus.id,
          email: cus.email,
        };

        let token = createJWT(payload);
        let refresh_token = refreshJWT(payload);

        return {
          EM: "Đăng nhập thành công!",
          EC: 0,
          DT: {
            access_token: token,
            refresh_token: refresh_token,
            email: cus.email,
            image: cus.image,
            typeLogin: cus.typeLogin,
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

const signInGoogle = async (id, tokenLoginGoogle) => {
  try {
    const newTokenLoginGoogle = uuidv4();
    let cus = await db.Customer.findOne({
      where: {
        googleId: id,
        tokenLoginGoogle: tokenLoginGoogle
      },
    });

    if(cus) {

      await db.Customer.update({
        tokenLoginGoogle: newTokenLoginGoogle
      }, {
        where: {
          googleId: id
        }
      })

      let payload = {
        id: cus.id,
        email: cus.email,
      };
      let token = createJWT(payload);
      let refresh_token = refreshJWT(payload);
      return {
        EM: "Đăng nhập thành công!",
        EC: 0,
        DT: {
          access_token: token,
          refresh_token: refresh_token,
          email: cus.email,
          image: cus.image,
          typeLogin: cus.typeLogin,
        },
      };
    } else {
      return {
        EM: "Lỗi, vui lòng thử lại sau!",
        EC: 1,
        DT: "",
      }
    }

  } catch (e) {
    console.log(e);
    return {
      EM: "Lỗi, vui lòng thử lại sau!",
      EC: -1,
    };
  }
}

const resetPasswordSendLink = async (email) => {
  try {
    // check email/phone number are exists
    let cus = await db.Customer.findOne({
      where: {
        email: email,
      },
    });
    
    if (!cus) {
      return {
        EM: "Email không tồn tại trong hệ thống!",
        EC: 1,
      };
    }

    if (!cus.password) {
      return {
        EM: "Hãy đăng nhập tài khoản này bằng Google!",
        EC: 1,
      };
    }

    if (cus.verified === false) {
      return {
        EM: "Vui lòng xác nhận tài khoản trước khi đặt lại mật khẩu!",
        EC: 1,
      };
    }

    let token = await db.Token.findOne({
      where: {
        cusId: cus.id,
      },
    });

    // Tạo token mới nếu không có token
    if (!token) {
      token = await db.Token.create({
        cusId: cus.id,
        token: crypto.randomBytes(32).toString("hex"),
      });
      const url = `${process.env.REACT_URL}/password-reset/${cus.id}/${token.token}`;
      await sendEmail(cus.email, "Thay đổi mật khẩu", url);
    }

    return {
      EM: "Link thay đổi mật khẩu đã được gửi đến email của bạn!",
      EC: 0,
    };
  } catch (e) {
    console.log(e);
    return {
      EM: "Lỗi, vui lòng thử lại sau!",
      EC: -1,
    };
  }
}

const resetPasswordVerify = async (id, tokenUrl) => {
  try {
    const cus = await db.Customer.findOne({
      where: {
        id: id,
      },
    });
    if (!cus) {
      return {
        EM: "Link không hợp lệ!",
        EC: -1,
      };
    }

    const token = await db.Token.findOne({
      where: {
        cusId: cus.id,
        token: tokenUrl,
      },
    });
    if (!token) {
      return {
        EM: "Link không hợp lệ!",
        EC: -1,
      };
    }

    return {
      EM: "Link hợp lệ!",
      EC: 0,
    };
  } catch (e) {
    console.log(e);
    return {
      EM: "Lỗi, vui lòng thử lại sau!",
      EC: -1,
    };
  }
} 

const resetPassword = async (id, tokenUrl, password) => {
  try {
    const cus = await db.Customer.findOne({
      where: {
        id: id,
      },
    });
    if (!cus) {
      return {
        EM: "Link không hợp lệ!",
        EC: -1,
      };
    }

    const token = await db.Token.findOne({
      where: {
        cusId: cus.id,
        token: tokenUrl,
      },
    });
    if (!token) {
      return {
        EM: "Link không hợp lệ!",
        EC: -1,
      };
    }

    let hashPassword = hashUserPassword(password);
    await db.Customer.update({
      password: hashPassword,
    }, {
      where: {
        id: cus.id,
      },
    });

    await db.Token.destroy({
      where: {
        cusId: cus.id,
      },
    });

    return {
      EM: "Thay đổi mật khẩu thành công!",
      EC: 0,
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
    signUpCustomer,
    verifyEmail,
    signInCustomer,
    signInGoogle,
    resetPasswordSendLink,
    resetPasswordVerify,
    resetPassword
}