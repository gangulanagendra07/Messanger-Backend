const express = require('express');
const router = express();

const AuthHelpers = require('../Helpers/AuthHelper');
const messageCtrl = require('../controllers/message');

router.get('/social-message/:sender_Id/:receiver_Id', AuthHelpers.VerifyToken, messageCtrl.GetAllMessages);
router.get('/receiver-messages/:sender/:receiver', AuthHelpers.VerifyToken, messageCtrl.MarkReceivedMessages);
router.get('/mark-all-messages', AuthHelpers.VerifyToken, messageCtrl.MarkAllMessages);
router.post('/social-message/:sender_Id/:receiver_Id', AuthHelpers.VerifyToken, messageCtrl.SendMessage);



module.exports = router;