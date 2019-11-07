const express = require('express');
const authChecker = require('../../util/authChecker');

function baseRouter(controller) {
  const router = express.Router();
  router.route('/')
    .get(controller.query)
    .post(authChecker, controller.create)
    .delete(authChecker, controller.deleteMany);

  router.route('/:id')
    .get(controller.findById)
    .delete(authChecker, controller.remove)
    .put(authChecker, controller.update);

  return router;
}

module.exports = baseRouter;
