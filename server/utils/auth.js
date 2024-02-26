import jwt from 'jsonwebtoken';
import { User } from '../models.js';

const SECRET_KEY = 'your_secret_key';

const generateToken = (user) => {
  const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
    expiresIn: '1d'
  });
  return token;
};

const isAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, SECRET_KEY, (err, { userId }) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    req.userId = userId;
    next();
  });
};

const isAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, SECRET_KEY, async (err, { userId }) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.sendStatus(403); // Forbidden
    }
    req.userId = userId;
    next();
  });
};

export { generateToken, isAuth, isAdmin };
