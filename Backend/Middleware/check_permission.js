const checkRole = (role) => {
  return (req, res, next) => {
    const user = req.body.active_user;

    if (user && user.permissions.includes(role)) {
      next();
    } else {
      res.status(401).json({
        err: 1,
        messgae: `Access Denied. Don't have Enough Permission`,
      });
    }
  };
};

module.exports = checkRole;
