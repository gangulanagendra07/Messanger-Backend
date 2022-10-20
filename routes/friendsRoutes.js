const express = require('express');
const router = express();

const AuthHelpers = require('../Helpers/AuthHelper');
const friendsCtrl = require('../controllers/friends');

router.post('/follow-user', AuthHelpers.VerifyToken, friendsCtrl.followUser);
router.post('/unfollow-user', AuthHelpers.VerifyToken, friendsCtrl.unfollowUser);
router.post('/mark/:id', AuthHelpers.VerifyToken, friendsCtrl.markNotification);
router.post('/mark-all', AuthHelpers.VerifyToken, friendsCtrl.markAllNotifications)


module.exports = router;