const mongoose = require('mongoose');

const batch = mongoose.Schema(
  {
    active_days: { type: [String], require: true, default: [] },
    batch_duration: { type: String, require: true },
    batch_start_date: { type: Date, require: true },
    batch_end_date: { type: Date, require: true },
    batch_start_time: { type: Date, require: true },
    batch_end_time: { type: Date, require: true },
    batch_name: { type: String, require: true },
    course_id: { type: mongoose.Schema.ObjectId, ref: 'course', require: true },
    disabled: { type: Boolean, require: true, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('batch', batch);
