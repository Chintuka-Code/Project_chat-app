const mongoose = require('mongoose');

const category = mongoose.Schema(
  {
    category_name: { type: String, require: true, unique: true },
    feature_in: { type: [String], require: true },
    disabled: { type: Boolean, require: true, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('category', category);
