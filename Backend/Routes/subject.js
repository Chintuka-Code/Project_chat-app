const express = require('express');
const router = express.Router();

// Middleware
const Auth = require('../Middleware/Auth');
const checkRole = require('../Middleware/check_permission');

// models
const SUBJECT = require('../Models/subject');

router.post('/create-subject', Auth, checkRole('SUB01'), async (req, res) => {
  try {
    const { data, active_user } = req.body;

    await Promise.all(
      data.map(async (subject) => {
        await SUBJECT.create({ subject_name: subject });
      })
    );

    res.status(200).json({ err: 0, message: 'Subjects Created' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get(
  '/all-subject/enable/:status',
  Auth,
  checkRole('SUB00'),
  async (req, res) => {
    try {
      const data = await SUBJECT.find(
        { disabled: req.params.status },
        { subject_name: 1, createdAt: 1 }
      ).sort({ createdAt: 'desc' });

      res.status(200).json({ err: 0, data });
    } catch (error) {
      res.status(404).json({ err: 1, message: error.message, error });
    }
  }
);

router.post('/update-subject', Auth, checkRole('SUB10'), async (req, res) => {
  const { data } = req.body;

  try {
    const upadte = await SUBJECT.findByIdAndUpdate({ _id: data._id }, data);

    res.status(200).json({ err: 0, message: 'Subject Update' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

module.exports = router;
