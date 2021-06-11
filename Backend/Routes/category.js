const express = require('express');
const router = express.Router();

// Models
const CATEGORY = require('../Models/category');

// Middleware
const Auth = require('../Middleware/Auth');
const checkRole = require('../Middleware/check_permission');

router.post('/create-category', Auth, checkRole('CAT01'), async (req, res) => {
  try {
    const { data } = req.body;

    await CATEGORY.create(data);

    res.status(200).json({ err: 0, message: 'Category Created' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get(
  '/get-category/:type',
  Auth,
  checkRole('CAT00'),
  async (req, res) => {
    try {
      const data = await CATEGORY.find(
        { disabled: req.params.type },
        { updatedAt: 0, __v: 0, disabled: 0 }
      );

      res.status(200).json({ err: 0, data });
    } catch (error) {
      res.status(404).json({ err: 1, message: error.message, error });
    }
  }
);

router.post(
  '/update-category-status',
  Auth,
  checkRole('CAT11'),
  async (req, res) => {
    try {
      const { data } = req.body;

      await CATEGORY.findByIdAndUpdate({ _id: data._id }, data);

      res.status(200).json({ err: 0, message: 'Category Updated' });
    } catch (error) {
      res.status(404).json({ err: 1, message: error.message, error });
    }
  }
);

router.get('/get-category-by-id/:category_id', Auth, async (req, res) => {
  try {
    const data = await CATEGORY.findById(
      { _id: req.params.category_id },
      { category_name: 1, feature_in: 1, _id: 0 }
    );

    res.status(200).json({ err: 0, data });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.post('/update-category', Auth, checkRole('CAT10'), async (req, res) => {
  try {
    const { data } = req.body;

    await CATEGORY.findByIdAndUpdate({ _id: data.category_id }, data);

    res.status(200).json({ err: 0, message: 'Category Updated' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get('/get-category-type/:type', async (req, res) => {
  try {
    const data = await CATEGORY.find(
      { feature_in: req.params.type, disabled: false },
      { category_name: 1 }
    );

    res.status(200).json({ err: 0, data });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

module.exports = router;
