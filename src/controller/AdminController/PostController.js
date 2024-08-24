import postService from "../../services/AdminServices/PostService";
import slugify from "slugify";

const handleCreatePost = async (req, res) => {
    // validate
    if(!req.body.title){
        return res.status(200).json({
            EM: 'Vui lòng nhập tiêu đề bài viết!',   // error message
            EC: 1,   // error code
            DT: 'title',   // data
        })
    }
    
    if(!req.file){
        return res.status(200).json({
            EM: 'Vui lòng chọn hình ảnh!',   // error message
            EC: 1,   // error code
            DT: 'image',   // data
        })
    }
    
    let title = req.body.title;
    let slug = slugify(title, { lower: true, strict: true });
    let image = req.file.filename;
    let content = req.body.content;
    let userId = +req.body.userId;

    let dataPost = {
        title: title,
        slug: slug,
        image: image,
        content: content,
        userId: userId
    }

    try {
        // create
        let data = await postService.createPost(dataPost);

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

const handleGetPost = async (req, res) => {
    try {
        let search = req.query.search || "";
        let sortConfig = req.query.sort ? JSON.parse(req.query.sort) : {key: 'id', direction: 'DESC'};

        if(req.query.page && req.query.limit){
            let page = req.query.page
            let limit = req.query.limit

            let data = await postService.getPostsWithPagination(+page, +limit, search, sortConfig);

            return res.status(200).json({
                EM: data.EM,   // error message
                EC: data.EC,   // error code
                DT: data.DT,   // data
            });
        } else {
            let data = await postService.getAllPosts();

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

const handleUpdatePost = async (req, res) => {
    try {
        if(!req.body.title){
            return res.status(200).json({
                EM: 'Vui lòng nhập tiêu đề bài viết!',   // error message
                EC: 1,   // error code
                DT: 'title',   // data
            })
        }

        let id = req.body.id;
        let post = await postService.getPostById(id);
        if(!post) {
            return res.status(200).json({
                EM: 'Bài viết không tồn tại!',   // error message
                EC: 1,   // error code
                DT: '',   // data
            });
        }

        let title = req.body.title;
        let slug = slugify(title, { lower: true, strict: true });
        let content = req.body.content;
        let userId = +req.body.userId;
        let image = post.DT.image;
        if(req.file){
            image = req.file.filename;
        }

        let dataPost = {
            id: id,
            title: title,
            slug: slug,
            image: image,
            content: content,
            userId: userId
        }
        
        // update
        let data = await postService.updatePost(dataPost);

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
        
        let data = await postService.setActivePost(id);

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

const handleDeletePost = async (req, res) => {
    try {
        let data = await postService.deletePost(req.body.id);

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
    handleCreatePost,
    handleGetPost,
    handleUpdatePost,
    handleSetActive,
    handleDeletePost,
}