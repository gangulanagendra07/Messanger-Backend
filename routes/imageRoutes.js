const express = require('express');
const router = express();

const AuthHelpers = require('../Helpers/AuthHelper');
const imageCtrl = require('../controllers/images');

router.get('/set-default-image/:imgId/:imgVersion', AuthHelpers.VerifyToken, imageCtrl.setDefaultImage)
router.post('/upload-image', AuthHelpers.VerifyToken, imageCtrl.uploadImage);


module.exports = router;