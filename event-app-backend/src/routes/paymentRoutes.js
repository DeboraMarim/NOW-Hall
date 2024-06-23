const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');

router.post('/create', PaymentController.createPayment);
router.post('/webhook', PaymentController.handleWebhook);

module.exports = router;
