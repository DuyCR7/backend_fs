import productService from "../../services/AdminServices/ProductService";

const handleGetProductCategory = async (req, res) => {
    try {
        let data = await productService.getAllCategories();

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

const handleGetProductTeam = async (req, res) => {
    try {
        let data = await productService.getAllTeams();

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

const handleGetProductColor = async (req, res) => {
    try {
        let data = await productService.getAllColors();

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

const handleGetProductSize = async (req, res) => {
    try {
        let data = await productService.getAllSizes();

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

const handleCreateProduct = async (req, res) => {
    try {
        const {
            name,
            price,
            price_sale,
            categoryId,
            teamId,
            imageInfo,
            productDetails
        } = req.body;
        
        if(!name || !price || !categoryId || !teamId || !req.files.images || !req.files.detailImages || !imageInfo || !productDetails) {
            return res.status(200).json({
                EM: 'Vui lòng nhập đầy đủ thông tin!',   // error message
                EC: 1,   // error code
                DT: '',   // data
            })
        }

        let dataProduct = {
            name: name,
            price: +price,
            price_sale: +price_sale,
            categoryId: +categoryId,
            teamId: +teamId,
            images: req.files.images,
            detailImages: req.files.detailImages,
            imageInfo,
            productDetails
        }

        let data = await productService.createProduct(dataProduct);

        return res.status(200).json({
            EM: data.EM,   // error message
            EC: data.EC,   // error code
            DT: data.DT,   // data
        })
        
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
    handleGetProductCategory,
    handleGetProductTeam,
    handleGetProductColor,
    handleGetProductSize,
    handleCreateProduct
}