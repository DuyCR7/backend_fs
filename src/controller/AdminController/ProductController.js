import productService from "../../services/AdminServices/ProductService";
import slugify from "slugify";

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
            description,
            price,
            price_sale,
            categoryId,
            teamId,
            imageInfo,
            productDetails
        } = req.body;
        
        if(!name || !price || !categoryId || !teamId || !req.files.images || !req.files.detailImages || !imageInfo || !productDetails) {
            return res.status(400).json({
                EM: 'Vui lòng nhập đầy đủ thông tin!',   // error message
                EC: 1,   // error code
                DT: '',   // data
            })
        }

        if(price_sale && +price_sale <= 0) {
            return res.status(400).json({
                EM: 'Giá khuyến mãi phải lớn hơn 0!',   // error message
                EC: 1,   // error code
                DT: 'price_sale',   // data
            })
        }

        let slug = slugify(name, { lower: true, strict: true });

        let dataProduct = {
            name: name,
            slug: slug,
            description: description,
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

const handleUpdateProduct = async (req, res) => {
    try {
        const {
            id,
            name,
            description,
            price,
            price_sale,
            categoryId,
            teamId,
            imageInfo,
            productDetails
        } = req.body;
        
        if(!name || !price || !categoryId || !teamId || !imageInfo || !productDetails) {
            return res.status(400).json({
                EM: 'Vui lòng nhập đầy đủ thông tin!',   // error message
                EC: 1,   // error code
                DT: '',   // data
            })
        }

        let product = await productService.getProductById(id);
        if(!product) {
            return res.status(404).json({
                EM: 'Sản phẩm không tồn tại!',   // error message
                EC: -1,   // error code
                DT: '',   // data
            })
        }
        // console.log("product", product.DT);
        
        if(price_sale && +price_sale <= 0) {
            return res.status(400).json({
                EM: 'Giá khuyến mãi phải lớn hơn 0!',   // error message
                EC: 1,   // error code
                DT: 'price_sale',   // data
            })
        }

        let slug = slugify(name, { lower: true, strict: true });

        let dataProduct = {
            id: +id,
            name: name,
            slug: slug,
            description: description,
            price: +price,
            price_sale: +price_sale,
            categoryId: +categoryId,
            teamId: +teamId,
            images: req.files.images,
            detailImages: req.files.detailImages,
            imageInfo,
            productDetails,
            Product_Images: product.DT.Product_Images
        }
        console.log("dataProduct", dataProduct);

        let data = await productService.updateProduct(dataProduct);

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

const handleGetProduct = async (req, res) => {
    try {
        let search = req.query.search || "";
        let sortConfig = req.query.sort ? JSON.parse(req.query.sort) : {key: 'id', direction: 'DESC'};

        if(req.query.page && req.query.limit){
            let page = req.query.page
            let limit = req.query.limit

            let data = await productService.getProductsWithPagination(+page, +limit, search, sortConfig);

            return res.status(200).json({
                EM: data.EM,   // error message
                EC: data.EC,   // error code
                DT: data.DT,   // data
            });
        } else {
            let data = await productService.getAllProducts();

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

const handleSetActiveField = async (req, res) => {
    try {
        let id = req.body.id;
        let field = req.body.field;
        
        let data = await productService.setActiveField(id, field);

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

const handleDeleteProduct = async (req, res) => {
    try {
        let data = await productService.deleteProduct(req.body.id);

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
    handleGetProductCategory,
    handleGetProductTeam,
    handleGetProductColor,
    handleGetProductSize,
    handleCreateProduct,
    handleUpdateProduct,
    handleGetProduct,
    handleSetActiveField,
    handleDeleteProduct,
}