const express = require('express');
const router = express.Router();

// Middleware
const Auth = require('../Middleware/Auth');

// Schema
const PERMISSION = require('../Models/permission');

router.get('/all-permission', Auth, async (req, res) => {
  try {
    const permission = await PERMISSION.find(
      {},
      { code: 1, groupBy: 1, permission_name: 1, _id: 0 }
    );
    res.status(200).json({ err: 0, permission });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

module.exports = router;
