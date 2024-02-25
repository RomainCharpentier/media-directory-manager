import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { getFiles, login } from './synology.api.js';
import { Authorization, User } from './models.js';
import dotenv from 'dotenv';

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
      name: process.env.ADMIN_NAME,
      password: 'process.env.ADMIN_PASSWORD',
      isAdmin: true
    };
    await User.findOneAndUpdate({ name: adminData.name }, adminData, {
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
app.get('/users', async (req, res) => {
  try {
    const users = await User.find().populate('auth'); // Utilisez populate() pour récupérer les données d'autorisation associées
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/log', async (req, res) => {
  // Ici, vous pouvez implémenter la logique de connexion
  // Récupérez les données d'identification de la requête
  const { user, password } = req.body;

  try {
    // Vérifiez si l'utilisateur existe dans la base de données
    const user = await User.findOne({ email });

    // Si l'utilisateur n'existe pas ou si le mot de passe est incorrect
    if (!user || !user.isValidPassword(password)) {
      return res
        .status(401)
        .json({ message: 'Adresse e-mail ou mot de passe incorrect' });
    }

    // Si l'utilisateur existe et le mot de passe est correct, vous pouvez générer un jeton d'authentification
    const token = generateAuthToken(user);

    // Réponse avec le token
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
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

// app.post('/login', async (req, res) => {
//   const response = await login(req.body.user, req.body.password);
//   res.set('Set-Cookie', response.headers['set-cookie']);
//   const user = {
//     name: req.body.user,
//     token: response.data.data.synotoken,
//     cookie: response.headers['set-cookie'].join(';'),
//     expirationDate: Math.min(
//       ...response.headers['set-cookie'].map((cookie) =>
//         getExpirationDate(cookie)
//       )
//     )
//   };
//   const newUser = await User.findOneAndReplace({ name: req.body.user }, user, {
//     upsert: true
//   });
//   res.status(200).json(newUser);
// });

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
