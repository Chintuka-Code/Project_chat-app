const express = require('express');
const router = express.Router();

// Middleware
const Auth = require('../Middleware/Auth');
const checkRole = require('../Middleware/check_permission');

// Models
const BATCH = require('../Models/batch');

router.post('/create-batch', Auth, checkRole('B10'), async (req, res) => {
  const { data } = req.body;

  try {
    const create = await BATCH.create(data);
    res.status(200).json({ err: 0, message: 'Batch Created', create });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// // get course (status = enable/disabled)
router.get(
  '/get-batch/enable/:type',
  Auth,
  checkRole('B00'),
  async (req, res) => {
    try {
      const data = await BATCH.find(
        { disabled: req.params.type },
        {
          course_id: 0,
          __v: 0,
          updatedAt: 0,
          active_days: 0,
          batch_start_time: 0,
          batch_end_time: 0,
        }
      ).sort({ createdAt: 'desc' });

      res.status(200).json({ err: 0, data });
    } catch (error) {
      res.status(404).json({ err: 1, message: error.message, error });
    }
  }
);

router.get(
  '/view-batch-details/:batch_id',
  Auth,
  checkRole('B01'),
  async (req, res) => {
    try {
      const data = await BATCH.findById({ _id: req.params.batch_id })
        .populate({
          path: 'course_id',
          select: { disabled: 0, _id: 0, updatedAt: 0, __v: 0, createdAt: 0 },
          populate: {
            path: 'subject_ids',
            select: { updatedAt: 0, __v: 0, createdAt: 0, disabled: 0, _id: 0 },
          },
        })
        .select({ disabled: 0, _id: 0, updatedAt: 0, __v: 0 });

      res.status(200).json({ err: 0, data });
    } catch (error) {
      res.status(404).json({ err: 1, message: error.message, error });
    }
  }
);

router.post('/update-status', Auth, async (req, res) => {
  try {
    const { data } = req.body;

    await BATCH.findByIdAndUpdate({ _id: data._id }, data);

    res.status(200).json({ err: 0, message: 'Batch Update' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get('/get-edit-batch-details/:batch_id', Auth, async (req, res) => {
  try {
    const data = await BATCH.findById({ _id: req.params.batch_id })
      .populate({
        path: 'course_id',
        select: {
          disabled: 0,
          updatedAt: 0,
          __v: 0,
          createdAt: 0,
          subject_ids: 0,
        },
      })
      .select({ disabled: 0, _id: 0, updatedAt: 0, __v: 0 });

    res.status(200).json({ err: 0, data });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get(
  '/batch-details-for-add-student/:batch_id',
  Auth,
  async (req, res) => {
    try {
      const data = await BATCH.findById(
        { _id: req.params.batch_id },
        { _id: 1 }
      ).populate({
        path: 'course_id',
        select: { subject_ids: 1, _id: 0 },
      });
      res.status(200).json({ err: 0, data });
    } catch (error) {
      res.status(404).json({ err: 1, message: error.message, error });
    }
  }
);

router.get('/get-batch-details-home', Auth, async (req, res) => {
  try {
    const { active_user } = req.body;

    const data = await Promise.all(
      active_user.batch_ids.map(
        async (batch_id) =>
          await BATCH.findById(
            { _id: batch_id },
            {
              disabled: 0,
              course_id: 0,
              createdAt: 0,
              updatedAt: 0,
              __v: 0,
              batch_duration: 0,
            }
          )
      )
    );

    res.status(200).json({ err: 0, data });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

module.exports = router;
