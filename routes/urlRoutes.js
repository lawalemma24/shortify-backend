const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');
const statController = require('../controllers/statController');


router.post('/encode', urlController.encodeUrl);


router.get('/decode', urlController.decodeUrl);


router.get('/statistic/:urlPath', statController.getStats);

router.get('/list', urlController.listUrls);


router.get('/:shortCode', urlController.redirectUrl);

module.exports = router;