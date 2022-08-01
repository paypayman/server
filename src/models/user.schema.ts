import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

export const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  otp: { type: String, required: true },
  otpUsed: {type: Boolean, default: false},
  otpExpiredDate: {type: Date}
});

// UserSchema.pre('save', async function(next: mongoose.HookNextFunction) {
//     try {
//       if (!this.isModified('password')) {
//         return next();
//       }
//       const hashed = await bcrypt.hash(this['password'], 10);
//       this['password'] = hashed;
//       return next();
//     } catch (err) {
//       return next(err);
//     }
//   });
