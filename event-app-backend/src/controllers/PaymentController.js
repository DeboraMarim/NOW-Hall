const axios = require('axios');
const Event = require('../models/Event');
const { GoogleSpreadsheet } = require('google-spreadsheet');

exports.createPayment = async (req, res) => {
  const { names, eventId } = req.body;
  const event = await Event.findById(eventId);
  const amount = event.price * names.length;

  // Criar pagamento via Mercado Pago (exemplo simplificado)
  const response = await axios.post('https://api.mercadopago.com/v1/payments', {
    transaction_amount: amount,
    description: 'Ingresso para evento',
    payment_method_id: 'pix',
    payer: { email: 'cliente@example.com' },
  });

  res.json({ payment_id: response.data.id, amount });
};

exports.handleWebhook = async (req, res) => {
  const { data } = req.body;
  const paymentId = data.id;
  const paymentStatus = data.status;

  if (paymentStatus === 'approved') {
    // Atualizar lista no Google Sheets
    const doc = new GoogleSpreadsheet('YOUR_GOOGLE_SHEET_ID');
    await doc.useServiceAccountAuth(require('./google-service-account.json'));
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    await sheet.addRows(req.body.names.map(name => ({ name, eventId: req.body.eventId })));

    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
};
