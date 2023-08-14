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
        teacher: userId, // Set the teacher ID
      });

      newCourse
        .save()
        .then(() => {
          res.redirect("/add-course"); // Redirect to the add-course page or another suitable route
        })
        .catch((error) => {
          res.status(500).send("Internal Server Error");
        });
    })
    .catch((error) => {
      res.status(500).send("Internal Server Error");
    });
};

exports.viewCourses = async (req, res) => {
  try {
    // Get the user ID from the session
    const userId = req.session.userId;

    // Fetch the logged-in teacher's details
    const teacher = await User.findOne({ _id: userId, role: "teacher" });

    if (!teacher) {
      return res.status(403).send("Teacher not found"); // Teacher not found
    }

    // Fetch courses associated with the teacher's ID
    const courses = await Course.find({ teacher: userId });

    console.log("User ID:", userId);
    console.log("Courses:", courses);

    res.render("view-courses", { teacher, courses }); // Render the view-courses view
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).send("Invalid credentials");
    }

    req.session.userId = user._id; // Set userId after fetching the user

    if (user.role === "teacher") {
      console.log("Redirecting to teacher_dashboard...");
      res.redirect("/teacher_dashboard");
    } else if (user.role === "student") {
      const courses = await Course.find();
      res.render("student_dashboard", { courses });
    }
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).send("Internal Server Error");
  }
};
