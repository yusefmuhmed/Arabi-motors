const userModel = require("../../db/models/user.model");
const myHelper = require("../util/helper");
const fs = require("fs");
const path = require("path");
const bcryptjs = require("bcryptjs");
class User {
  static register = async (req, res) => {
    try {
      let userData;
      if (req.body.password.length < 6)
        throw new Error("password must be more than 6");

      userData = new userModel({
        ...req.body,
        profileImage: req.file
          ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
          : null,
      });

      await userData.save();

      myHelper.resHandler(res, 201, true, userData, "user added successfully");
    } catch (e) {
      myHelper.resHandler(res, 500, false, e, e.message);
    }
  };
  static login = async (req, res) => {
    try {
      const userData = await userModel.loginUser(
        req.body.username,
        req.body.password
      );
      const token = await userData.generateToken();
      myHelper.resHandler(
        res,
        200,
        true,
        { user: userData, token },
        "user logged in successfully"
      );
    } catch (e) {
      myHelper.resHandler(res, 500, false, e, e.message);
    }
  };
  static allUsers = async (req, res) => {
    try {
      const Users = await userModel.find();
      myHelper.resHandler(res, 200, true, Users, "Users fetched");
    } catch (e) {
      myHelper.resHandler(res, 500, false, e, e.message);
    }
  };
  static profile = (req, res) => {
    myHelper.resHandler(
      res,
      200,
      true,
      { user: req.user },
      "user profile fetched"
    );
  };
  static logOut = async (req, res) => {
    try {
      req.user.tokens = req.user.tokens.filter((t) => t.token != req.token);
      await req.user.save();
      myHelper.resHandler(res, 201, true, null, "logged out");
    } catch (e) {
      myHelper.resHandler(res, 500, false, e, e.message);
    }
  };
  static getSingle = async (req, res) => {
    try {
      const user = req.user;
      const imageUrl = user.profileImage;
      myHelper.resHandler(
        res,
        200,
        true,
        { ...user.toObject(), imageUrl },
        "User info retrieved successfully"
      );
    } catch (e) {
      myHelper.resHandler(res, 500, false, e, e.message);
    }
  };
  static resetPassword = async (req, res) => {
    try {
      const user = await userModel.findOne({ email: req.body.email });
      if (!user) {
        return myHelper.resHandler(
          res,
          404,
          false,
          "Email not found",
          "Email not found in the system"
        );
      } else {
        const result = await myHelper.emailHandler(req.body.email);
        if (result.apiStatus) {
          user.OTP = result.otp;
          await user.save();
          myHelper.resHandler(
            res,
            200,
            true,
            req.body.email,
            "Email sent successfully (Check your spam/junk folder if you can't find it)"
          );
        } else {
          {
            myHelper.resHandler(res, 500, false, e, e.message);
          }
        }
      }
    } catch (e) {
      myHelper.resHandler(res, 500, false, e, e.message);
    }
  };
  static verifyOTP = async (req, res) => {
    try {
      const user = await userModel.findOne({ email: req.body.email });
      if (!user) {
        return myHelper.resHandler(
          res,
          404,
          false,
          "Email not found",
          "Email not found in the system"
        );
      }

      if (req.body.otp === user.OTP) {
        return myHelper.resHandler(
          res,
          200,
          true,
          "",
          "OTP verified successfully"
        );
      } else {
        return myHelper.resHandler(res, 400, false, "", "OTP not correct");
      }
    } catch (e) {
      myHelper.resHandler(res, 500, false, e, e.message);
    }
  };

  static updatePassword = async (req, res) => {
    try {
      const user = await userModel.findOne({ email: req.body.email });
      if (!user) {
        return myHelper.resHandler(
          res,
          404,
          false,
          "Email not found",
          "Email not found in the system"
        );
      } else {
        user.password = await bcryptjs.hash(req.body.password, 8);
        user.OTP = null;
        await userModel.findOneAndUpdate(
          { email: req.body.email },
          {
            password: user.password,
            OTP: user.OTP,
          },
          { new: true }
        );
        myHelper.resHandler(
          res,
          201,
          true,
          req.body.email,
          "Password updated successfully"
        );
      }
    } catch (e) {
      myHelper.resHandler(res, 500, false, e, e.message);
    }
  };
  static updateInfo = async (req, res) => {
    try {
      let user = await userModel.findById(req.user._id);

      if (!user) {
        return myHelper.resHandler(
          res,
          404,
          false,
          "User not found",
          "User not found with the provided email"
        );
      }

      // Hash the password if it's being updated
      if (req.body.password) {
        req.body.password = await bcryptjs.hash(req.body.password, 8);
      }

      // If a new profile image is uploaded, delete the old one
      if (req.file) {
        // Check if the user already has an existing image
        if (user.profileImage) {
          const fileName = user.profileImage.split("/").pop();
          const oldImagePath = path.join(__dirname, "../../uploads/", fileName);

          // Delete the old image file from the uploads folder
          fs.unlink(oldImagePath, (err) => {
            if (err) {
              myHelper.resHandler(res, 500, false, err, err.message);
            }
          });
        }

        // Update with the new image filename
        user = await userModel.findByIdAndUpdate(
          req.user._id,
          {
            ...req.body,
            profileImage: req.file
              ? `${req.protocol}://${req.get("host")}/uploads/${
                  req.file.filename
                }`
              : null,
          },
          { new: true }
        );
      } else {
        // Update without changing the profile image
        user = await userModel.findByIdAndUpdate(
          req.user._id,
          { ...req.body },
          { new: true }
        );
      }

      // Send a success response
      myHelper.resHandler(
        res,
        200,
        true,
        user,
        "User information updated successfully"
      );
    } catch (e) {
      // Handle any errors
      myHelper.resHandler(res, 500, false, e, e.message);
    }
  };
}
module.exports = User;
