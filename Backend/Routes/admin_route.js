const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Models
const ADMIN = require('../Models/admin');

// Middleware
const Auth = require('../Middleware/Auth');
const checkRole = require('../Middleware/check_permission');

router.get('/', async (req, res) => {
  res.send('ok');
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await ADMIN.findOne(
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

router.post('/create-user', Auth, checkRole('U01'), async (req, res) => {
  try {
    if (
      !(
        req.body.name &&
        req.body.email &&
        req.body.permissions.length > 0 &&
        req.body.password.length > 8 &&
        req.body.user_type
      )
    ) {
      throw new Error(
        `All fields are required .Password length must be greater then 8 character`
      );
    }
    req.body.password = bcrypt.hashSync(
      req.body.password,
      parseInt(process.env.BCRYPT_SALT)
    );

    await ADMIN.create(req.body);

    res.status(200).json({ err: 0, message: 'User Created' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// checkRole('code'),
router.get('/get-my-profile', Auth, async (req, res) => {
  try {
    const { active_user } = req.body;
    res.json({ active_user });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get('/admin-accounts', Auth, checkRole('U00'), async (req, res) => {
  try {
    const data = await ADMIN.find(
      { disabled: false },
      { name: 1, email: 1, user_type: 1 }
    );
    res.status(200).json({ err: 0, data });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get('/get-user-id/:userID', Auth, checkRole('U10'), async (req, res) => {
  try {
    const data = await ADMIN.findById({ _id: req.params.userID });
    res.status(200).json({ err: 0, data });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.post('/update-user-id/:userID', Auth, async (req, res) => {
  try {
    const update = await ADMIN.findByIdAndUpdate(
      { _id: req.params.userID },
      req.body
    );
    res.status(200).json({ err: 0, message: 'User Update' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.post('/update-password', Auth, async (req, res) => {
  try {
    const { user_id } = req.body.active_user;

    const data = await ADMIN.findById(
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

    const update = await ADMIN.findByIdAndUpdate(
      { _id: user_id },
      { password: new_password }
    );
    res.status(200).json({ err: 0, message: 'User Update' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.post('/add-admin-into-batch', Auth, async (req, res) => {
  try {
    const { data } = req.body;

    await ADMIN.findByIdAndUpdate(
      { _id: data.user_id },
      { batch_ids: data.batch }
    );

    res.status(200).json({ err: 0, message: 'Added' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get('/get-admin-batch-details', Auth, async (req, res) => {
  try {
    const { active_user } = req.body;
    const data = await ADMIN.findById(
      { _id: active_user.user_id },
      { name: 1, batch_ids: 1 }
    ).populate({
      path: 'batch_ids',
      select: {
        batch_duration: 0,
        course_id: 0,
        createdAt: 0,
        disabled: 0,
        updatedAt: 0,
        __v: 0,
      },
    });

    res.status(200).json({ err: 0, data });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get('/get-admin-list', Auth, async (req, res) => {
  try {
    const data = await ADMIN.find({ disabled: false }, { name: 1 });

    res.status(200).json({ err: 0, data });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

module.exports = router;
