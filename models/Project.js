const mongoose = require('mongoose');
const hat = require('hat');

const projectSchema = new mongoose.Schema({
  uid: String,
  email: String,
  project: String,
}, { timestamps: true });


const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
