import authService from "../../services/AdminServices/AuthService";
import { createNewAccessToken } from "../../middleware/jwtAction";

const handleSignIn = async (req, res) => {
    try {
        let data = await authService.signInUser(req.body);

        // set cookie
        // thuộc tính httpOnly giúp nâng cao bảo mật cookie, phía client không lấy được
        if(data && data.DT && data.DT.access_token){
            res.cookie("jwt", data.DT.access_token, { httpOnly: true, maxAge: 60 * 60 * 1000, samesite: 'strict' });
            res.cookie("refresh_token", data.DT.refresh_token, { httpOnly: true, maxAge: 365 * 24 * 60 * 60 * 1000, samesite: 'strict' });
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
};

const handleLogout = async (req, res) => {
    try {
        
        res.clearCookie("jwt");
        res.clearCookie("refresh_token");

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
        // console.log("req.cookies: ", req.cookies.refresh_token);

        const token = req.cookies.refresh_token;
        if(!token){
            return res.status(401).json({
                EM: 'Lỗi, vui lòng thử lại sau!',   // error message
                EC: -1,   // error code
                DT: '',   // data
            })
        }

        let data = await createNewAccessToken(token);
        res.cookie("jwt", data.DT, { httpOnly: true, maxAge: 60 * 60 * 1000, samesite: 'strict' });

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

const handleGetUserAccount = async (req, res) => {
    return res.status(200).json({
        EM: 'Lấy thông tin người dùng thành công!',   // error message
        EC: 0,   // error code
        DT: {
            access_token: req.token,
            // groupWithRoles: req.user.groupWithRoles,
            email: req.user.email,
            username: req.user.username,
            id: req.user.id,
        },   // data
    }); 
}

const handleGetUserById = async (req, res) => {
    try {
        let id = req.params.id;
        let data = await authService.getUserById(id);

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

module.exports = {
    handleSignIn,
    handleLogout,
    handleRefreshToken,
    handleGetUserAccount,
    handleGetUserById
}