import mongoose from 'mongoose';
import argon2 from 'argon2';

const authorizationSchema = new mongoose.Schema({
  token: String,
  cookie: String,
  expirationDate: Date
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  token: String,
  cookie: String,
  expirationDate: Date
});
userSchema.virtual('id').get(() => this.username);
userSchema.pre(
  ['save', 'update', 'findOneAndUpdate', 'findOneAndReplace'],
  async function (next) {
    const user = this;
    const isSaveOperation = this.isNew;
    const updates = isSaveOperation ? user : this.getUpdate();

    if (!updates || !updates.password) {
      return next();
    }

    try {
      const hashedPassword = await argon2.hash(updates.password);
      updates.password = hashedPassword;
    } catch (err) {
      console.error('Error while hashing password : ', err);
      return next(err);
    }

    return next();
  }
);
userSchema.statics.findByCredentials = async function (username, password) {
  const user = await this.findOne({ username });

  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await argon2.verify(user.password, password);

  if (!isMatch) {
    throw new Error('Incorrect password');
  }

  return user;
};

const Authorization = mongoose.model('Authorization', authorizationSchema);
const User = mongoose.model('User', userSchema);

export { Authorization, User };
