const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const sauceRoutes = require("./routes/sauce.route");
const userRoutes = require("./routes/user.route");
const path = require("path"); // getting access to the server's path
const helmet = require("helmet"); // for security
const app = express();
const config = require("./config");
mongoose
  .connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connexion à MongoDB reussie !"))
  .catch(() => console.log("Connexion à MongoDB echouee !"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
app.use(helmet());
app.use(bodyParser.json()); // bodyParser is used by all endpoints

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
