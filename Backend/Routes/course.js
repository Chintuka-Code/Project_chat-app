const express = require('express');
const router = express.Router();

// Middleware
const Auth = require('../Middleware/Auth');
const checkRole = require('../Middleware/check_permission');

// models
const COURSE = require('../Models/course');

router.post('/create-course', Auth, checkRole('C10'), async (req, res) => {
  try {
    const { data } = req.body;
    const create = await COURSE.create(data);

    res.status(200).json({ err: 0, message: 'Course Created' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// // get course (status = enable/disabled)
router.get('/get-course/enable/:type', Auth, async (req, res) => {
  try {
    const data = await COURSE.find(
      { disabled: req.params.type },
      { subject_ids: 0, __v: 0, updatedAt: 0 }
    ).sort({ createdAt: 'desc' });

    res.status(200).json({ err: 0, data });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get('/get-course/:status', Auth, checkRole('C00'), async (req, res) => {
  try {
    const data = await COURSE.find({})
      .populate('subject_ids', 'subject_name')
      .select({ updatedAt: 0, __v: 0 })
      .exec();

    res.json(data);
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.post('/update-status', Auth, checkRole('C11'), async (req, res) => {
  const { data } = req.body;

  try {
    await COURSE.findByIdAndUpdate({ _id: data._id }, data);
    res.status(200).json({ err: 0, message: 'Course Updated' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get('/get-course/view-course/:id', Auth, async (req, res) => {
  try {
    const data = await COURSE.findById({ _id: req.params.id })
      .populate('subject_ids', { subject_name: 1, _id: 0 })
      .select({ updatedAt: 0, __v: 0, _id: 0 })
      .exec();

    res.status(200).json({ err: 0, data });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get('/get-course/edit-course/:id', Auth, async (req, res) => {
  try {
    const data = await COURSE.findById(
      { _id: req.params.id },
      { __v: 0, disabled: 0, createdAt: 0, updatedAt: 0, _id: 0 }
    );

    res.status(200).json({ err: 0, data });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.post('/upadte-course-details/:course_id', Auth, async (req, res) => {
  try {
    const { data } = req.body;
    await COURSE.findByIdAndUpdate({ _id: req.params.course_id }, data);

    res.status(200).json({ err: 0, message: 'Course Update' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

module.exports = router;
