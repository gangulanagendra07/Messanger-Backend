const express = require('express');
const router = express();
const AuthHelpers = require('../Helpers/AuthHelper');
const UserCtrl = require('../controllers/users');

router.get('/users', AuthHelpers.VerifyToken, UserCtrl.GetAllUsers);
router.get('/user/:id', AuthHelpers.VerifyToken, UserCtrl.GetUser);
router.get('/username/:username', AuthHelpers.VerifyToken, UserCtrl.GetUserByName);

module.exports = router;