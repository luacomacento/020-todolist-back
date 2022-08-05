const jwt = require('jsonwebtoken');

const validateToken = (req, res, next) => {
  const {authorization: token} = req.headers;
  if (!token) return res.status(401)
    .json({message: 'Token not found'});

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401)
      .json({message: 'Expired or invalid token'});
    res.locals.user = decoded;
  })

  next();
}

module.exports = validateToken;