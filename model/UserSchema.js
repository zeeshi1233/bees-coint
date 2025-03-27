import mongoose from "mongoose"
const { Schema } = mongoose;

const userSchema = new Schema({
  cpf: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{11}$/,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /.+\@.+\..+/,
  },
  image:{type:String},
  password: {   
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  adminApproval: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
