const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
const result = dotenv.config();
if (result.error) {
  console.log('❌ Error loading .env file:', result.error);
} else {
  console.log('✅ .env file loaded successfully');
  console.log('CLIENT_URL:', process.env.CLIENT_URL);
}

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS
app.use(cors({
  origin: function (origin, callback) {
    console.log('--- CORS Check ---');
    console.log('Incoming Origin:', origin);
    console.log('Allowed Origin (from env):', process.env.CLIENT_URL);

    const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

    if (!origin || origin === allowedOrigin) {
      callback(null, true);
    } else {
      console.log('❌ CORS Blocked: Origin mismatch');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

const errorHandler = require('./middleware/errorHandler');

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: '✅ JobTracker API is running' });
});

// Use global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

