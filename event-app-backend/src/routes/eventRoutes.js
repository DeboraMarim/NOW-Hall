const express = require('express');
const router = express.Router();
const EventController = require('../controllers/EventController');

router.get('/', EventController.getAllEvents);
router.post('/', EventController.createOrUpdateEvent);
router.post('/add-names', EventController.addNamesToEvent);
router.post('/clear-names', EventController.clearEventNames);
router.get('/export-names/:day', EventController.exportNamesToPDF);
router.get('/export-names-excel/:day', EventController.exportNamesToExcel);
router.post('/clear-all', EventController.clearAllEvents);


module.exports = router;
