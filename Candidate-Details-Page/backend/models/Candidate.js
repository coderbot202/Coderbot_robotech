const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  jobTitle: String,
  jobRole: String,
  currentSalary: Number,
  expectedSalary: Number,
  currency: String,
  skills: String,
  experience: String,
  address: String,
  pincode: String,
  country: String,
  city: String,
  profileSummary: String,
  resumeFile: String
});

module.exports = mongoose.model("Candidate", candidateSchema);
