const express = require('express');
const uploadRoutes = require('./server/upload/upload.route');

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

router.use('/upload', uploadRoutes);

module.exports = router;
