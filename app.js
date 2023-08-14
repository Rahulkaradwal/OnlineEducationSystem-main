const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");

const User = require("./models/User");
const Course = require("./models/Course");
const UserController = require("./controllers/UserController");
const CourseController = require("./controllers/CourseController");

const mongoURI =
  "mongodb+srv://rahulkaradwal:14%40February@cluster0.4cjd0lx.mongodb.net/mydatabase?retryWrites=true&w=majority";

const dbName = "mydatabase";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use(
  session({
    secret: "53f681d93a8aadb8459bcdac948e4a1515a5eb86a7cc489ed55cf3895aabf63c",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.redirect("/index.html");
});

app.get("/signout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.redirect("/index.html"); // Redirect to the sign-in page
    }
  });
});

app.get("/student_dashboard", async (req, res) => {
  try {
    const courses = await Course.find(); // Use the correct field name for populating

    res.render("student_dashboard", { courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/signup", UserController.signup);
app.post("/signin", UserController.signin);
app.get("/teacher_dashboard", UserController.teacherDashboard);
app.get("/add-course", UserController.addCoursePage);
app.post("/add-course", CourseController.addCourse);
app.get("/view-courses", UserController.viewCourses);
app.get("/enroll", UserController.enrollCourse);
app.get("/enrolled-course", UserController.viewEnrolledCourses);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
