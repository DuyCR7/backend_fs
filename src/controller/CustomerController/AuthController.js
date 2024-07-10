import authService from "../../services/CustomerServices/AuthService";
import { createNewAccessTokenCustomer } from "../../middleware/jwtAction";

const handleSignUp = async (req, res) => {
    try {
        if(!req.body.email || !req.body.password){
            return res.status(200).json({
                EM: 'Vui lòng nhập đầy đủ thông tin!',   // error message
                EC: 1,   // error code
                DT: '',   // data
            })
        }

        if(req.body.password && req.body.password.length < 8){
            return res.status(200).json({
                EM: 'Mật khẩu tối thiểu phải có 8 ký tự!',   // error message
                EC: 1,   // error code
                DT: '',   // data
            })
        }

        // service: create user account
        let data = await authService.signUpCustomer(req.body);

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
        let data = await authService.signInCustomer(req.body);

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
        res.cookie("cus_jwt", data.DT, { httpOnly: true, maxAge: 60 * 60 * 1000, samesite: 'strict' });

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

const handleTest = async (req, res) => {
    return res.status(200).json({
        EM: 'API test thành công!',   // error message
        EC: 0,   // error code
        DT: '',   // data
    });
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

module.exports = {
    handleSignUp,
    handleSignIn,
    handleLogout,
    handleRefreshToken,
    handleTest,
    handleSignInGoogleSuccess
}