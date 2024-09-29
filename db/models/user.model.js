const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("invalid email format");
        }
      },
    },
    profileImage: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
      validate(value) {
        if (value.length < 6) {
          throw new Error("password must be more than 6 characters");
        } else if (value.length > 25) {
          throw new Error("password must be less than 25 characters");
        }
      },
    },
    phoneNum: {
      type: String,
      validate(value) {
        if (!validator.isMobilePhone(value, "ar-EG"))
          throw new Error("invalid number");
      },
    },
    OTP: {
      type: String,
      trim: true,
    },
    tokens: [
      {
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcryptjs.hash(this.password, 8);
  }
});
userSchema.statics.loginUser = async (username, password) => {
  const userData = await User.findOne({ username });
  if (!userData) throw new Error("invalid username");
  const validatePassword = await bcryptjs.compare(
    password,
    userData.password
  );
  if (!validatePassword) throw new Error("invalid password");
  return userData;
};
userSchema.methods.toJSON = function () {
  const data = this.toObject();
  delete data.__v;
  delete data.password;
  return data;
};
userSchema.methods.generateToken = async function () {
  const userData = this;
  const expiresIn = 24 * 60 * 60; 
  const token = jwt.sign(
    { _id: userData._id }, 
    process.env.tokenPass, 
    { expiresIn }
  );
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  userData.tokens = userData.tokens.concat({ token, expiresAt });
  await userData.save();
  
  return token;
};


userSchema.statics.removeExpiredTokens = async function () {
  const now = new Date();

  await this.updateMany(
    {},
    { $pull: { tokens: { expiresAt: { $lte: now } } } }
  );

  console.log('Expired tokens removed');
};


const User = mongoose.model("User", userSchema);
module.exports = User;
