import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { CallbackError } from 'mongoose';

export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: string; // Virtual getter for _id
  email: string;
  password: string;
  name: string;
  isAdmin: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  name: { type: String, required: true, trim: true },
  isAdmin: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpires: Number
}, { 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.userId = ret._id;
      delete ret.__v;
      delete ret.password;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Virtual for userId
userSchema.virtual('userId').get(function() {
  return this._id.toString();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema); 