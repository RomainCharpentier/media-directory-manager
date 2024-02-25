import mongoose from 'mongoose';

const authorizationSchema = new mongoose.Schema({
  token: String,
  cookie: String,
  expirationDate: Date
});

const userSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  token: String,
  cookie: String,
  expirationDate: Date
});

const Authorization = mongoose.model('Authorization', authorizationSchema);
const User = mongoose.model('User', userSchema);

export { Authorization, User };
