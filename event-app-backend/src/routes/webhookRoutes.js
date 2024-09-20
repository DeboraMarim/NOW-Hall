const express = require('express');
const router = express.Router();
const WebhookController = require('../controllers/WebhookController');

router.post('/', WebhookController.handleWebhook);

module.exports = router;
