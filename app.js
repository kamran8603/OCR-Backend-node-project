const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const config = require('./config');
const Contact = require('./models/contact');
const Image = require('./models/Image'); // Import the Image model

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

mongoose.connect(config.db.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Set a 30-second timeout
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Set up Multer for handling file uploads
const storage = multer.memoryStorage(); // Store the uploaded file as a Buffer
const upload = multer({ storage: storage });

// Create indexes using createIndex() method
Contact.init()
  .then(() => {
    console.log('Contact model indexes created.');
  })
  .catch((error) => {
    console.error('Error creating Contact model indexes:', error);
  });

// POST API for uploading an image
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
      // Read the uploaded image file and store it as a Buffer
      const imageBuffer = req.file.buffer;
  
      // Create a new image document in the database
      const newImage = new Image({
        image: imageBuffer,
      });
      // Save the new image document
      await newImage.save();
  
      // Return the ID of the newly created image along with a success message
      res.status(201).json({
        message: 'Image uploaded successfully',
        imageId: newImage._id, // Include the ID in the response
      });
    } catch (error) {
      res.status(500).json({ error: 'Image upload failed' });
    }
  });
  

// GET API for retrieving an image by ID
app.get('/images/:id', async (req, res) => {
    try {
      const imageId = req.params.id;
  
      // Find the image by its ID
      const image = await Image.findById(imageId);
  
      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }
  
      // Set Content-Disposition header to make the response an attachment
      res.set('Content-Disposition', `attachment; filename="${imageId}.png"`);
      
      // Set the Content-Type to specify the image format (e.g., PNG)
      res.set('Content-Type', 'image/png');
  
      // Serve the image binary data
      res.send(image.image);
    } catch (error) {
      res.status(500).json({ error: 'Image retrieval failed' });
    }
  });
  
  

app.get('/', (req, res) => {
  res.send('Hello, Express.js and MongoDB!');
});

app.post('/contacts', async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    await newContact.save();
    res.status(201).json(newContact);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
