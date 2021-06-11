const mongoose = require('mongoose');

const chat = mongoose.Schema({
  student_name: { type: String, require: true },
  batch_id: { type: mongoose.Schema.ObjectId, ref: 'batch', require: true },
  student_id: { type: mongoose.Schema.ObjectId, ref: 'student', require: true },
  sme_id: { type: mongoose.Schema.ObjectId, ref: 'Admin', default: null },
  student_name: { type: String, require: true },
  student_unread_count: { type: Number, require: true, default: 0 },
  admin_unread_count: { type: Number, require: true, default: 0 },
  room_id: { type: String, require: true },
  message: [
    {
      attachment: { type: [String] },
      created_at: { type: Date, default: Date.now() },
      text_message: { type: String },
      sender_name: { type: String, require: true, default: '' },
      sender_type: { type: String, require: true, default: '' },
      sme_id: { type: mongoose.Schema.ObjectId, ref: 'Admin', default: null },
    },
  ],
});

chat.index({ student_id: 1, batch_id: 1 }, { unique: true });

module.exports = mongoose.model('chat', chat);
