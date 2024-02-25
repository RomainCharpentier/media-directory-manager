import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { getFiles, login } from './synology.api.js';
import { Authorization, User } from './models.js';

const app = express();

// MongoDB
console.log('MONGO URL ::: ', process.env.MONGODB_URL);
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  // .then(() => {
  //   console.log('Connected to MongoDB');
  //   app.listen(5000, () => {
  //     console.log('Server started on port 5000');
  //   });
  // })
  .catch((err) => console.log(err));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

// Routes
app.get('/users', async (req, res) => {
  try {
    const users = await User.find().populate('auth'); // Utilisez populate() pour récupérer les données d'autorisation associées
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
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

app.post('/login', async (req, res) => {
  const response = await login(req.body.user, req.body.password);
  res.set('Set-Cookie', response.headers['set-cookie']);
  const user = {
    name: req.body.user,
    token: response.data.data.synotoken,
    cookie: response.headers['set-cookie'].join(';'),
    expirationDate: Math.min(
      ...response.headers['set-cookie'].map((cookie) =>
        getExpirationDate(cookie)
      )
    )
  };
  const newUser = await User.findOneAndReplace({ name: req.body.user }, user, {
    upsert: true
  });
  res.status(200).json(newUser);
});

app.get('/files', async (req, res) => {
  const response = await getFiles(req.query.path, req.headers);
  res.header('Access-Control-Allow-Credentials', true);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
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
