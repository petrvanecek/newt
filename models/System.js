const mongoose = require('mongoose');
const slugify = require('slugify');

const bodySchema = new mongoose.Schema({
  planetName: { type: String, required: true }, // Musí být string, např. "star"
  params: [Number], // 
});

const systemSchema = new mongoose.Schema({
  systemSlug: { type: String, unique: true },
  name: { type: String, required: true },
  version: { type: Number },
  createdBy: { type: String, required: true },
  locked: { type: Boolean, reauired: true },
  bodies: [bodySchema],
  version_history: [{
    version: Number,
    timestamp: { type: Date, default: Date.now },
    change: String,
    changedBy: String,
    bodies: [bodySchema],
  }],
});

systemSchema.pre('save', async function (next) {
  if (!this.isNew) return next(); 

  // Vytvoření základního slugu
  let baseSlug = slugify(this.name, { lower: true, strict: true }); 
  let uniqueSlug = baseSlug;
  let suffix = 1;

  // Kontrola unikátnosti slugu a přidání číselného suffixu
  while (await mongoose.model('System').findOne({ systemSlug: uniqueSlug })) {
    uniqueSlug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  // Nastavení unikátního slugu
  this.systemSlug = uniqueSlug; 
  next();
});

module.exports = mongoose.model('System', systemSchema);
