const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  originalImage: {
    type: Buffer,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  extractedText: {
    type: String, // Add a field for extracted text
    required: true,
  },
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
