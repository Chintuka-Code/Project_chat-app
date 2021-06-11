const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware
const Auth = require('../Middleware/Auth');
const checkRole = require('../Middleware/check_permission');

// Models
const BATCH = require('../Models/batch');
const STUDENT = require('../Models/students');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await STUDENT.findOne(
      { email },
      { createdAt: 0, updatedAt: 0, user_type: 0, disabled: 0, __v: 0 }
    );

    if (!user) {
      throw new Error('User not Found');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new Error('Password Not Match');
    }
    user = user.toObject();
    user.user_id = user._id;

    const token = await jwt.sign(user, process.env.JWT_KEY, {
      expiresIn: '1h',
    });

    res.json({ error: 0, message: 'Login Success', token, uid: user.user_id });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// single student
router.post('/create-student', Auth, async (req, res) => {
  try {
    const { data } = req.body;
    data.password = bcrypt.hashSync(
      data.password,
      parseInt(process.env.BCRYPT_SALT)
    );
    await STUDENT.create(data);

    res.status(200).json({ err: 0, message: 'Student Created' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.post('/bulk-registration-student', Auth, async (req, res) => {
  try {
    const { data } = req.body;

    await Promise.all(
      data.map(async (student) => {
        const exists = await STUDENT.exists({ email: student.email });
        if (!exists) {
          const st = {
            email: student.email.toLowerCase(),
            password: bcrypt.hashSync(
              'datatrained',
              parseInt(process.env.BCRYPT_SALT)
            ),
            disabled: false,
            permission: ['S00'],
            batch_ids: [],
            date_of_joining: null,
            first_time: true,
            name: null,
          };
          await STUDENT.create(st);
        }
      })
    );

    res.status(200).json({ err: 0, message: 'Student Created' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get('/get-student-details/:student_id', Auth, async (req, res) => {
  try {
    const data = await STUDENT.findById(
      {
        _id: req.params.student_id,
      },
      { name: 1, email: 1, createdAt: 1 }
    ).populate([
      {
        path: 'batch_ids.batch_ids',
        select: { disabled: 0, __v: 0, updatedAt: 0 },
        populate: {
          path: 'course_id',
          select: { course_name: 1, createdAt: 1 },
        },
      },
      {
        path: 'batch_ids.subject_ids',
        select: { subject_name: 1 },
      },
    ]);

    res.status(200).json({ err: 0, data });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get('/get-all-student/:type', Auth, async (req, res) => {
  try {
    const data = await STUDENT.find(
      { disabled: req.params.type },
      { name: 1, email: 1, disabled: 1 }
    );

    res.status(200).json({ err: 0, data });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get('/get-unassigned_batch_students', Auth, async (req, res) => {
  try {
    const data = await STUDENT.find(
      { batch_ids: [] },
      { name: 1, email: 1, createdAt: 1 }
    );

    res.status(200).json({ err: 0, data });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.post('/assign-batch-to-student', Auth, async (req, res) => {
  try {
    const { data } = req.body;

    await Promise.all(
      data.map(async (student) => {
        await STUDENT.findByIdAndUpdate(
          { _id: student._id },
          { batch_ids: student.batch_ids }
        );
      })
    );

    res.status(200).json({ err: 0, message: 'Add student into Batch' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get('/total-active-students', Auth, async (req, res) => {
  try {
    const count = await STUDENT.countDocuments({ disabled: false });
    res.status(200).json({ err: 0, count });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get('/get-student-profile/:student_id', Auth, async (req, res) => {
  try {
    const data = await STUDENT.findById(
      {
        _id: req.params.student_id,
      },
      { updatedAt: 0, __v: 0, disabled: 0, permission: 0, password: 0, _id: 0 }
    ).populate([
      {
        path: 'batch_ids.batch_ids',
        select: { disabled: 0, __v: 0, updatedAt: 0 },
        populate: {
          path: 'course_id',
          select: { course_name: 1, createdAt: 1, _id: 0 },
        },
      },
      {
        path: 'batch_ids.subject_ids',
        select: { subject_name: 1, _id: 0 },
      },
    ]);

    res.status(200).json({ err: 0, data });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.post('/update-profile', Auth, async (req, res) => {
  try {
    const { data } = req.body;

    const user = await STUDENT.findOne({ _id: data.user_id });

    if (!bcrypt.compareSync(data.old_password, user.password)) {
      throw new Error('Old Password Not Match');
    }

    const new_password = bcrypt.hashSync(
      data.new_password,
      parseInt(process.env.BCRYPT_SALT)
    );

    await STUDENT.findByIdAndUpdate(
      { _id: data.user_id },
      { name: data.name, password: new_password, first_time: false }
    );

    res.status(200).json({ err: 0, message: 'Profile Complete' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.post('/update-password', Auth, async (req, res) => {
  try {
    const { user_id } = req.body.active_user;

    const data = await STUDENT.findById(
      { _id: user_id },
      { password: 1, _id: 0 }
    );

    if (!bcrypt.compareSync(req.body.old_password, data.password)) {
      throw new Error('Old Password Not Match');
    }

    const new_password = bcrypt.hashSync(
      req.body.new_password,
      parseInt(process.env.BCRYPT_SALT)
    );

    await STUDENT.findByIdAndUpdate(
      { _id: user_id },
      { password: new_password }
    );
    res.status(200).json({ err: 0, message: 'User Update' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get(
  '/get-student-details-update/:student_id',
  Auth,
  async (req, res) => {
    try {
      const data = await STUDENT.findById(
        {
          _id: req.params.student_id,
        },
        { name: 1, email: 1, date_of_joining: 1, _id: 0 }
      ).populate([
        {
          path: 'batch_ids.batch_ids',
          select: { batch_name: 1 },
          // populate: {
          //   path: 'course_id',
          //   select: { course_name: 1, createdAt: 1 },
          // },
        },
        {
          path: 'batch_ids.subject_ids',
          select: { subject_name: 1 },
        },
      ]);

      res.status(200).json({ err: 0, data });
    } catch (error) {
      res.status(404).json({ err: 1, message: error.message, error });
    }
  }
);

router.post(
  '/update-student-profile',
  Auth,
  checkRole('US01'),
  async (req, res) => {
    try {
      const { data } = req.body;

      await STUDENT.findByIdAndUpdate(
        { _id: data.student_id },
        {
          name: data.name,
          email: data.email,
          date_of_joining: data.date_of_joining,
          batch_ids: data.batch_ids,
        }
      );

      res.status(200).json({ err: 0, message: 'Student Update' });
    } catch (error) {
      res.status(404).json({ err: 1, message: error.message, error });
    }
  }
);

module.exports = router;
