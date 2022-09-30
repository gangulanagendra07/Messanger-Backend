const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.post('/register', authController.CreateUser);
router.post('/login', authController.LoginUser);

module.exports = router;