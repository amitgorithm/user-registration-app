// Import necessary packages
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const { Pool } = require('pg');

// Initialize Express app
const app = express();
const port = 5001; // Port for the backend server

// --- MIDDLEWARE ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// Setup multer for file handling in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- DATABASE CONNECTION ---
// Replace with your actual PostgreSQL credentials
const pool = new Pool({
  user: 'YOUR_DB_USER',
  host: 'localhost',
  database: 'user_registration',
  password: 'YOUR_DB_PASSWORD',
  port: 5432,
});

// --- API ENDPOINTS ---

/**
 * @route   POST /api/ocr-validate
 * @desc    Uploads an image, calls an OCR API, and returns extracted text.
 * @access  Public
 */
app.post('/api/ocr-validate', upload.single('id_proof'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  // The OCR API part is a simulation.
  // You need to replace this with your actual OCR API provider's details.
  const OCR_API_URL = 'https://api.yourocrprovider.com/v1/ocr'; // <-- REPLACE THIS
  const OCR_API_KEY = 'YOUR_OCR_API_KEY'; // <-- REPLACE THIS

  try {
    // We send the image buffer to the OCR API.
    // The API expects the image data, which we get from req.file.buffer.
    // The headers might need to be adjusted based on your OCR provider's documentation.
    const response = await axios.post(
      OCR_API_URL,
      req.file.buffer, // Sending the image buffer directly
      {
        headers: {
          'Content-Type': req.file.mimetype,
          'Authorization': `Bearer ${OCR_API_KEY}`, // Or 'x-api-key', etc.
        },
      }
    );

    // --- IMPORTANT ---
    // The structure of 'response.data' will depend entirely on your OCR provider.
    // You must inspect the API response and adjust the parsing logic below.
    // We are assuming a response structure like: { name: "...", aadhar: "..." }
    const extractedData = response.data; // e.g., { name: "John Doe", aadhar: "123456789012" }

    console.log('OCR API Response:', extractedData);

    // Send the extracted data back to the frontend
    res.status(200).json({
      message: 'Validation successful!',
      data: extractedData,
    });
  } catch (error) {
    console.error('Error calling OCR API:', error.message);
    // Simulate a successful response for testing if you don't have a real API
    // Comment this out when using a real API
    res.status(200).json({
        message: 'Validation successful! (SIMULATED)',
        data: {
            name: "Test User Name",
            aadhar: "987654321098"
        }
    });
    // Uncomment the line below when using a real API
    // res.status(500).json({ message: 'Failed to process image with OCR.' });
  }
});


/**
 * @route   POST /api/register
 * @desc    Receives user form data and saves it to the database.
 * @access  Public
 */
app.post('/api/register', async (req, res) => {
  const { fullName, contactNo, dob, age, aadharNo } = req.body;

  // Basic validation
  if (!fullName || !contactNo || !dob || !age || !aadharNo) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const query = `
    INSERT INTO users (full_name, contact_no, dob, age, aadhar_no)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id;
  `;
  const values = [fullName, contactNo, dob, age, aadharNo];

  try {
    const result = await pool.query(query, values);
    console.log(`User registered with ID: ${result.rows[0].id}`);
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Database insertion error:', error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ message: 'This Aadhar number is already registered.' });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});