const Event = require('../models/Event');
const FridayEventNames = require('../models/FridayEventNames');
const SaturdayEventNames = require('../models/SaturdayEventNames');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const path = require('path');

exports.getAllEvents = async (req, res) => {
  const events = await Event.find();
  res.json(events);
};

exports.clearAllEvents = async (req, res) => {
  try {
    await Event.deleteMany();
    res.json({ message: 'Todos os eventos foram apagados com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao apagar todos os eventos', error });
  }
};

exports.createOrUpdateEvent = async (req, res) => {
  try {
    const { day, pistaPrice, camarotePrice, camaroteOpenPrice, type } = req.body;
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

    let event;
    if (type === 'em_breve') {
      // Criar ou atualizar evento "EM BREVE"
      event = new Event({
        day: 'em_breve',
        flyer,
        active: true,
        type: 'em_breve',
      });
      await event.save();
    } else {
      // Cria ou atualiza o evento regular
      event = await Event.findOne({ day });
      if (event) {
        event.flyer = flyer;
        event.pistaPrice = pistaPrice || event.pistaPrice;
        event.camarotePrice = camarotePrice || event.camarotePrice;
        event.camaroteOpenPrice = camaroteOpenPrice || event.camaroteOpenPrice;
        event.active = true; // Certifique-se de definir o evento como ativo
        await event.save();
      } else {
        event = new Event({
          day,
          flyer,
          pistaPrice,
          camarotePrice,
          camaroteOpenPrice,
          active: true,
        });
        await event.save();
      }
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao salvar o evento', error });
  }
};

exports.addNamesToEvent = async (req, res) => {
  const { day, names } = req.body;
  try {
    let eventNames;
    if (day === 'friday') {
      eventNames = await FridayEventNames.findOne();
      if (!eventNames) {
        eventNames = new FridayEventNames({ names: [] });
      }
    } else if (day === 'saturday') {
      eventNames = await SaturdayEventNames.findOne();
      if (!eventNames) {
        eventNames = new SaturdayEventNames({ names: [] });
      }
    } else {
      return res.status(400).json({ message: 'Dia inválido' });
    }

    eventNames.names.push(...names);
    await eventNames.save();
    res.json(eventNames);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar nomes ao evento', error });
  }
};

exports.clearEventNames = async (req, res) => {
  const { day } = req.body;
  try {
    if (day === 'friday') {
      await FridayEventNames.deleteMany();
      res.json({ message: 'Lista de nomes de sexta-feira apagada com sucesso' });
    } else if (day === 'saturday') {
      await SaturdayEventNames.deleteMany();
      res.json({ message: 'Lista de nomes de sábado apagada com sucesso' });
    } else {
      res.status(400).json({ message: 'Dia inválido' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao apagar a lista de nomes', error });
  }
};

exports.exportNamesToPDF = async (req, res) => {
  const { day } = req.params;
  try {
    let eventNames;
    let title;
    if (day === 'friday') {
      eventNames = await FridayEventNames.findOne();
      title = 'Nomes Confirmados para o Evento de Sexta-feira';
    } else if (day === 'saturday') {
      eventNames = await SaturdayEventNames.findOne();
      title = 'Nomes Confirmados para o Evento de Sábado';
    } else {
      return res.status(400).json({ message: 'Dia inválido' });
    }

    if (!eventNames) {
      return res.status(404).json({ message: 'Lista de nomes não encontrada' });
    }

    // Criar PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${title}.pdf`);
    doc.pipe(res);
    doc.fontSize(18).text(title, { align: 'center' });
    doc.moveDown();
    eventNames.names.forEach((name, index) => {
      doc.fontSize(12).text(`${index + 1}. ${name}`);
    });
    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao gerar PDF', error });
  }
};

exports.exportNamesToExcel = async (req, res) => {
  const { day } = req.params;
  try {
    let eventNames;
    let title;
    if (day === 'friday') {
      eventNames = await FridayEventNames.findOne();
      title = 'Nomes Confirmados para o Evento de Sexta-feira';
    } else if (day === 'saturday') {
      eventNames = await SaturdayEventNames.findOne();
      title = 'Nomes Confirmados para o Evento de Sábado';
    } else {
      return res.status(400).json({ message: 'Dia inválido' });
    }

    if (!eventNames) {
      return res.status(404).json({ message: 'Lista de nomes não encontrada' });
    }

    // Criar Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(title);

    worksheet.columns = [
      { header: 'Nº', key: 'index', width: 10 },
      { header: 'Nome', key: 'name', width: 30 }
    ];

    eventNames.names.forEach((name, index) => {
      worksheet.addRow({ index: index + 1, name: name });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${title}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao gerar Excel', error });
  }
};
