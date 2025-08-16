import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

export const loginRateLimiter = rateLimit({
  windowMs: config.rateLimit.lockoutTime * 60 * 1000, // Convert minutes to milliseconds
  max: config.rateLimit.maxLoginAttempts,
  message: `Too many login attempts. Please try again after ${config.rateLimit.lockoutTime} minutes.`,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});