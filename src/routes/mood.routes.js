/**
 * Avatar Mood Routes
 *
 * POST   /characters/:id/moods             — upload a mood image
 * GET    /characters/:id/moods             — list mood images
 * DELETE /characters/:id/moods/:moodId     — delete a mood image
 */
const express = require("express");
const router = express.Router({ mergeParams: true });
const authenticate = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const { uploadMood, getMoods, deleteMood } = require("../controllers/mood.controller");

router.post("/", authenticate, upload.single("image"), uploadMood);
router.get("/", authenticate, getMoods);
router.delete("/:moodId", authenticate, deleteMood);

module.exports = router;