const mongoose = require('mongoose');

const permission = mongoose.Schema({
  code: { type: String, require: true },
  permission_name: { type: String, required: true },
  groupBy: { type: String, require: true },
});

module.exports = mongoose.model('permission', permission);
