const express = require("express");
const router = express.Router();

const { sendMessageText, qrCodeString, sendMessageMedia, logout } = require("../controllers/WaController");

router.post('/api/qr-code', qrCodeString);
router.post('/api/send-message', sendMessageText);
router.post('/api/send-message-media', sendMessageMedia);
router.post('/api/logout', logout);

module.exports = router;