const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user.controller"); // need the user model

exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10) // hashing 10times the password contained in the body
    .then((hash) => {
      const user = new User({
        // creating a user with the authentified hashed password
        email: req.body.email,
        password: hash,
      });
      user
        .save() // record the new user on the database
        .then(() => res.status(201).json({ message: "Votre compte est actif" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error });
    });
};
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email }) // looking for a particular user
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur inconnu !" }); // if user is not found, return error
      }
      console.log(req.body, user);
      bcrypt
        .compare(req.body.password, user.password) // let's compare the user's email with the hash in the database
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          return res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(501).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
