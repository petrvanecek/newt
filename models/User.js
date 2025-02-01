const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, unique: true, required: true },
    homeSystemSlug: { type: String, default: null }
});

module.exports = mongoose.model('User', userSchema);