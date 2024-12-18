require('dotenv').config();
import path from "path";
import express from 'express';
import adAuthController from "../controller/AdminController/AuthController";
import adTeamController from "../controller/AdminController/TeamController";
import adCategoryController from "../controller/AdminController/CategoryController";
import adSizeController from "../controller/AdminController/SizeController";
import adColorController from "../controller/AdminController/ColorController";
import adProductController from "../controller/AdminController/ProductController";
import adBannerController from "../controller/AdminController/BannerController";
import adEventController from "../controller/AdminController/EventController";
import adPostController from "../controller/AdminController/PostController";
import adOrderController from "../controller/AdminController/OrderController";
import adVoucherController from "../controller/AdminController/VoucherController";
import adStatisticController from "../controller/AdminController/StatisticController";
import adManageCustomerController from "../controller/AdminController/ManageCustomerController";
import adProfileController from "../controller/AdminController/ProfileController";
import adUserController from "../controller/AdminController/UserController";

import cusAuthController from "../controller/CustomerController/AuthController";
import cusHomeController from "../controller/CustomerController/HomeController";
import cusShopController from "../controller/CustomerController/ShopController";
import cusPostController from "../controller/CustomerController/PostController";
import cusCartController from "../controller/CustomerController/CartController";
import cusWishlistController from "../controller/CustomerController/WishListController";
import cusCheckOutController from "../controller/CustomerController/CheckOutController";
import cusOrderController from "../controller/CustomerController/OrderController";
import cusProfileController from "../controller/CustomerController/ProfileController";
import cusVoucherController from "../controller/CustomerController/VoucherController";

import chatController from "../controller/ChatController";

import { checkUserJWT, checkCustomerJWT, checkUserPermission } from "../middleware/jwtAction";
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

    adminRouter.use(checkUserJWT, checkUserPermission);

    // api management product
    adminRouter.post('/sign-in', adAuthController.handleSignIn);
    adminRouter.post('/logout', adAuthController.handleLogout);
    adminRouter.post('/refresh-token', adAuthController.handleRefreshToken);

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
    adminRouter.put('/category/set-home', adCategoryController.handleSetHome);
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

    // api management banner
    adminRouter.post('/banner/create', upload.fields([
        { name: 'imageDesktop', maxCount: 1 },
        { name: 'imageMobile', maxCount: 1 }
    ]), adBannerController.handleCreateBanner);
    adminRouter.get('/banner/read', adBannerController.handleGetBanner);
    adminRouter.put('/banner/set-active', adBannerController.handleSetActive);
    adminRouter.put('/banner/update', upload.fields([
        { name: 'imageDesktop', maxCount: 1 },
        { name: 'imageMobile', maxCount: 1 }
    ]),  adBannerController.handleUpdateBanner);
    adminRouter.delete('/banner/delete', adBannerController.handleDeleteBanner);
    adminRouter.delete('/banner/delete-many', adBannerController.handleDeleteBannerMany);

    // api management event
    adminRouter.post('/event/create', 
        upload.fields([
            { name: 'imageDesktop', maxCount: 1 },
            { name: 'imageMobile', maxCount: 1 }
        ]), 
        adEventController.handleCreateEvent
    );
    adminRouter.get('/event/read', adEventController.handleGetEvent);
    adminRouter.put('/event/set-active', adEventController.handleSetActive);
    adminRouter.put('/event/update',
        upload.fields([
            { name: 'imageDesktop', maxCount: 1 },
            { name: 'imageMobile', maxCount: 1 }
        ]),
        adEventController.handleUpdateEvent
    );
    adminRouter.delete('/event/delete', adEventController.handleDeleteEvent);

    // api management post
    adminRouter.post('/post/create', upload.single('image'), adPostController.handleCreatePost);
    adminRouter.get('/post/read', adPostController.handleGetPost);
    adminRouter.put('/post/update', upload.single('image'), adPostController.handleUpdatePost);
    adminRouter.put('/post/set-active', adPostController.handleSetActive);
    adminRouter.delete('/post/delete', adPostController.handleDeletePost);

    // api management voucher
    adminRouter.post('/voucher/create', adVoucherController.handleCreateVoucher);
    adminRouter.get('/voucher/read', adVoucherController.handleGetVoucher);
    adminRouter.put('/voucher/update', adVoucherController.handleUpdateVoucher);
    adminRouter.put('/voucher/set-active', adVoucherController.handleSetActive);

    // api management order
    adminRouter.get('/order/read', adOrderController.handleGetOrder);
    adminRouter.put('/order/update-status/:orderId', adOrderController.handleUpdateOrderStatus);

    // api management customer
    adminRouter.get('/customer/read', adManageCustomerController.handleGetCustomer);
    adminRouter.put('/customer/lock', adManageCustomerController.handleLockCustomer);
    adminRouter.put('/customer/unlock', adManageCustomerController.handleUnlockCustomer);

    // api management statistic
    adminRouter.get('/statistic/get-statistic-some', adStatisticController.handleGetStatisticSome);
    adminRouter.get('/statistic/get-revenue', adStatisticController.handleGetRevenueStatistic);
    adminRouter.get('/statistic/get-best-slow-selling', adStatisticController.handleGetBestSlowSelling);
    adminRouter.get('/statistic/get-best-wishlist', adStatisticController.handleGetBestWishlist);
    adminRouter.get('/statistic/get-order-status', adStatisticController.handleGetOrderStatus);
    adminRouter.get('/statistic/get-available-product', adStatisticController.handleGetAvailableProduct);

    // api management profile
    adminRouter.get('/profile/get-profile', adProfileController.handleGetProfile);
    adminRouter.put('/profile/update-profile', upload.single('image'), adProfileController.handleUpdateProfile);
    adminRouter.put('/profile/change-password', adProfileController.handleChangePassword);

    // api management user
    adminRouter.get('/user/get-all-roles', adUserController.handleGetAllRoles);
    adminRouter.post('/user/create', upload.single('image'), adUserController.handleCreateUser);
    adminRouter.get('/user/read', adUserController.handleReadUser);
    adminRouter.put('/user/update', upload.single('image'), adUserController.handleUpdateUser);
    adminRouter.put('/user/set-active', adUserController.handleSetActive);

    // api chat
    adminRouter.get('/chat/get-admin-chats', chatController.handleGetAdminChats);
    adminRouter.post('/chat/send-message', chatController.handleSendMessage);
    adminRouter.get('/chat/get-messages/:chatId', chatController.handleGetMessages);
    adminRouter.get('/chat/get-last-message/:chatId', chatController.handleGetLastMessage);
    adminRouter.get('/chat/get-unread-message-count', chatController.handleGetUnreadMessageCount);
    adminRouter.put('/chat/mark-messages-as-read', chatController.handleMarkMessagesAsRead);

    router.use('/admin', adminRouter);

    router.post('/sign-up', cusAuthController.handleSignUp);
    router.post('/sign-in', cusAuthController.handleSignIn);
    router.post('/logout', cusAuthController.handleLogout);
    router.post('/refresh-token', cusAuthController.handleRefreshToken);
    router.get('/cus/:id/verify/:token', cusAuthController.handleVerify);
    router.post('/password-reset-link', cusAuthController.handleResetPasswordSendLink);
    router.get('/password-reset/:id/:token', cusAuthController.handleResetPasswordVerify);
    router.post('/password-reset/:id/:token', cusAuthController.handleResetPassword);
    router.post('/verify-and-reset/:id/:token', cusAuthController.handleVerifyAndResetPassword);
    router.get('/auth/google',
        passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
      
    router.get('/auth/google/callback', (req, res, next) => {
        passport.authenticate('google', (err, profile) => {
            req.user = profile;
            next();
        })(req, res, next);
    }, (req, res) => {
        res.redirect(`${process.env.REACT_URL}/sign-in-success-google/${req.user?.id}/${req.user.tokenLoginGoogle}`);
    }); 

    router.post('/sign-in-success-google', cusAuthController.handleSignInGoogleSuccess);

    router.get('/auth/github',
        passport.authenticate('github', { scope: ['profile'], session: false }));
      
    router.get('/auth/github/callback', (req, res, next) => {
        passport.authenticate('github', (err, profile) => {
            req.user = profile;
            next();
        })(req, res, next);
    }, (req, res) => {
        res.redirect(`${process.env.REACT_URL}/sign-in-success-github/${req.user?.id}/${req.user.tokenLoginGithub}`);
    });

    router.post('/sign-in-success-github', cusAuthController.handleSignInGithubSuccess);

    router.get('/banner/read', cusHomeController.handleGetBanner);
    router.get('/team/read', cusHomeController.handleGetTeam);
    router.get('/category/read-parent', cusHomeController.handleGetParentCategory);
    router.get('/event/get-new-event', cusHomeController.handleGetNewEvent);
    router.get('/product/get-all-trending', cusHomeController.handleGetAllTrending);
    router.get('/product/get-search-products', cusHomeController.handleGetSearchProducts);
    router.get('/product/get-all-sales-products', cusHomeController.handleGetAllSalesProducts);
    router.get('/product/get-all-best-seller', cusHomeController.handleGetAllBestSeller);
    router.get('/post/get-post', cusHomeController.handleGetPost);

    router.get('/shop/get-all-infor-product', cusShopController.handleGetAllInforProduct);
    router.get('/shop/get-single-product/:slug', cusShopController.handleGetSingleProduct);

    router.get('/post/get-all-post', cusPostController.handleGetAllPost);
    router.get('/post/get-single-post/:slug', cusPostController.handleGetSinglePost);
    router.post('/post/increment-view-count/:slug', cusPostController.handleIncrementViewCount);
    router.get('/post/get-popular-post', cusPostController.handleGetPopularPost);

    router.get('/voucher/get-all-vouchers-guest', cusVoucherController.handleGetAllVoucherForGuest);
    router.get('/voucher/get-all-vouchers', checkCustomerJWT, cusVoucherController.handleGetAllVouchers);
    router.post('/voucher/save-voucher', checkCustomerJWT, cusVoucherController.handleSaveVoucher);

    router.post('/cart/add-to-cart', checkCustomerJWT, cusCartController.handleAddToCart);
    router.get('/cart/get-count', checkCustomerJWT, cusCartController.handleGetCount);
    router.get('/cart/get-cart', checkCustomerJWT, cusCartController.handleGetCart);
    router.put('/cart/update-cart-item-quantity', checkCustomerJWT, cusCartController.handleUpdateCartItemQuantity);
    router.delete('/cart/delete-cart-item', checkCustomerJWT, cusCartController.handleDeleteCartItem);
    router.get('/cart/get-related-products', checkCustomerJWT, cusCartController.handleGetRelatedProducts);

    router.post('/wishlist/add-to-wishlist', checkCustomerJWT, cusWishlistController.handleAddToWishList);
    router.get('/wishlist/get-count', checkCustomerJWT, cusWishlistController.handleGetCount);
    router.get('/wishlist/get-wish-list', checkCustomerJWT, cusWishlistController.handleGetWishList);
    router.delete('/wishlist/delete-wishlist-item', checkCustomerJWT, cusWishlistController.handleDeleteWishListItem);

    router.get('/checkout/get-address', checkCustomerJWT, cusCheckOutController.handleGetAddress);
    router.post('/checkout/add-new-address', checkCustomerJWT, cusCheckOutController.handleAddNewAddress);
    router.put('/checkout/update-address', checkCustomerJWT, cusCheckOutController.handleUpdateAddress); 
    router.delete('/checkout/delete-address', checkCustomerJWT, cusCheckOutController.handleDeleteAddress);
    router.get('/checkout/get-my-voucher', checkCustomerJWT, cusCheckOutController.handleGetMyVoucher);   
    router.post('/checkout/create-order', checkCustomerJWT, cusCheckOutController.handleCreateOrder);

    router.get('/order/my-orders', checkCustomerJWT, cusOrderController.handleGetMyOrders);
    router.put('/order/cancel/:orderId', checkCustomerJWT, cusOrderController.handleCancelOrder);
    router.put('/order/confirm-received/:orderId', checkCustomerJWT, cusOrderController.handleConfirmReceivedOrder);
    router.post('/order/submit-review/:productId', checkCustomerJWT, cusOrderController.handleSubmitReview);
    router.put('/order/update-review/:reviewId', checkCustomerJWT, cusOrderController.handleUpdateReview);

    router.get('/profile/get-profile', checkCustomerJWT, cusProfileController.handleGetProfile);
    router.post('/profile/send-verification-code', checkCustomerJWT, cusProfileController.handleSendVerificationCode);
    router.post('/profile/update-profile-email', checkCustomerJWT, cusProfileController.handleUpdateProfileEmail);
    router.put('/profile/update-profile', checkCustomerJWT, upload.single('image'), cusProfileController.handleUpdateProfile);
    router.put('/profile/change-password', checkCustomerJWT, cusProfileController.handleChangePassword);

    router.post('/chat', chatController.handleCreateOrGetChat);
    router.post('/chat/send-message', chatController.handleSendMessage);
    router.get('/chat/get-messages/:chatId', chatController.handleGetMessages);
    router.get('/chat/get-unread-message-count', chatController.handleGetUnreadMessageCount);
    router.put('/chat/mark-messages-as-read', chatController.handleMarkMessagesAsRead);

    return app.use('/api/v1/', router);
}

export default initApiRoutes;