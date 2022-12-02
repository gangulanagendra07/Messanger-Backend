const express = require('express');
const router = express();
const AuthHelpers = require('../Helpers/AuthHelper');
const UserCtrl = require('../controllers/users');

router.get('/users', AuthHelpers.VerifyToken, UserCtrl.GetAllUsers);
router.get('/user/:id', AuthHelpers.VerifyToken, UserCtrl.GetUser);
router.get('/username/:username', AuthHelpers.VerifyToken, UserCtrl.GetUserByName);
router.post('/view-profile', AuthHelpers.VerifyToken, UserCtrl.ProfileView);
router.post('/change-password', AuthHelpers.VerifyToken, UserCtrl.ChangePassword);

module.exports = router;