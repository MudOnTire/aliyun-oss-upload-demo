const express = require('express');
const uploadCtrl = require('./upload.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/').post(uploadCtrl.upload);

router.route('/credential').get(uploadCtrl.getCredential);

module.exports = router;
