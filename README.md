# Gemini AI Backend

A production-ready Express.js backend for AI-powered purchase predictions using Google's Gemini API.

## 🚀 Quick Deploy to Render

This repository is configured for one-click deployment to Render.

### Project Structure
```
gemini-backend/
├── backend/           # Express.js backend application
│   ├── server.js     # Main server file
│   ├── package.json  # Backend dependencies
│   └── .env          # Environment variables
├── render.yaml       # Render deployment configuration
└── package.json      # Root deployment scripts
```

### Deployment Configuration

The `render.yaml` file is configured to:
- ✅ Install dependencies from `backend/package.json`
- ✅ Start the server from `backend/server.js`
- ✅ Set environment variables automatically
- ✅ Use the free tier plan

### Environment Variables Set in Render
- `GEMINI_API_KEY` - Google Gemini API key
- `NODE_ENV` - Production environment

## 📡 API Endpoints

Once deployed, your API will be available at:

### Health Check
```
GET https://your-app-name.onrender.com/health
```

### Prediction Endpoint
```
POST https://your-app-name.onrender.com/predict
Content-Type: application/json

{
  "age": 25,
  "purchases": 3,
  "timeSpent": 15
}
```

### Response Format
```json
{
  "will_purchase": "yes",
  "probability": "75%",
  "reason": "High engagement and purchase history indicate strong buying intent"
}
```

## 🔧 Local Development

```bash
# Install backend dependencies
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your Gemini API key

# Start development server
npm start
```

## 🌐 Deployment Status

✅ **Render Ready** - Configured with render.yaml
✅ **Environment Variables** - Pre-configured in render.yaml
✅ **Auto-Deploy** - Push to GitHub triggers deployment
✅ **Health Monitoring** - Built-in health check endpoint

---

**Deploy with confidence! Your Gemini AI backend is production-ready.** 🚀