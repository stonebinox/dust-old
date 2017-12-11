const mongoose = require('mongoose');
const hat = require('hat');

const projectSchema = new mongoose.Schema({
    name: { type: String, unique: false },
    email: { type: String, unique: false },
    description: String,
    features: String,
    total: String,
}, { timestamps: true });


const MvpBuild = mongoose.model('MvpBuild', projectSchema);

module.exports = MvpBuild;