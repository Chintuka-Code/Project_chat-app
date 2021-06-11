const jwt = require('jsonwebtoken');

const Auth = (req, res, next) => {
  try {
    if (!req.header('Authorization')) {
      console.log('error');
      throw new Error('Auth Failed. Token Required');
    }
    const token = req.header('Authorization').split(' ')[1];
    var user = jwt.verify(token, process.env.JWT_KEY);
    req.body.active_user = user;

    next();
  } catch (error) {
    res.status(535).json({ err: 1, message: error.message, error });
  }
};

module.exports = Auth;
