const Event = require('../models/Event');
const path = require('path');
const fs = require('fs');

exports.getAllEvents = async (req, res) => {
  const events = await Event.find();
  res.json(events);
};

exports.createOrUpdateEvent = async (req, res) => {
  try {
    const { day, price } = req.body;
    let flyer;

    // Excluir todos os eventos anteriores antes de adicionar novos
    const deleteResult = await Event.deleteMany({});
    console.log("Todos os eventos anteriores foram excluídos. Result:", deleteResult);

    // Validar que a foto e o preço são fornecidos
    if (req.files && req.files.flyer) {
      const flyerFile = req.files.flyer;
      const flyerPath = path.join(__dirname, '../uploads/', flyerFile.name);
      flyer = `/uploads/${flyerFile.name}`;
      flyerFile.mv(flyerPath, (err) => {
        if (err) {
          console.error('Erro ao salvar o flyer:', err);
          return res.status(500).send(err);
        }
      });
    } else {
      return res.status(400).json({ message: 'A foto do evento é obrigatória.' });
    }

    if (!day || !price) {
      return res.status(400).json({ message: 'Day e price são obrigatórios.' });
    }

    // Cria um novo evento
    const event = new Event({ day, flyer, price });
    await event.save();
    console.log(`Novo evento criado: ${event}`);
    res.json(event);

  } catch (error) {
    console.error('Erro ao salvar o evento:', error);
    res.status(500).json({ message: 'Erro ao salvar o evento', error });
  }
};
