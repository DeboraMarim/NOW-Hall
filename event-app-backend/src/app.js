const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const cron = require('node-cron');
const eventRoutes = require('./routes/eventRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const webhookRoutes = require('./routes/webhookRoutes'); // Certifique-se de importar a rota do webhook
const PaymentModel = require('./models/Payment');  // Certifique-se de que o caminho está correto
const { checkPaymentStatus } = require('./utils/checkPaymentStatus');  // Função para verificar status de pagamento

require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

// Conexão com o MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/events', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Configurar a pasta para arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Usar rotas
app.use('/api/events', eventRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/webhook', webhookRoutes); // Adicione a rota do webhook aqui

// Rota padrão opcional
app.get('/', (req, res) => {
  res.send('API funcionando');
});

// Rotina para verificar pagamentos pendentes a cada 2 minutos
cron.schedule('*/2 * * * *', async () => {
  console.log('Verificando pagamentos pendentes...');
  const pendingPayments = await PaymentModel.find({ status: 'pending' });

  pendingPayments.forEach(async (payment) => {
    await checkPaymentStatus(payment.paymentId);
  });
});

// Iniciar o servidor
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});

module.exports = app;
