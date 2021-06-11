const mongoose = require('mongoose');

const subject = mongoose.Schema(
  {
    subject_name: { type: String, require: true },
    disabled: { type: String, required: true, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('subject', subject);
