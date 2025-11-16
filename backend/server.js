const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration for local development and production
app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://your-frontend-domain.com', // Replace with your actual frontend domain
    /\.onrender\.com$/, // Allow all Render subdomains
    /\.vercel\.app$/, // Allow all Vercel subdomains
    /\.netlify\.app$/ // Allow all Netlify subdomains
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    name: 'Gemini AI Backend',
    version: '1.0.0',
    status: 'Online',
    endpoints: {
      health: '/health',
      predict: '/predict (POST)'
    },
    message: 'Welcome to Gemini AI Purchase Prediction API',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Gemini AI Backend is running',
    timestamp: new Date().toISOString()
  });
});

// GET route for /predict - shows usage instructions
app.get('/predict', (req, res) => {
  res.json({
    error: 'Method not allowed',
    message: 'This endpoint requires POST method',
    usage: {
      method: 'POST',
      endpoint: '/predict',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        age: 'number (0-150)',
        purchases: 'number (>=0)',
        timeSpent: 'number (>=0, minutes)'
      },
      example: {
        age: 25,
        purchases: 3,
        timeSpent: 15
      }
    }
  });
});

// Main prediction endpoint
app.post('/predict', async (req, res) => {
  try {
    // Input validation
    const { age, purchases, timeSpent } = req.body;

    if (!age && age !== 0 || !purchases && purchases !== 0 || !timeSpent && timeSpent !== 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide age, purchases, and timeSpent'
      });
    }

    // Validate data types
    if (typeof age !== 'number' || typeof purchases !== 'number' || typeof timeSpent !== 'number') {
      return res.status(400).json({
        error: 'Invalid data types',
        message: 'age, purchases, and timeSpent must be numbers'
      });
    }

    // Validate ranges
    if (age < 0 || age > 150) {
      return res.status(400).json({
        error: 'Invalid age',
        message: 'Age must be between 0 and 150'
      });
    }

    if (purchases < 0) {
      return res.status(400).json({
        error: 'Invalid purchases',
        message: 'Purchases cannot be negative'
      });
    }

    if (timeSpent < 0) {
      return res.status(400).json({
        error: 'Invalid time spent',
        message: 'Time spent cannot be negative'
      });
    }

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'API key not configured'
      });
    }

    // Build prediction prompt
    const prompt = `You are an expert e-commerce analyst. Based on the following customer data, predict whether they will make a purchase and provide reasoning.

Customer Data:
- Age: ${age} years old
- Previous purchases: ${purchases}
- Time spent on site: ${timeSpent} minutes

Please analyze this data and respond with ONLY a JSON object in this exact format:
{
  "will_purchase": "yes" or "no",
  "probability": "X%" (where X is a number between 0-100),
  "reason": "Brief explanation of your prediction based on the data"
}

Important: Your response must be valid JSON only, no additional text or formatting.`;

    // Prepare Gemini API request
    const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiRequestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 500,
      }
    };

    // Call Gemini API
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiRequestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);

      if (response.status === 400) {
        return res.status(500).json({
          error: 'Invalid API request',
          message: 'There was an error with the AI service request'
        });
      } else if (response.status === 403) {
        return res.status(500).json({
          error: 'API access denied',
          message: 'Invalid or expired API key'
        });
      } else if (response.status === 429) {
        return res.status(500).json({
          error: 'Rate limit exceeded',
          message: 'Too many requests to AI service'
        });
      } else {
        return res.status(500).json({
          error: 'AI service unavailable',
          message: 'The AI service is currently unavailable'
        });
      }
    }

    const geminiData = await response.json();

    // Extract text from Gemini response
    let generatedText = '';
    if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content) {
      generatedText = geminiData.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected Gemini response structure:', geminiData);
      return res.status(500).json({
        error: 'Invalid AI response',
        message: 'Received unexpected response from AI service'
      });
    }

    // Parse the JSON response from Gemini
    let prediction;
    try {
      // Clean the response - remove any markdown formatting or extra text
      const cleanedText = generatedText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      prediction = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', generatedText);
      return res.status(500).json({
        error: 'AI response format error',
        message: 'Unable to process AI prediction'
      });
    }

    // Validate the prediction structure
    if (!prediction.will_purchase || !prediction.probability || !prediction.reason) {
      console.error('Incomplete prediction object:', prediction);
      return res.status(500).json({
        error: 'Incomplete AI prediction',
        message: 'AI service returned incomplete prediction data'
      });
    }

    // Ensure will_purchase is yes/no
    if (prediction.will_purchase !== 'yes' && prediction.will_purchase !== 'no') {
      prediction.will_purchase = prediction.will_purchase.toLowerCase().includes('yes') ? 'yes' : 'no';
    }

    // Return the prediction
    res.json({
      will_purchase: prediction.will_purchase,
      probability: prediction.probability,
      reason: prediction.reason
    });

  } catch (error) {
    console.error('Server error in /predict:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
});

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} was not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Gemini AI Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Prediction API: http://localhost:${PORT}/predict`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export for deployment platforms
module.exports = app;