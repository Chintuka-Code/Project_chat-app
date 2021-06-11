const mongoose = require('mongoose');

const student = mongoose.Schema(
  {
    batch_ids: [
      {
        active: { type: Boolean, require: true, default: true },
        batch_ids: {
          type: mongoose.Schema.ObjectId,
          require: true,
          ref: 'batch',
          default: null,
        },
        subject_ids: [
          {
            type: [mongoose.Schema.ObjectId],
            require: true,
            ref: 'subject',
            default: [],
          },
        ],
      },
    ],
    date_of_joining: { type: Date, require: true, default: null },
    disabled: { type: Boolean, require: true, default: false },
    email: { type: String, require: true, unique: true },
    first_time: { type: Boolean, require: true, default: true },
    name: { type: String, require: true, default: null },
    password: { type: String, require: true },
    permission: { type: [String], require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('student', student);
