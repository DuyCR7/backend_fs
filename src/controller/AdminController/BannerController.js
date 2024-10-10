import bannerService from "../../services/AdminServices/BannerService";

const handleCreateBanner = async (req, res) => {
    // validate
    if(!req.body.name){
        return res.status(400).json({
            EM: 'Vui lòng nhập tên banner!',   // error message
            EC: 1,   // error code
            DT: 'name',   // data
        })
    }

    if(!req.body.url) {
        return res.status(400).json({
            EM: 'Vui lòng nhập đường dẫn!',   // error message
            EC: 1,   // error code
            DT: 'url',   // data
        })
    }

    if(!req.files['imageDesktop']){
        return res.status(400).json({
            EM: 'Vui lòng chọn hình ảnh desktop!',   // error message
            EC: 1,   // error code
            DT: 'imageDesktop',   // data
        })
    }

    if(!req.files['imageMobile']){
        return res.status(400).json({
            EM: 'Vui lòng chọn hình ảnh mobile!',   // error message
            EC: 1,   // error code
            DT: 'imageMobile',   // data
        })
    }
    
    let name = req.body.name;
    let url = req.body.url;
    let imageDesktop = req.files['imageDesktop'][0];
    let imageMobile = req.files['imageMobile'][0];

    let dataBanner = {
        name: name,
        url: url,
        imageDesktop: imageDesktop.filename,
        imageMobile: imageMobile.filename,
    }

    try {
        // create
        let data = await bannerService.createBanner(dataBanner);

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

const handleGetBanner = async (req, res) => {
    try {
        let search = req.query.search || "";
        let sortConfig = req.query.sort ? JSON.parse(req.query.sort) : {key: 'id', direction: 'DESC'};

        if(req.query.page && req.query.limit){
            let page = req.query.page
            let limit = req.query.limit

            let data = await bannerService.getBannersWithPagination(+page, +limit, search, sortConfig);

            return res.status(200).json({
                EM: data.EM,   // error message
                EC: data.EC,   // error code
                DT: data.DT,   // data
            });
        }
    
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
        
        let data = await bannerService.setActiveBanner(id);

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

const handleUpdateBanner = async (req, res) => {
    try {
        if(!req.body.name){
            return res.status(400).json({
                EM: 'Vui lòng nhập tên banner!',   // error message
                EC: 1,   // error code
                DT: 'name',   // data
            })
        }

        if(!req.body.url) {
            return res.status(400).json({
                EM: 'Vui lòng nhập đường dẫn!',   // error message
                EC: 1,   // error code
                DT: 'url',   // data
            })
        }

        let id = req.body.id;
        let banner = await bannerService.getBannerById(id);
        if(!banner) {
            return res.status(404).json({
                EM: 'Banner không tồn tại!',   // error message
                EC: 1,   // error code
                DT: '',   // data
            });
        }

        let name = req.body.name;
        let url = req.body.url;
        let imageDesktop = banner.DT.imageDesktop;
        let imageMobile = banner.DT.imageMobile;
        
        if(req.files['imageDesktop']){
            imageDesktop = req.files['imageDesktop'][0].filename;
        }
        
        if(req.files['imageMobile']){
            imageMobile = req.files['imageMobile'][0].filename;
        }

        let dataBanner = {
            id: id,
            name: name,
            imageDesktop: imageDesktop,
            imageMobile: imageMobile,
            url: url,
        }
        
        // update
        let data = await bannerService.updateBanner(dataBanner);

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

const handleDeleteBanner = async (req, res) => {
    try {
        let data = await bannerService.deleteBanner(req.body.id);

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

const handleDeleteBannerMany = async (req, res) => {
    try {
        let ids = req.body.ids;
        console.log("ids", ids);
        let data = await bannerService.deleteMany(ids);

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: data.DT,   // data
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: 'Error form server!',   // error message
            EC: -1,   // error code
            DT: '',   // data
        })
    }
}

module.exports = {
    handleCreateBanner,
    handleGetBanner,
    handleSetActive,
    handleUpdateBanner,
    handleDeleteBanner,
    handleDeleteBannerMany,
}