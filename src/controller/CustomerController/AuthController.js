import authService from "../../services/CustomerServices/AuthService";
import { createNewAccessTokenCustomer } from "../../middleware/jwtAction";

const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

const handleSignUp = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        console.log(req.body);
        if(!email){
            return res.status(200).json({
                EM: 'Vui lòng nhập email!',   // error message
                EC: 1,   // error code
                DT: 'email',   // data
            })
        }

        if(!validateEmail(email)){
            return res.status(200).json({
                EM: 'Vui lòng nhập đúng định dạng email!',   // error message
                EC: 1,   // error code
                DT: 'email',   // data
            })
        }

        if(!password){
            return res.status(200).json({
                EM: 'Vui lòng nhập mật khẩu!',   // error message
                EC: 1,   // error code
                DT: 'password',   // data
            })
        }

        if(password.includes(' ')) {
            return res.status(200).json({
                EM: 'Mật khẩu không được chứa khoảng trắng!',   // error message
                EC: 1,   // error code
                DT: 'password',   // data
            })
        }

        if(password && password.length < 8){
            return res.status(200).json({
                EM: 'Mật khẩu tối thiểu phải có 8 ký tự!',   // error message
                EC: 1,   // error code
                DT: 'password',   // data
            })
        }

        if (!confirmPassword) {
            return res.status(200).json({
                EM: 'Vui lòng xác nhận lại mật khẩu!',   // error message
                EC: 1,   // error code
                DT: 'cfPassword',   // data
            })
        }

        if(password !== confirmPassword){
            return res.status(200).json({
                EM: 'Mật khẩu xác nhận không khớp!',   // error message
                EC: 1,   // error code
                DT: 'cfPassword',   // data
            })
        }

        // service: create user account
        let data = await authService.signUpCustomer(email, password);

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: '',   // data
        });

    } catch (e) {
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

const handleVerify = async (req, res) => {
    try {
        let id = req.params.id;
        let token = req.params.token;
        let data = await authService.verifyEmail(id, token);

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: '',   // data
        });

    } catch (e) {
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

const handleSignIn = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        console.log(req.body);

        if(!email){
            return res.status(200).json({
                EM: 'Vui lòng nhập email!',   // error message
                EC: 1,   // error code
                DT: 'email',   // data
            })
        }

        if(!password){
            return res.status(200).json({
                EM: 'Vui lòng nhập mật khẩu!',   // error message
                EC: 1,   // error code
                DT: 'password',   // data
            })
        }

        let data = await authService.signInCustomer(email, password);

        // set cookie
        // thuộc tính httpOnly giúp nâng cao bảo mật cookie, phía client không lấy được
        if(data && data.DT && data.DT.access_token){
            res.cookie("cus_jwt", data.DT.access_token, { httpOnly: true, maxAge: 60 * 60 * 1000, samesite: 'strict' });
            res.cookie("cus_refresh_token", data.DT.refresh_token, { httpOnly: true, maxAge: 365 * 24 * 60 * 60 * 1000, samesite: 'strict' });
        }

        const { refresh_token, ...newData } = data.DT;
        // console.log("newData", newData);
        // console.log("DT", data.DT);

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: newData,   // data
        });

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

const handleLogout = (req, res) => {
    try {
        
        res.clearCookie("cus_jwt");
        res.clearCookie("cus_refresh_token");

        return res.status(200).json({
            EM: 'Đăng xuất thành công!',   // error message
            EC: 0,   // error code
            DT: '',   // data
        });

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

const handleRefreshToken = async (req, res) => {
    try {
        // console.log("req.cookies: ", req.cookies.cus_refresh_token);

        const token = req.cookies.cus_refresh_token;
        if(!token){
            return res.status(401).json({
                EM: 'Lỗi, vui lòng thử lại sau!',   // error message
                EC: -1,   // error code
                DT: '',   // data
            })
        }

        let data = await createNewAccessTokenCustomer(token);
        res.cookie("cus_jwt", data.DT, { httpOnly: true, maxAge: 10000, samesite: 'strict' });

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: data.DT,   // data
        });

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

const handleSignInGoogleSuccess = async (req, res) => {
    let { id, tokenLoginGoogle } = req?.body;
    try {
        if (!id || !tokenLoginGoogle) {
            return res.status(400).json({
                EM: 'Lỗi, ID Google không hợp lệ!',   // error message
                EC: 1,   // error code
                DT: '',   // data
            });
        }

        let data = await authService.signInGoogle(id, tokenLoginGoogle);

        // set cookie
        // thuộc tính httpOnly giúp nâng cao bảo mật cookie, phía client không lấy được
        if(data && data.DT && data.DT.access_token){
            res.cookie("cus_jwt", data.DT.access_token, { httpOnly: true, maxAge: 60 * 60 * 1000, samesite: 'strict' });
            res.cookie("cus_refresh_token", data.DT.refresh_token, { httpOnly: true, maxAge: 365 * 24 * 60 * 60 * 1000, samesite: 'strict' });
        }

        const { refresh_token, ...newData } = data.DT;

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: newData,   // data
        });

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

const handleResetPasswordSendLink = async (req, res) => {
    try {
        let data = await authService.resetPasswordSendLink(req.body.email);
        
        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: '',   // data
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

const handleResetPasswordVerify = async (req, res) => {
    try {
        let id = req.params.id;
        let token = req.params.token;
        let data = await authService.resetPasswordVerify(id, token);

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: '',   // data
        });

    } catch (e) {
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

const handleVerifyAndResetPassword = async (req, res) => {
    try {
        let id = req.params.id;
        let token = req.params.token;
        let password = req.body.password;

        if(password && password.length < 8){
            return res.status(200).json({
                EM: 'Mật khẩu tối thiểu phải có 8 ký tự!',   // error message
                EC: 1,   // error code
                DT: '',   // data
            })
        }


        let data = await authService.verifyAndResetPassword(id, token, password);

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: '',   // data
        });

    } catch (e) {
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

const handleResetPassword = async (req, res) => {
    try {
        let id = req.params.id;
        let token = req.params.token;
        let password = req.body.password;

        if(password && password.length < 8){
            return res.status(200).json({
                EM: 'Mật khẩu tối thiểu phải có 8 ký tự!',   // error message
                EC: 1,   // error code
                DT: '',   // data
            })
        }


        let data = await authService.resetPassword(id, token, password);

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: '',   // data
        });

    } catch (e) {
        return res.status(500).json({
            EM: 'Lỗi, vui lòng thử lại sau!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

module.exports = {
    handleSignUp,
    handleVerify,
    handleSignIn,
    handleLogout,
    handleRefreshToken,
    handleSignInGoogleSuccess,
    handleResetPasswordSendLink,
    handleResetPasswordVerify,
    handleVerifyAndResetPassword,
    handleResetPassword
}