import jwt, { decode } from 'jsonwebtoken';
require("dotenv").config();
import db from "../models/index";

const nonSecurePaths = [
    '/logout', 
    '/sign-in', 
    '/refresh-token',
]

// tạo token
const createJWT = (payload) => {
    let key = process.env.JWT_SECRET;
    let token = null;

    try {
        token = jwt.sign(payload, key, { expiresIn: process.env.JWT_EXPIRES_IN_ACCESS_TOKEN});
    } catch (err) {
        console.log(err);
    }

    return token;
}

const refreshJWT = (payload) => {
    let key = process.env.JWT_SECRET;
    let token = null;

    try {
        token = jwt.sign(payload, key, { expiresIn: process.env.JWT_EXPIRES_IN_REFRESH_TOKEN});
    } catch (err) {
        console.log(err);
    }

    return token;
}

// giải mã
const verifyToken = (token) => {
    let key = process.env.JWT_SECRET;
    let decoded = null;

    try {
        decoded = jwt.verify(token, key);
    } catch (err) {
        console.log(err);
    }
    return decoded;
}

const extractToken = (req) => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    }
    return null;
}

// middleware
const checkUserJWT = (req, res, next) => {
    if(nonSecurePaths.includes(req.path)) return next();

    let cookies = req.cookies;   // lấy cookie người dùng gửi lên
    let tokenFromHeader = extractToken(req);

    // console.log("cookies: ", cookies.jwt);
    // console.log("tokenFromHeader: ", tokenFromHeader);

    if((cookies && cookies.jwt) || tokenFromHeader){
        let token = cookies && cookies.jwt ? cookies.jwt : tokenFromHeader;
        let decoded = verifyToken(token);
        // console.log("Check: ",decoded);
        if (decoded) {
            req.user = decoded; // đính kèm thêm user vào req
            req.token = token;

            next();
        } else {
            return res.status(401).json({
                EM: 'Vui lòng đăng nhập!',   // error message
                EC: -1,   // error code
                DT: '',   // data
            })
        }

        // console.log("My Jwt: ", cookies.jwt);
    } else {
        return res.status(401).json({
            EM: 'Vui lòng đăng nhập!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

const checkUserPermission = (req, res, next) => {
    if(nonSecurePaths.includes(req.path) || req.path === '/account') return next();
    // console.log(req.path);
    if(req.user){
        let email = req.user.email;
        let roles = req.user.groupWithRoles.Roles;

        // console.log(req.path);

        let currentUrl = req.path;
        if(!roles || roles.length === 0){
            return res.status(403).json({
                EM: `Bạn không có quyền thực hiện chức năng này!`,   // error message
                EC: -1,   // error code
                DT: '',   // data
            })
        }

        let canAccess = roles.some((item) => item.url === currentUrl || currentUrl.startsWith(item.url + '/'));
        if(canAccess === true) {
            next();
        } else {
            return res.status(403).json({
                EM: `Bạn không có quyền thực hiện chức năng này!`,   // error message
                EC: -1,   // error code
                DT: '',   // data
            })
        }

    } else {
        return res.status(401).json({
            EM: 'Vui lòng đăng nhập!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

const checkCustomerJWT = async (req, res, next) => {
    let cookies = req.cookies;   // lấy cookie người dùng gửi lên
    let tokenFromHeader = extractToken(req);

    // console.log("cookies: ", cookies.cus_jwt);
    // console.log("tokenFromHeader: ", tokenFromHeader);

    if((cookies && cookies.cus_jwt) || tokenFromHeader){
        let token = cookies && cookies.cus_jwt ? cookies.cus_jwt : tokenFromHeader;
        if (token) {
            try {
                let decoded = verifyToken(token);
                // console.log("Check: ",decoded);
                if (decoded) {
                    req.user = decoded; // đính kèm thêm user vào req
                    req.token = token;
    
                    const customer = await db.Customer.findOne({
                        where: {
                            id: req.user.id,
                            isActive: true,
                        }
                    })
                    if(!customer) {
                        return res.status(401).json({
                            EM: `Tài khoản của bạn đã bị khóa! Vui lòng liên hệ email: anhduy0317@gmail.com để được hỗ trợ!`,   // error message
                            EC: -1,   // error code
                            DT: '',   // data
                        })
                    }
    
                    return next();
                } else {
                    return res.status(401).json({
                        EM: 'Vui lòng đăng nhập!',   // error message
                        EC: -1,   // error code
                        DT: '',   // data
                    })
                }
            } catch (e) {
                return res.status(401).json({
                    EM: 'Lỗi xác thực token!',   // error message
                    EC: -1,   // error code
                    DT: '',   // data
                })
            }
        }

        // console.log("My Jwt: ", cookies.jwt);
    } else {
        return res.status(401).json({
            EM: 'Vui lòng đăng nhập!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

const createNewAccessToken = (token) => {
    try {
        
        let decoded = verifyToken(token);
        // console.log("Check decoded: ",decoded);
        if (decoded) {
            let payload = {
                id: decoded.id,
                email: decoded.email,
                username: decoded.username,
                // groupWithRoles: decoded.groupWithRoles,
            }

            let new_access_token = createJWT(payload);
            
            return {
                EM: "Tạo mới access_token thành công!",
                EC: 0,
                DT: new_access_token,
              };
        } else {
            return {
                EM: 'Lỗi, vui lòng thử lại sau!',   // error message
                EC: -1,   // error code
                DT: '',   // data
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

const createNewAccessTokenCustomer = (token) => {
    try {
        
        let decoded = verifyToken(token);
        // console.log("Check decoded: ",decoded);
        if (decoded) {
            let payload = {
                id: decoded.id,
                email: decoded.email,
                // groupWithRoles: decoded.groupWithRoles,
            }

            let new_access_token = createJWT(payload);
            
            return {
                EM: "Tạo mới access_token thành công!",
                EC: 0,
                DT: new_access_token,
              };
        } else {
            return {
                EM: 'Lỗi, vui lòng thử lại sau!',   // error message
                EC: -1,   // error code
                DT: '',   // data
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

module.exports = {
    createJWT,
    refreshJWT,
    verifyToken,
    checkUserJWT,
    checkCustomerJWT,
    checkUserPermission,
    createNewAccessToken,
    createNewAccessTokenCustomer
}