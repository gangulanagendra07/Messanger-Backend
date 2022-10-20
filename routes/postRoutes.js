const express = require('express');
const router = express();

const AuthHelpers = require('../Helpers/AuthHelper');
const postController = require('../controllers/post');

router.get('/posts', AuthHelpers.VerifyToken, postController.GetAllPsots);
router.get('/post/:id', AuthHelpers.VerifyToken, postController.GetPost);
router.post('/post/add-post', AuthHelpers.VerifyToken, postController.AddPost);
router.post('/post/add-like', AuthHelpers.VerifyToken, postController.AddLike);
router.post('/post/add-comment', AuthHelpers.VerifyToken, postController.AddComment);


module.exports = router;