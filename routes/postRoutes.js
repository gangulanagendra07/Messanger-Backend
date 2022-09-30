const express = require('express');
const router = express();

const AuthHelpers = require('../Helpers/AuthHelper');
const postController = require('../controllers/post');

router.get('/posts', AuthHelpers.VerifyToken, postController.GetAllPsots);
router.post('/post/add-post', AuthHelpers.VerifyToken, postController.AddPost);


module.exports = router;