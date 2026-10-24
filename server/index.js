import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import donationRoutes from './routes/donations.js';
import verificationRoutes from './routes/verification.js';
import { authenticateToken } from './middleware/auth.js';

const app = express();

// Security & Parsing Middleware
app.use(express.json());
app.use(cookieParser(config.cookieSecret));

// CORS Configuration for local client
app.use(cors({
  origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true, // Allow HttpOnly cookies across origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Global authentication identification middleware
app.use(authenticateToken);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'RescuePlate Authentication & RBAC Engine',
    timestamp: new Date().toISOString(),
    user: req.user ? { email: req.user.email, role: req.user.role } : null
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api', verificationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR'
  });
});

// Start Server only if invoked directly via "node server/index.js"
const isDirectRun = process.argv[1] && (process.argv[1].endsWith('server/index.js') || process.argv[1].endsWith('server'));
if (isDirectRun) {
  app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🛡️  RescuePlate Auth & RBAC Server running on port ${config.port}`);
    console.log(`📡 Client URL: ${config.clientUrl}`);
    console.log(`🔒 Security: HttpOnly SameSite=Lax Cookies, bcrypt, JWT`);
    console.log(`=======================================================`);
  });
}

export default app;
