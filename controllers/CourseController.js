const Course = require("../models/Course");
const User = require("../models/User");

exports.addCourse = (req, res) => {
  const { courseName, courseDescription } = req.body;

  // Get the user ID from the session
  const userId = req.session.userId;

  // Check if user is a teacher
  User.findOne({ _id: userId, role: "teacher" })
    .then((user) => {
      if (!user) {
        res.status(403).send("Teacher not found"); // Teacher role check failed
        return;
      }

      // Create a new course associated with the teacher's ID
      const newCourse = new Course({
        courseName,
        courseDescription,
        teacher: user._id, // Set the teacher ID to the current user's ID
      });

      newCourse
        .save()
        .then(() => {
          // Show a browser alert
          // console.log("New Course:", savedCourse);

          res.send(
            `<script>alert('Course added successfully!'); window.location.href='/teacher_dashboard';</script>`
          );
        })
        .catch((error) => {
          console.error("Error creating course:", error);
          res.status(500).send("Internal Server Error");
        });
    })
    .catch((error) => {
      console.error("Error finding user:", error);
      res.status(500).send("Course Controller: Internal Server Error");
    });
};
