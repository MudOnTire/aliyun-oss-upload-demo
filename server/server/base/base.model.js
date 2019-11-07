const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
  fromUser: { type: Schema.Types.ObjectId, ref: 'account' },
  createdTime: Date,
  updatedTime: Date,
  isDeleted: Boolean
};
