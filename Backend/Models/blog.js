const mongoose = require('mongoose');

const blog = mongoose.Schema(
  {
    heading: { type: String, require: true },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'category',
      require: true,
    },
    html: { type: String, require: true },
    published: { type: Boolean, require: true },
    user_id: { type: mongoose.Schema.ObjectId, ref: 'Admin', require: true },
    like: { type: Number, require: true, default: 0 },
    view: { type: Number, require: true, default: 0 },
    last_read: { type: Date, require: true },
    related_blog: { type: [String], require: true, default: [], ref: 'blog' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('blog', blog);
