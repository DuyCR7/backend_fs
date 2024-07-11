require('dotenv').config();
import express from 'express';
import adAuthController from "../controller/AdminController/AuthController";
import cusAuthController from "../controller/CustomerController/AuthController";
import { checkUserJWT, checkUserPermission } from "../middleware/jwtAction";
import passport from 'passport';

const router = express.Router();
const adminRouter = express.Router();

const initApiRoutes = (app) => {

    adminRouter.use(checkUserJWT);

    adminRouter.post('/sign-in', adAuthController.handleSignIn);
    adminRouter.post('/logout', adAuthController.handleLogout);
    adminRouter.post('/refresh-token', adAuthController.handleRefreshToken);
    adminRouter.get('/account', adAuthController.handleGetUserAccount);
    adminRouter.get("/get-by-id/:id", adAuthController.handleGetUserById);

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