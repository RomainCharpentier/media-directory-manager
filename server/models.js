import mongoose from 'mongoose';
import argon2 from 'argon2';

const authorizationSchema = new mongoose.Schema({
  token: String,
  cookie: String,
  expirationDate: Date
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  token: String,
  cookie: String,
  expirationDate: Date
});
userSchema.virtual('id').get(() => this.name);
userSchema.pre('findOneAndUpdate', async function (next) {
  const updates = this.getUpdate();
  const user = updates.$set || updates;

  if (!user.password) {
    return next();
  }
  try {
    const hashedPassword = await argon2.hash(user.password);
    user.password = hashedPassword;
  } catch (err) {
    console.error('Error while hashing password : ', err);
  }
  return next();
});

const Authorization = mongoose.model('Authorization', authorizationSchema);
const User = mongoose.model('User', userSchema);

export { Authorization, User };
