const express = require('express');
const router = express.Router();

// models
const BLOG = require('../Models/blog');

// Middleware
const Auth = require('../Middleware/Auth');
const checkRole = require('../Middleware/check_permission');

router.post('/create-blog', Auth, checkRole('BLOG01'), async (req, res) => {
  try {
    const { data } = req.body;

    await BLOG.create(data);

    res.status(200).json({ err: 0, message: 'Blog Created' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get(
  '/get-all-blog/:type',
  Auth,
  checkRole('BLOG00'),
  async (req, res) => {
    try {
      const data = await BLOG.find(
        { published: req.params.type },
        { heading: 1, createdAt: 1, view: 1, like: 1, published: 1 }
      );

      res.status(200).json({ err: 0, data });
    } catch (error) {
      res.status(404).json({ err: 1, message: error.message, error });
    }
  }
);

router.post(
  '/published-unpublished',
  Auth,
  checkRole('BLOG11'),
  async (req, res) => {
    try {
      const { data } = req.body;

      await BLOG.findByIdAndUpdate({ _id: data._id }, data);

      res.status(200).json({ err: 0, message: 'Blog Update' });
    } catch (error) {
      res.status(404).json({ err: 1, message: error.message, error });
    }
  }
);

router.get('/blog-details/:blog_id', Auth, async (req, res) => {
  try {
    const data = await BLOG.findById({ _id: req.params.blog_id });

    res.status(200).json({ err: 0, data });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.post('/update-blog', Auth, checkRole('BLOG10'), async (req, res) => {
  try {
    const { data } = req.body;

    await BLOG.findByIdAndUpdate({ _id: data._id }, data);

    res.status(200).json({ err: 0, message: 'Blog Update' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

module.exports = router;
