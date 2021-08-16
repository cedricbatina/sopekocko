const Sauce = require("../models/sauce.model");

const fs = require("fs"); // importing the file system s to access to functions, in order to modify or delete files

// adding sauce endpoint
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id; // suppresses the random ID provided by mongoDb
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    .save()
    .then(() =>
      res.status(201).json({ message: " Votre sauce a bien été ajoutée !" })
    )
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error });
    });
};
// adding endpoint ends here
// updating sauce endpoint

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() =>
      res.status(200).json({ message: " Votre sauce a été mise à jour !" })
    )
    .catch((error) => res.status(400).json({ error }));
};

// updating endpoint ends here

// I wanna set the router for likes and dislikes
// adding like
exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      switch (req.body.like) {
        case 1: //if user likes the sauce
          if (!sauce.usersLiked.includes(req.body.userId)) {
            //If the user has not already liked the sauce
            /***increasing likes quantity by 1, pushing userId in usersLiked array ***/
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { likes: 1 },
                $push: { usersLiked: req.body.userId },
                _id: req.params.id,
              }
            )
              .then(() => res.status(210).json({ message: "j'aime" }))
              .catch((error) => res.status(400).json({ error }));
          }
          break;

        case -1: //if user dislikes the sauce
          if (!sauce.usersDisliked.includes(req.body.userId)) {
            //If the user hasn't already disliked the sauce
            /***increasing dislikes quantity by 1, pushing userId in usersDisliked array ***/
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: 1 },
                $push: { usersDisliked: req.body.userId },
                _id: req.params.id,
              }
            )
              .then(() => res.status(210).json({ message: "Je n'aime pas" }))
              .catch((error) => res.status(400).json({ error }));
          }
          break;
        case 0: //if user removes either a like or a dislike
          if (sauce.usersLiked.includes(req.body.userId)) {
            //if userId is alreadu in usersLiked array
            /***Decreasing likes by one, removing userId from usersLiked array***/
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { likes: -1 },
                $pull: { usersLiked: req.body.userId },
                _id: req.params.id,
              }
            )
              .then(() => res.status(201).json({ message: " " }))
              .catch((error) => res.status(400).json({ error }));
          } else if (sauce.usersDisliked.includes(req.body.userId)) {
            //if userId is already in usersDisliked array
            /*Decreasing dislikes by one, removing userId from usersDisliked array*/
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: req.body.userId },
                _id: req.params.id,
              }
            )
              .then(() => res.status(201).json({ message: " " }))
              .catch((error) => res.status(400).json({ error }));
          }
          break;
        default:
          throw {
            error:
              " Le serveur a rencontré un problème, veuillez réessayer plus tard !",
          };
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/image/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() =>
            res
              .status(201)
              .json({ message: " Votre sauce a bien été supprimée !" })
          )
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(201).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};
exports.getAllSauces = (req, res, next) => {
  Sauce.find({})
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};
