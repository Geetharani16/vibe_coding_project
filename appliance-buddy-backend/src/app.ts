import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import applianceRoutes from './routes/appliances.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'appliance-buddy-backend'
  });
});

// API routes
app.use('/api', applianceRoutes);

// Root endpoint for testing
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Appliance Buddy Backend is running!',
    api_docs: '/api/appliances',
    health_check: '/health'
  });
});

// 404 handler for unmatched routes
app.use('*', (req, res) => {
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

// Global error handler
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
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
});

export default app;