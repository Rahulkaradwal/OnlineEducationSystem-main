const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["student", "teacher"],
    required: true,
  },
  userid: {
    type: String,
    required: true,
    unique: true, // Make userid field unique
  },
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // Reference the Course model
    },
  ],
});

userSchema.plugin(uniqueValidator); // Apply the unique validator plugin

const User = mongoose.model("User", userSchema);

module.exports = User;
