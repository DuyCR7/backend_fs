require('dotenv').config();
import path from "path";
import express from 'express';
import adAuthController from "../controller/AdminController/AuthController";
import adTeamController from "../controller/AdminController/TeamController";
import adCategoryController from "../controller/AdminController/CategoryController";
import adSizeController from "../controller/AdminController/SizeController";
import adColorController from "../controller/AdminController/ColorController";
import adProductController from "../controller/AdminController/ProductController";
import cusAuthController from "../controller/CustomerController/AuthController";
import { checkUserJWT, checkUserPermission } from "../middleware/jwtAction";
import passport from 'passport';
import multer from 'multer';
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/public/assets/images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + uuidv4() + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage
});

const router = express.Router();
const adminRouter = express.Router();

const initApiRoutes = (app) => {

    adminRouter.use(checkUserJWT);

    adminRouter.post('/sign-in', adAuthController.handleSignIn);
    adminRouter.post('/logout', adAuthController.handleLogout);
    adminRouter.post('/refresh-token', adAuthController.handleRefreshToken);
    adminRouter.get('/account', adAuthController.handleGetUserAccount);
    adminRouter.get("/get-by-id/:id", adAuthController.handleGetUserById);

    adminRouter.post('/team/create', upload.single('image'), adTeamController.handleCreateTeam);
    adminRouter.get('/team/read', adTeamController.handleGetTeam);
    adminRouter.put('/team/update', upload.single('image'), adTeamController.handleUpdateTeam);
    adminRouter.put('/team/set-active', adTeamController.handleSetActive);
    adminRouter.delete('/team/delete', adTeamController.handleDeleteTeam);

    adminRouter.get('/category/get-parent', adCategoryController.handleGetParentCategory);
    adminRouter.post('/category/create', upload.single('image'), adCategoryController.handleCreateCategory);
    adminRouter.get('/category/read', adCategoryController.handleGetCategory);
    adminRouter.put('/category/update', upload.single('image'), adCategoryController.handleUpdateCategory);
    adminRouter.put('/category/set-active', adCategoryController.handleSetActive);
    adminRouter.delete('/category/delete', adCategoryController.handleDeleteCategory);

    adminRouter.post('/size/create', adSizeController.handleCreateSize);
    adminRouter.get('/size/read', adSizeController.handleGetSize);
    adminRouter.put('/size/set-active', adSizeController.handleSetActive);
    adminRouter.put('/size/update', adSizeController.handleUpdateSize);
    adminRouter.delete('/size/delete', adSizeController.handleDeleteSize);

    adminRouter.post('/color/create', adColorController.handleCreateColor);
    adminRouter.get('/color/read', adColorController.handleGetColor);
    adminRouter.put('/color/set-active', adColorController.handleSetActive);
    adminRouter.put('/color/update', adColorController.handleUpdateColor);
    adminRouter.delete('/color/delete', adColorController.handleDeleteColor);

    adminRouter.get('/product/get-category', adProductController.handleGetProductCategory);
    adminRouter.get('/product/get-team', adProductController.handleGetProductTeam);
    adminRouter.get('/product/get-color', adProductController.handleGetProductColor);
    adminRouter.get('/product/get-size', adProductController.handleGetProductSize);
    adminRouter.post('/product/create', upload.fields([
        { name: 'images', maxCount: 20 },
        { name: 'detailImages', maxCount: 20 }
    ]), adProductController.handleCreateProduct);
    adminRouter.put('/product/update', upload.fields([
        { name: 'images', maxCount: 20 },
        { name: 'detailImages', maxCount: 20 }
    ]), adProductController.handleUpdateProduct);
    adminRouter.get('/product/read', adProductController.handleGetProduct);
    adminRouter.put('/product/set-active-field', adProductController.handleSetActiveField);
    adminRouter.delete('/product/delete', adProductController.handleDeleteProduct);

    router.use('/admin', adminRouter);

    router.post('/sign-up', cusAuthController.handleSignUp);
    router.post('/sign-in', cusAuthController.handleSignIn);
    router.post('/logout', cusAuthController.handleLogout);
    router.post('/refresh-token', cusAuthController.handleRefreshToken);
    router.get('/test', cusAuthController.handleTest);
    router.get('/cus/:id/verify/:token', cusAuthController.handleVerify);
    router.post('/password-reset-link', cusAuthController.handleResetPasswordSendLink);
    router.get('/password-reset/:id/:token', cusAuthController.handleResetPasswordVerify);
    router.post('/password-reset/:id/:token', cusAuthController.handleResetPassword);
    router.get('/test-time', (req, res) =>{
        return res.status(200).json({
            EM: 'Success',   // error message
            EC: 0,   // error code
            DT: '2024-07-22 15:51:20',   // data
        })
    })

    router.get('/auth/google',
        passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
      
    router.get('/auth/google/callback', (req, res, next) => {
        passport.authenticate('google', (err, profile) => {
            req.user = profile;
            next();
        })(req, res, next);
    }, (req, res) => {
        res.redirect(`${process.env.REACT_URL}/sign-in-success/${req.user?.id}/${req.user.tokenLoginGoogle}`);
    }); 

    router.post('/sign-in-success', cusAuthController.handleSignInGoogleSuccess);

    return app.use('/api/v1/', router);
}

export default initApiRoutes;