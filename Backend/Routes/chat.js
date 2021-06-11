const { text } = require('express');
const express = require('express');
const router = express.Router();

// Middleware
const Auth = require('../Middleware/Auth');
const checkRole = require('../Middleware/check_permission');

// models
const CHAT = require('../Models/chat');

router.get(
  '/get-previous-chat/:student_id/:batch_id',
  Auth,
  async (req, res) => {
    try {
      const data = await CHAT.findOne({
        student_id: req.params.student_id,
        batch_id: req.params.batch_id,
      });

      res.status(200).json({ err: 0, data });
    } catch (error) {
      res.status(404).json({ err: 1, message: error.message, error });
    }
  }
);

router.post('/create-chat', Auth, async (req, res) => {
  try {
    const { data } = req.body;

    const chat = await CHAT.create(data);

    res
      .status(200)
      .json({ err: 0, message: 'Chat Created', chat_id: chat._id });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get('/get-chat-by-batchID/:batch_id', Auth, async (req, res) => {
  try {
    const data = await CHAT.find(
      { batch_id: req.params.batch_id },
      { message: 0 }
    ).or([{ sme_id: null }, { sme_id: req.body.active_user.user_id }]);

    res.status(200).json({ err: 0, data });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get('/get-chat-by-id/:chat_id', Auth, async (req, res) => {
  try {
    const data = await CHAT.findById(
      { _id: req.params.chat_id },
      { message: 1, _id: 0 }
    );
    res.status(200).json({ err: 0, data });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get('/get-chat-trainer-mode/:batch_id', async (req, res) => {
  try {
    const batch_id = req.params.batch_id;

    const data = await CHAT.find({ batch_id })
      .select({
        message: { $slice: -5 },
        student_id: 1,
      })
      .exec();

    let message = [];

    data.forEach((chat) => {
      chat.message.map((txt) => {
        if (txt.sender_type == 'student') {
          const newOBJ = {
            attachment: txt.attachment,
            created_at: txt.created_at,
            sender_name: txt.sender_name,
            sender_type: txt.sender_type,
            sme_id: txt.sme_id,
            student_id: chat.student_id,
            text_message: txt.text_message,
            chat_id: chat._id,
          };

          message.push(newOBJ);
        }
      });
    });

    res.status(200).json({ err: 0, data: message });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

module.exports = router;
