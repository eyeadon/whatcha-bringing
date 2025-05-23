import express from "express";
const router = express.Router();
import { User, validateUser } from "../models/user.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { validate } from "../middleware/validate.js";

// get all
router.get("/", async (req, res) => {
  const users = await User.find().sort("name");

  res.send(users);
});

// get single
router.get("/:id", validateObjectId, async (req, res) => {
  const user = await User.findById(req.params.id).exec();

  if (!user)
    return res.status(404).send("The user with the given ID was not found.");

  res.send(user);
});

// get single by publicId
router.get("/public/:publicId", async (req, res) => {
  if (req.params.publicId === "none") {
    res.send([]);
    return;
  }

  // console.log(req.params.publicId);

  const user = await User.findOne({ publicId: req.params.publicId });

  if (!user)
    return res.status(404).send("The user with the given ID was not found.");

  res.send(user);
});

// get single by email
router.get("/email/:email", async (req, res) => {
  // if (req.params.email === "") {
  //   res.send({ publicId: "none" });
  //   return;
  // }

  const user = await User.findOne({ email: req.params.email });

  if (!user) {
    // return res.status(404).send("The user with the given ID was not found.");
    res.send({ publicId: "none" });
    return;
  }

  res.send(user);
});

router.post("/", validate(validateUser), async (req, res) => {
  const user = new User({
    publicId: req.body.publicId,
    name: req.body.name,
    email: req.body.email,
    isAdmin: req.body.isAdmin,
    eventsOwned: req.body.eventsOwned,
    dishesOwned: req.body.dishesOwned,
    bevsOwned: req.body.bevsOwned,
  });

  try {
    // returns Promise, not stored here
    await user.save();
  } catch (exception) {
    // for (field in exception.errors) {
    console.log(exception);
  }

  res.send(user);
});

router.put(
  "/:id",
  [validateObjectId, validate(validateUser)],
  async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          publicId: req.body.publicId,
          name: req.body.name,
          email: req.body.email,
          isAdmin: req.body.isAdmin,
          eventsOwned: req.body.eventsOwned,
          dishesOwned: req.body.dishesOwned,
          bevsOwned: req.body.bevsOwned,
        },
      },
      // get updated document
      { new: true }
    );

    if (!user)
      return res.status(404).send("The user with the given ID was not found.");

    res.send(user);
  }
);

router.delete("/:id", validateObjectId, async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user)
    return res.status(404).send("The user with the given ID was not found.");

  res.send(user);
});

export default router;
