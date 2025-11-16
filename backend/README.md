# Gemini AI Backend

A production-ready Express.js backend for AI-powered purchase predictions using Google's Gemini API.

## 🚀 Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Quick Deploy Steps:

1. **Fork/Clone this repository**
2. **Connect to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Service:**
   - **Name:** `gemini-ai-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free` or `Starter`

4. **Set Environment Variables:**
   ```
   GEMINI_API_KEY=AIzaSyAHL-Tdp3vlvGTelE4FP66RK4hsqmDy21M
   NODE_ENV=production
   ```

5. **Deploy!** 🎉

## 📡 API Endpoints

### Health Check
```
GET https://your-app-name.onrender.com/health
```

### Prediction
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
# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your Gemini API key

# Start server
npm start
```

## 🌐 Production Features

✅ **Security Headers** (Helmet.js)
✅ **CORS Protection**
✅ **Input Validation**
✅ **Error Handling**
✅ **Rate Limiting Support**
✅ **Health Monitoring**
✅ **Auto-scaling Ready**

## 📋 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `PORT` | ❌ | Server port (default: 3000) |
| `NODE_ENV` | ❌ | Environment (production/development) |

## 🔗 Frontend Integration

Update your frontend to use the deployed URL:

```javascript
const response = await fetch('https://your-app-name.onrender.com/predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    age: 25,
    purchases: 3,
    timeSpent: 15
  })
});

const prediction = await response.json();
```

## 📊 Monitoring

- **Health Check:** `GET /health`
- **Render Logs:** Available in Render dashboard
- **Error Tracking:** Built-in error logging

---

**Made with ❤️ for AI-powered e-commerce analytics**