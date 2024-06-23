const Event = require('../models/Event');
const path = require('path');
const fs = require('fs');

exports.getAllEvents = async (req, res) => {
  const events = await Event.find();
  console.log("Eventos carregados:", events); // Adicionar log para depuração
  res.json(events);
};

exports.createOrUpdateEvent = async (req, res) => {
  try {
    const { day, price, active } = req.body;
    let flyer = req.body.flyer;

    // Remover evento se não estiver ativo
    if (!active) {
      const deleteResult = await Event.deleteOne({ day });
      console.log(`Evento para ${day} removido. Result:`, deleteResult); // Adicionar log para depuração
      return res.json({ message: `Evento para ${day} removido.` });
    }

    // Validar que a foto e o preço são fornecidos se o evento estiver ativo
    if (active && (!req.files || !req.files.flyer || !price)) {
      return res.status(400).json({ message: 'A foto e o preço do evento são obrigatórios.' });
    }

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

    let event = await Event.findOne({ day });
    if (event) {
      // Atualiza o evento existente
      event.flyer = flyer;
      event.price = price;
      event.active = active;
      await event.save();
      console.log(`Evento atualizado: ${event}`); // Adicionar log para depuração
    } else {
      // Cria um novo evento
      event = new Event({ day, flyer, price, active });
      await event.save();
      console.log(`Novo evento criado: ${event}`); // Adicionar log para depuração
    }
    res.json(event);
  } catch (error) {
    console.error('Erro ao salvar o evento:', error); // Adicionar log para depuração
    res.status(500).json({ message: 'Erro ao salvar o evento', error });
  }
};
