require("dotenv").config();

const config = {
  db: {
    uri: "mongodb+srv://rahulkaradwal:14%40February@cluster0.4cjd0lx.mongodb.net/mydatabase?retryWrites=true&w=majority",

    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
};

module.exports = config;
