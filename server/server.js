import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { getFiles, login } from './synology.api.js';
import { User } from './models.js';
import dotenv from 'dotenv';
import { generateToken, isAdmin, isAuth } from './utils/auth.js';

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.local' });
}

const app = express();

// MongoDB
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(async () => {
    console.error(
      'Connection to MongoDB database successful : ',
      process.env.MONGODB_URL
    );
    const adminData = {
      username: process.env.ADMIN_NAME,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin'
    };
    await User.findOneAndUpdate({ username: adminData.username }, adminData, {
      upsert: true,
      new: true
    })
      .then((adminUser) => {
        console.log('Admin user updated successfully : ', adminUser);
      })
      .catch((err) => {
        console.error('Error updating admin user : ', err);
      });
  })
  .catch((err) => {
    console.error('Error while connecting to Mongo dabatabse : ', err);
  });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

// Routes
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const connectToSyno = req.query.connectToSyno === 'true';
  try {
    let user = await User.findByCredentials(username, password);
    if (!user.synotoken && connectToSyno) {
      const response = await login(
        process.env.SYNOLOGY_USERNAME,
        process.env.SYNOLOGY_PASSWORD
      );
      const updatedUser = {
        token: response.data.data.synotoken,
        cookie: response.headers['set-cookie'].join(';'),
        expirationDate: Math.min(
          ...response.headers['set-cookie'].map((cookie) =>
            getExpirationDate(cookie)
          )
        )
      };
      user = await User.findOneAndUpdate(
        { username: user.username },
        { $set: updatedUser },
        { new: true }
      );
    }
    res.status(200).send(generateToken(user));
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

app.post('/register', isAdmin, async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const newUser = new User({
      username,
      password,
      role
    });
    const userSaved = await newUser.save();
    res.status(201).json(userSaved);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

const getExpirationDate = (cookieString) => {
  const parts = cookieString.split(';');

  let expirationDate = null;

  parts.forEach((part) => {
    const [key, value] = part.trim().split('=');
    if (key === 'expires') {
      expirationDate = new Date(value);
    }
  });

  return expirationDate;
};

app.get('/files', isAuth, async (req, res) => {
  const user = await User.findById(req.userId).select('token cookie');
  const response = await getFiles(req.query.path, user);
  res.header('Access-Control-Allow-Credentials', true);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  if (response.data.error) {
    console.error(response.data);
    return res.sendStatus(500);
  }
  res.send(response.data);
});

app.delete('/files/:path', async (req, res) => {
  const response = await getFiles(req.params.path, req.headers['synotoken']);
  res.send(response.data);
});

// Démarrer le serveur
app.listen(5000, () => {
  console.log('Server started on port 5000');
});
