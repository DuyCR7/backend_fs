require("dotenv").config();
import db from "../../models/index";
import { Op, where } from "sequelize";
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

        const verificationCode = crypto.randomBytes(3).toString("hex").toUpperCase();
        const token = await db.Token.create({
          cusId: cus.id,
          token: crypto.randomBytes(32).toString("hex"),
          email: cus.email,
          verification_code: verificationCode,
          expiresAt: new Date(Date.now() + 60 * 1000)
        });

        const verificationUrl  = `${process.env.REACT_URL}/cus/${cus.id}/verify/${token.token}`;

        const emailContent = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Xác nhận tài khoản</title>
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
                    <h1>Xác nhận tài khoản của bạn</h1>
                </div>
                <div class="content">
                    <p>Chào mừng bạn đến với cửa hàng của chúng tôi!</p>
                    <p>Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất quá trình đăng ký, vui lòng xác nhận địa chỉ email của bạn bằng cách nhấp vào nút bên dưới:</p>
                    <strong>Link xác nhận sẽ hết hạn trong vòng 1 phút</strong>
                    <p style="text-align: center;">
                        <a href="${verificationUrl}" style="color: white;" class="button">Xác nhận tài khoản</a>
                    </p>
                    <p>Nếu bạn không thể nhấp vào nút, vui lòng sao chép và dán liên kết sau vào trình duyệt của bạn:</p>
                    <p>${verificationUrl}</p>
                    <p>Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.</p>
                </div>
                <div class="footer">
                    <p>© 2024 CR7 Shop. Tất cả các quyền được bảo lưu.</p>
                </div>
            </div>
        </body>
        </html>
        `;


        await sendEmail(cus.email, "Xác nhận tài khoản", emailContent);
    
        return {
          EM: "Hãy truy cập Email của bạn để xác nhận tài khoản! Link xác minh sẽ hết hạn trong vòng 1 phút.",
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
        isVerified: false,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      order: [['createdAt', 'DESC']],
    });
    if (!token || token.token !== tokenUrl) {
      return {
        EM: "Link không hợp lệ hoặc đã hết hạn!",
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

    await db.Token.update({
      isVerified: true,
    }, {
      where: {
        id: token.id,
      }
    });

    await db.Token.update({
      expiresAt: new Date(),
    }, {
      where: {
        cusId: cus.id,
        isVerified: false,
        id: {
          [Op.ne]: token.id,
        },
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
          const verificationCode = crypto.randomBytes(3).toString("hex").toUpperCase();
          const newToken = await db.Token.create({
            cusId: cus.id,
            token: crypto.randomBytes(32).toString("hex"),
            email: cus.email,
            verification_code: verificationCode,
            expiresAt: new Date(Date.now() + 60 * 1000),
          });

          const verificationUrl  = `${process.env.REACT_URL}/cus/${cus.id}/verify/${newToken.token}`;
          const emailContent = `
              <!DOCTYPE html>
              <html lang="vi">
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Xác minh tài khoản</title>
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
                          <h1>Xác minh tài khoản của bạn</h1>
                      </div>
                      <div class="content">
                          <p>Chào bạn,</p>
                          <p>Cảm ơn bạn đã đăng nhập. Để hoàn tất quá trình và bảo mật tài khoản của bạn, vui lòng xác minh địa chỉ email của bạn bằng cách nhấp vào nút bên dưới:</p>
                          <strong>Link xác minh sẽ hết hạn trong vòng 1 phút</strong>
                          <p style="text-align: center;">
                              <a href="${verificationUrl}" style="color: white;" class="button">Xác minh tài khoản</a>
                          </p>
                          <p>Nếu bạn không thể nhấp vào nút, vui lòng sao chép và dán liên kết sau vào trình duyệt của bạn:</p>
                          <p>${verificationUrl}</p>
                          <p>Nếu bạn không yêu cầu xác minh này, vui lòng bỏ qua email này hoặc liên hệ với bộ phận hỗ trợ của chúng tôi.</p>
                      </div>
                      <div class="footer">
                          <p>© 2024 CR7 Shop. Tất cả các quyền được bảo lưu.</p>
                      </div>
                  </div>
              </body>
              </html>
              `;

              await sendEmail(cus.email, "Xác minh tài khoản", emailContent);
          

          return {
            EM: "Hãy truy cập Email của bạn để xác nhận tài khoản! Link xác minh sẽ hết hạn trong vòng 1 phút.",
            EC: 2,
            DT: "",
          };
        }

        // Tạo payload và JWT
        let payload = {
          id: cus.id,
          email: cus.email,
        };

        let access_token = createJWT(payload);
        let refresh_token = refreshJWT(payload);

        return {
          EM: "Đăng nhập thành công!",
          EC: 0,
          DT: {
            access_token: access_token,
            refresh_token: refresh_token,
            id: cus.id,
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
          id: cus.id,
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

    const verificationCode = crypto.randomBytes(3).toString("hex").toUpperCase();
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // Token hết hạn sau 1 giờ

    await db.Token.create({
      cusId: cus.id,
      token: token,
      email: cus.email,
      verification_code: verificationCode,
      expiresAt: expiresAt,
      isVerified: false,
    });

    let resetUrl;
    let emailSubject;
    let emailContent;

    if (cus.verified) {
      resetUrl = `${process.env.REACT_URL}/password-reset/${cus.id}/${token}`;
      emailSubject = "Đặt lại mật khẩu";
      emailContent = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Đặt lại mật khẩu</title>
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
                  <h1>Đặt lại mật khẩu của bạn</h1>
              </div>
              <div class="content">
                  <p>Chào bạn,</p>
                  <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
                  <p>Để đặt lại mật khẩu, vui lòng nhấp vào nút bên dưới:</p>
                  <p style="text-align: center;">
                      <a href="${resetUrl}" style="color: white;" class="button">Đặt lại mật khẩu</a>
                  </p>
                  <p>Nếu bạn không thể nhấp vào nút, vui lòng sao chép và dán liên kết sau vào trình duyệt của bạn:</p>
                  <p>${resetUrl}</p>
                  <strong>Link này sẽ hết hạn sau 1 giờ.</strong>
              </div>
              <div class="footer">
                  <p>© 2024 CR7 Shop. Tất cả các quyền được bảo lưu.</p>
              </div>
          </div>
      </body>
      </html>
      `;
    } else {
      resetUrl = `${process.env.REACT_URL}/verify-and-reset/${cus.id}/${token}`;
      emailSubject = "Xác nhận tài khoản và đặt lại mật khẩu";
      emailContent = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Xác nhận tài khoản và đặt lại mật khẩu</title>
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
                  <h1>Xác nhận tài khoản và đặt lại mật khẩu</h1>
              </div>
              <div class="content">
                  <p>Chào bạn,</p>
                  <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Tuy nhiên, chúng tôi nhận thấy rằng tài khoản của bạn chưa được xác nhận.</p>
                  <p>Để xác nhận tài khoản và đặt lại mật khẩu, vui lòng nhấp vào nút bên dưới:</p>
                  <p style="text-align: center;">
                      <a href="${resetUrl}" style="color: white;" class="button">Xác nhận và đặt lại mật khẩu</a>
                  </p>
                  <p>Nếu bạn không thể nhấp vào nút, vui lòng sao chép và dán liên kết sau vào trình duyệt của bạn:</p>
                  <p>${resetUrl}</p>
                  <strong>Link này sẽ hết hạn sau 1 giờ.</strong>
              </div>
              <div class="footer">
                  <p>© 2024 CR7 Shop. Tất cả các quyền được bảo lưu.</p>
              </div>
          </div>
      </body>
      </html>
      `;
    }

    await sendEmail(cus.email, emailSubject, emailContent);

    return {
      EM: cus.verified
        ? "Link thay đổi mật khẩu đã được gửi đến email của bạn!"
        : "Link xác nhận tài khoản và đặt lại mật khẩu đã được gửi đến email của bạn!",
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

const verifyAndResetPassword = async (id, tokenUrl, password) => {
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
        isVerified: false,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      order: [['createdAt', 'DESC']],
    });
    if (!token || token.token !== tokenUrl) {
      return {
        EM: "Link không hợp lệ hoặc đã hết hạn!",
        EC: -1,
      };
    }

    let hashPassword = hashUserPassword(password);
    
    // Cập nhật trạng thái xác minh của khách hàng
    await db.Customer.update({
      password: hashPassword,
      verified: true,
    }, {
      where: {
        id: cus.id,
      },
    });

    // Đánh dấu token đã được sử dụng
    await db.Token.update({
      isVerified: true,
    }, {
      where: {
        id: token.id,
      },
    });

    await db.Token.update(
      { expiresAt: new Date() },
      {
        where: {
          cusId: cus.id,
          isVerified: false,
          id: { [Op.ne]: token.id },
        },
      }
    );

    return {
      EM: "Tài khoản đã được xác nhận và mật khẩu đã được đặt lại thành công!",
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
        isVerified: false,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      order: [['createdAt', 'DESC']]
    });
    if (!token || token.token !== tokenUrl) {
      return {
        EM: "Link không hợp lệ hoặc đã hết hạn!",
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
        isVerified: false,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      order: [['createdAt', 'DESC']]
    });
    if (!token || token.token !== tokenUrl) {
      return {
        EM: "Link không hợp lệ hoặc đã hết hạn!",
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

    await db.Token.update({
      isVerified: true,
    }, {
      where: {
        id: token.id,
      },
    });

    await db.Token.update(
      { expiresAt: new Date() },
      {
        where: {
          cusId: cus.id,
          isVerified: false,
          id: { [Op.ne]: token.id },
        },
      }
    );

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
    verifyAndResetPassword,
    resetPasswordVerify,
    resetPassword
}