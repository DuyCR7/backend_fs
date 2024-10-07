import userService from "../../services/AdminServices/UserService";

const handleGetAllRoles = async (req, res) => {
    try {
        let data = await userService.getAllRoles();

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

const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

const handleCreateUser = async (req, res) => {
    try {
        const { email, password, phone, username, roles } = req.body;

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

        if(!phone){
            return res.status(200).json({
                EM: 'Vui lòng nhập số điện thoại!',   // error message
                EC: 1,   // error code
                DT: 'phone',   // data
            })
        }

        if(!username){
            return res.status(200).json({
                EM: 'Vui lòng nhập tên người dùng!',   // error message
                EC: 1,   // error code
                DT: 'username',   // data
            })
        }

        if(!req.file){
            return res.status(200).json({
                EM: 'Vui lòng chọn hình ảnh!',   // error message
                EC: 1,   // error code
                DT: 'image',   // data
            })
        }

        if (!roles || roles.length === 0) {
            return res.status(200).json({
                EM: 'Vui lòng chọn ít nhất một quyền!',   // error message
                EC: 1,   // error code
                DT: 'roles',   // data
            });
        }

        const image = req.file.filename;

        let dataUser = {
            email: email,
            password: password,
            phone: phone,
            username: username,
            image: image,
            roles: roles,
        }

        let data = await userService.createUser(dataUser);

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

const handleReadUser = async (req, res) => {
    try {
        let search = req.query.search || "";
        let sortConfig = req.query.sort ? JSON.parse(req.query.sort) : {key: 'id', direction: 'DESC'};

        let page = req.query.page
        let limit = req.query.limit

        let data = await userService.getUsersWithPagination(+page, +limit, search, sortConfig);

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

const handleUpdateUser = async (req, res) => {
    try {
        const { id, email, roles } = req.body;

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

        if (!roles || roles.length === 0) {
            return res.status(200).json({
                EM: 'Vui lòng chọn ít nhất một quyền!',   // error message
                EC: 1,   // error code
                DT: 'roles',   // data
            });
        }

        let user = await userService.getUserById(id);
        if (!user) {
            return res.status(200).json({
                EM: 'Không tìm thấy người dùng!',   // error message
                EC: -1,   // error code
                DT: '',   // data
            });
        }

        let image = user.DT.image;
        if (req.file) {
            image = req.file.filename;
        }

        let dataUser = {
            id: id,
            email: email,
            image: image,
            roles: roles,
        }

        let data = await userService.updateUser(dataUser);

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

const handleSetActive = async (req, res) => {
    try {
        let id = req.body.id;
        
        let data = await userService.setActiveUser(id);

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
    handleGetAllRoles,
    handleCreateUser,
    handleReadUser,
    handleUpdateUser,
    handleSetActive,
}