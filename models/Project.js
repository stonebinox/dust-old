const mongoose = require('mongoose');
const hat = require('hat');

const projectSchema = new mongoose.Schema({
  uid: String,
  email: { type: String, unique: false },
  project: String,
  platform: String,
}, { timestamps: true });


const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
