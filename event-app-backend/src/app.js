const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/events', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Configurar a pasta para arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Importar rotas
const eventRoutes = require('./routes/eventRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Usar rotas
app.use('/api/events', eventRoutes);
app.use('/api/payments', paymentRoutes);

// Rota padrão opcional
app.get('/', (req, res) => {
  res.send('API funcionando');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
