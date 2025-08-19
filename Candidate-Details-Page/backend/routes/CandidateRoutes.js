const express = require("express");
const multer = require("multer");
const path = require("path");
const Candidate = require("../models/Candidate");

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// POST - Save candidate
router.post("/", upload.single("resumeFile"), async (req, res) => {
  try {
    const newCandidate = new Candidate({
      jobTitle: req.body.jobTitle,
      jobRole: req.body.jobRole,
      currentSalary: req.body.currentSalary,
      expectedSalary: req.body.expectedSalary,
      currency: req.body.currency,
      skills: req.body.skills,
      experience: req.body.experience,
      address: req.body.address,
      pincode: req.body.pincode,
      country: req.body.country,
      city: req.body.city,
      profileSummary: req.body.profileSummary,
      resumeFile: req.file ? `/uploads/${req.file.filename}` : ""
    });

    await newCandidate.save();
    res.status(201).json({ message: "Candidate saved successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - All candidates
router.get("/", async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
