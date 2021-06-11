const mongoose = require('mongoose');

const admin_schema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, require: true },
    batch_ids: { type: [String], default: [], ref: 'batch' },
    disabled: { type: Boolean, require: true, default: false },
    permissions: { type: [String], require: true },
    user_type: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', admin_schema);
