const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const config = require('./config');
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
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'));
    }
  },
});


// POST API for uploading an image
const Tesseract = require('tesseract.js');

// ...

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    //File Validation
    if (req.fileValidationError) {
      return res.status(400).json({ error: req.fileValidationError });
    }
    // Read the uploaded image file and store it as a Buffer
    const imageBuffer = req.file.buffer;

    // Perform OCR to extract text from the image
    const { data } = await Tesseract.recognize(imageBuffer);

    // Create a new image document in the database
    const newImage = new Image({
      originalImage: imageBuffer,
      extractedText: data.text,
    });

    // Save the image to the database
    await newImage.save();

    // Prepare the response
    const response = {
      message: 'Image uploaded successfully',
      id: newImage._id,
      timestamp: newImage.timestamp, // Include the timestamp
      extractedText: data.text, // Include the extracted text
    };

    res.status(201).json(response);
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
   

    const extractedText = image.extractedText; // Assuming you store the extracted text in the image document
    const uploadTime = image.timestamp; // Assuming you store the upload time in the image document

    // Set the Content-Type to specify the image format (e.g., PNG)
    // res.set('Content-Type', 'image/png');

    // Send a JSON response with the image, extracted text, and upload time
    // res.json({ image: image.image.toString('base64'), extractedText, uploadTime });
    console.log({ extractedText, uploadTime })
    res.json({ extractedText, uploadTime });
  } catch (error) {
    res.status(500).json({ error: 'Image retrieval failed' });
  }
});


app.get('/', (req, res) => {
  res.send('Hello, Express.js and MongoDB!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
