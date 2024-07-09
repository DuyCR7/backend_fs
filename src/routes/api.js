import express from 'express';
import adAuthController from "../controller/AdminController/AuthController";
import cusAuthController from "../controller/CustomerController/AuthController";
import { checkUserJWT, checkUserPermission } from "../middleware/jwtAction";

const router = express.Router();

const initApiRoutes = (app) => {

    router.all("*", checkUserJWT);

    router.post('/admin/sign-in', adAuthController.handleSignIn);
    router.post('/admin/logout', adAuthController.handleLogout);
    router.post('/admin/refresh-token', adAuthController.handleRefreshToken);
    router.get('/admin/account', adAuthController.handleGetUserAccount);
    router.get("/admin/get-by-id/:id", adAuthController.handleGetUserById);

    router.post('/sign-up', cusAuthController.handleSignUp);
    router.post('/sign-in', cusAuthController.handleSignIn);
    router.post('/logout', cusAuthController.handleLogout);
    router.post('/refresh-token', cusAuthController.handleRefreshToken);
    router.get('/test', cusAuthController.handleTest);

    return app.use('/api/v1/', router);
}

export default initApiRoutes;