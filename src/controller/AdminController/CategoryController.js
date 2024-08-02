import categoryService from "../../services/AdminServices/CategoryService";

const handleCreateCategory = async (req, res) => {
    // validate
    if(!req.body.name){
        return res.status(200).json({
            EM: 'Vui lòng nhập tên danh mục!',   // error message
            EC: 1,   // error code
            DT: 'name',   // data
        })
    }
    
    if(!req.file){
        return res.status(200).json({
            EM: 'Vui lòng chọn hình ảnh!',   // error message
            EC: 1,   // error code
            DT: 'image',   // data
        })
    }
    
    let name = req.body.name;
    let parent_id = +req.body.parent_id;
    let description = req.body.description ? req.body.description : '';
    let image = req.file.filename;

    let dataCategory = {
        name: name,
        parent_id: parent_id,
        description: description,
        image: image
    }

    try {
        // create
        let data = await categoryService.createCategory(dataCategory);

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

const handleGetParentCategory = async (req, res) => {
    try {
        let data = await categoryService.gerParentCategory();

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

const handleGetCategory = async (req, res) => {
    try {
        let data = await categoryService.getAllCategories();

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

const handleUpdateCategory = async (req, res) => {
    try {
        if(!req.body.name){
            return res.status(200).json({
                EM: 'Vui lòng nhập tên danh mục!',   // error message
                EC: 1,   // error code
                DT: 'name',   // data
            })
        }

        let id = req.body.id;
        let category = await categoryService.getCategoryById(id);
        if(!category) {
            return res.status(200).json({
                EM: 'Danh mục không tồn tại!',   // error message
                EC: 1,   // error code
                DT: '',   // data
            });
        }

        let name = req.body.name;
        let image = category.DT.image;
        let parent_id = +req.body.parent_id;
        let description = req.body.description;

        if(req.file){
            image = req.file.filename;
        }

        let dataCategory = {
            id: id,
            name: name,
            parent_id: parent_id,
            description: description,
            image: image
        }
        
        // update
        let data = await categoryService.updateCategory(dataCategory);

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
        
        let data = await categoryService.setActiveCategory(id);

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

const handleDeleteCategory = async (req, res) => {
    try {
        let data = await categoryService.deleteCategory(req.body.id);

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
    handleCreateCategory,
    handleGetParentCategory,
    handleGetCategory,
    handleUpdateCategory,
    handleSetActive,
    handleDeleteCategory
}