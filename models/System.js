const mongoose = require('mongoose');

const bodySchema = new mongoose.Schema({
  name: String,
  params: [Number], // [x, y, vx, vy, r, mass, r, g, b]
});

const systemSchema = new mongoose.Schema({
  name: String,
  bodies: [bodySchema],
  version_history: [{
    version: String,
    timestamp: { type: Date, default: Date.now },
    bodies: [bodySchema],
  }],
});

module.exports = mongoose.model('System', systemSchema);
