const express = require('express');
const router = express.Router();
const EventController = require('../controllers/EventController');

router.get('/', EventController.getAllEvents);
router.post('/', EventController.createOrUpdateEvent);

module.exports = router;
