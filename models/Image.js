const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  image: Buffer, // Store the image binary data
  timestamp: {
    type: Date,
    default: Date.now, // Set the default value to the current date and time
  },
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
