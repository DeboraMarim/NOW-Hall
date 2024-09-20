const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');

// Rota para criação de pagamento Pix
router.post('/create-pix', PaymentController.createPixPayment);

module.exports = router;
