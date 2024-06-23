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
    let flyer = req.body.flyer;

    // Salvar a imagem no servidor
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
    }

    // Limpar os eventos anteriores
    await Event.deleteMany();

    // Cria ou atualiza o evento
    let event = await Event.findOne({ day });
    if (event) {
      event.flyer = flyer;
      event.price = price;
      await event.save();
    } else {
      event = new Event({ day, flyer, price });
      await event.save();
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao salvar o evento', error });
  }
};
