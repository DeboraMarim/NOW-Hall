const { MercadoPagoConfig, Payment } = require('mercadopago');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const PaymentModel = require('../models/Payment');  // Atualize o caminho conforme necessário

const client = new MercadoPagoConfig({
    accessToken: 'APP_USR-1923560273176252-062722-0be379e0088c3bd981c0aefbb6da8316-241870472',
    // accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN, 

    options: { timeout: 5000 }
});

const payment = new Payment(client);

const createPixPayment = async (req, res) => {
    const { transaction_amount, description, email, identificationType, identificationNumber, names, day } = req.body;

    const body = {
        transaction_amount,
        description,
        payment_method_id: 'pix',
        payer: {
            email,
            identification: {
                type: identificationType,
                number: identificationNumber
            }
        },
        metadata: {
            names,
            day
        }
    };

    const requestOptions = {
        idempotencyKey: uuidv4()
    };

    try {
        const response = await payment.create({ body, requestOptions });
        console.log("Resposta do Mercado Pago:", response);

        // Salvar os dados do pagamento no MongoDB
        const paymentData = new PaymentModel({
            paymentId: response.id,
            names,
            day,
            status: response.status,
            statusDetail: response.status_detail,
            transactionAmount: transaction_amount
        });

        await paymentData.save();

        res.status(200).json(response);  // Enviar a resposta JSON para o frontend
    } catch (error) {
        console.error("Erro ao criar o pagamento:", error);
        res.status(500).json({ error: 'Erro ao criar o pagamento' });
    }
};

module.exports = {
    createPixPayment
};
