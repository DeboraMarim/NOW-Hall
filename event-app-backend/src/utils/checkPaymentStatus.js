const axios = require('axios');
const PaymentModel = require('../models/Payment');
const FridayEventNames = require('../models/FridayEventNames');
const SaturdayEventNames = require('../models/SaturdayEventNames');

const checkPaymentStatus = async (paymentId) => {
  try {
    const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer APP_USR-1923560273176252-062722-0be379e0088c3bd981c0aefbb6da8316-241870472`  // Substitua pelo seu token
      }
    });

    const paymentStatus = response.data.status;

    if (paymentStatus === 'approved') {
      const payment = await PaymentModel.findOne({ paymentId });

      if (payment) {
        const { names, day } = payment;

        if (day.includes('friday')) {
          let fridayEventNames = await FridayEventNames.findOne();
          if (!fridayEventNames) {
            fridayEventNames = new FridayEventNames({ names: [] });
          }
          fridayEventNames.names.push(...names);
          await fridayEventNames.save();
        }

        if (day.includes('saturday')) {
          let saturdayEventNames = await SaturdayEventNames.findOne();
          if (!saturdayEventNames) {
            saturdayEventNames = new SaturdayEventNames({ names: [] });
          }
          saturdayEventNames.names.push(...names);
          await saturdayEventNames.save();
        }

        console.log(`Pagamento ${paymentId} aprovado e nomes salvos nas coleções apropriadas.`);
        await PaymentModel.deleteOne({ paymentId });
      }
    } else {
      console.log(`Pagamento ${paymentId} ainda está pendente. Status atual: ${paymentStatus}`);
    }
  } catch (error) {
    console.error(`Erro ao verificar o status do pagamento ${paymentId}:`, error);
  }
};

module.exports = {
  checkPaymentStatus
};
