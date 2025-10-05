import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import applianceRoutes from './routes/appliances.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '10000', 10);

// CORS configuration with more permissive settings for debugging
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions));

// Add detailed logging for all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Headers:`, JSON.stringify(req.headers, null, 2));
  next();
});

// Parse JSON bodies with increased limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check endpoint accessed');
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'appliance-buddy-backend'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('Root endpoint accessed');
  res.status(200).json({ 
    message: 'Appliance Buddy Backend is running!',
    api_docs: '/api/appliances',
    health_check: '/health'
  });
});

// API routes
app.use('/api/appliances', applianceRoutes);

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    available_endpoints: [
      'GET /',
      'GET /health',
      'GET /api/appliances',
      'POST /api/appliances',
      'PUT /api/appliances/:id',
      'DELETE /api/appliances/:id'
    ]
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api/appliances`);
});

export default app;