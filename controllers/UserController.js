const User = require("../models/User");
const Course = require("../models/Course");

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, userid } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { userid }] });

    if (existingUser) {
      return res.status(409).send("UserID already exist");
    }

    const newUser = new User({
      name,
      email,
      password,
      role,
      userid,
    });

    await newUser.save();
    res.redirect("/signin.html");
  } catch (error) {
    console.error("Error creating user:", error);
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

exports.addCoursePage = (req, res) => {
  res.render("add-course");
};

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

exports.teacherDashboard = async (req, res) => {
  try {
    // Get the user ID from the session
    const userId = req.session.userId;

    // Fetch the logged-in teacher's details
    const teacher = await User.findOne({ _id: userId, role: "teacher" });

    // Fetch courses associated with the teacher
    const courses = await Course.find({ teacher: userId });

    // Render the teacher_dashboard view with the teacher's details and courses
    res.render("teacher_dashboard", { teacher, courses });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
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

exports.enrollCourse = async (req, res) => {
  try {
    const userId = req.session.userId;
    const courseId = req.query.courseId;

    const student = await User.findOne({ _id: userId, role: "student" });

    if (!student) {
      return res.status(403).send("Student not found");
    }

    // Check if the course is already enrolled
    if (student.enrolledCourses.includes(courseId)) {
      return res.status(400).send("Course already enrolled");
    }

    // Enroll the course and update the student's enrolledCourses array
    student.enrolledCourses.push(courseId);
    await student.save();

    console.log("Course enrolled successfully"); // Print to terminal

    res.redirect("/student_dashboard"); // Redirect back to student_dashboard
  } catch (error) {
    console.error("Error enrolling course:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.viewEnrolledCourses = async (req, res) => {
  try {
    const userId = req.session.userId; // Get the user ID from session

    // Find the student and populate the enrolledCourses array with course details
    const student = await User.findOne({ _id: userId, role: "student" })
      .populate("enrolledCourses")
      .exec();

    if (!student) {
      return res.status(404).send("ViewController: Student not found");
    }

    res.render("enrolled-course", { student });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).send("Internal Server Error");
  }
};
