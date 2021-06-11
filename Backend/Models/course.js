const mongoose = require('mongoose');

const course = mongoose.Schema(
  {
    course_name: { type: String, require: true },
    disabled: { type: String, required: true, default: false },
    subject_ids: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'subject',
        require: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('course', course);
