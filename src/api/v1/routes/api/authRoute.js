const express = require('express');
const router = express.Router();

//---------------- Controllers ----------------
const authController = require('../../controllers/authController');

//---------------- Middleware -----------------
const authMiddlewares = require('../../middlewares/authMiddleware');

//---------------- Routes ----------------
router.post('/register', authController.register);
router.post('/login', authController.login);
router.delete('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.put('/change-password', [authMiddlewares.isAuthentication], authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);
router.use('/get-user-list', [authMiddlewares.isAuthentication], authController.getListUser);
// router.post('/google', authController.authGoogle);

module.exports = router;