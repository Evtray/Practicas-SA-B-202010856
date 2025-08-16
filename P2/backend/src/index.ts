import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { config } from './config/env';
import { generalRateLimiter } from './middlewares/rateLimiter.middleware';
import './config/passport'; // Initialize passport config

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Passport middleware
app.use(passport.initialize());

// Rate limiting
app.use('/api/', generalRateLimiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import { GoogleAuthController } from './controllers/googleAuth.controller';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Google OAuth routes (outside /api to match your redirect URI)
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  GoogleAuthController.googleCallback
);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
});