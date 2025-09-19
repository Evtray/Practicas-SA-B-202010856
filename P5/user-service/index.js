const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mock database (in-memory)
const users = new Map();
let userIdCounter = 1;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    service: 'user-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// GET all users
app.get('/api/users', (req, res) => {
  const userList = Array.from(users.values()).map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt
  }));

  res.json({
    success: true,
    count: userList.length,
    data: userList
  });
});

// GET user by ID
app.get('/api/users/:id', (req, res) => {
  const user = users.get(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  const { password, ...userWithoutPassword } = user;
  res.json({
    success: true,
    data: userWithoutPassword
  });
});

// POST register user
app.post('/api/users/register', (req, res) => {
  const { email, password, name } = req.body;

  // Basic validation
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      error: 'Email, password and name are required'
    });
  }

  // Check if user exists
  const existingUser = Array.from(users.values()).find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: 'User already exists'
    });
  }

  // Create new user
  const newUser = {
    id: String(userIdCounter++),
    email,
    password, // In production, this should be hashed
    name,
    role: 'customer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.set(newUser.id, newUser);

  const { password: _, ...userResponse } = newUser;
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: userResponse
  });
});

// POST login
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }

  const user = Array.from(users.values()).find(u => u.email === email);

  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Generate mock token
  const token = `mock-jwt-token-${user.id}-${Date.now()}`;

  const { password: _, ...userResponse } = user;
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userResponse,
      token
    }
  });
});

// PUT update user
app.put('/api/users/:id', (req, res) => {
  const user = users.get(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  const { name, email, role } = req.body;

  // Update fields if provided
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  user.updatedAt = new Date().toISOString();

  users.set(user.id, user);

  const { password, ...userResponse } = user;
  res.json({
    success: true,
    message: 'User updated successfully',
    data: userResponse
  });
});

// DELETE user
app.delete('/api/users/:id', (req, res) => {
  const user = users.get(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  users.delete(req.params.id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// Seed initial data
function seedUsers() {
  const initialUsers = [
    {
      id: String(userIdCounter++),
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: String(userIdCounter++),
      email: 'john@example.com',
      password: 'password123',
      name: 'John Doe',
      role: 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  initialUsers.forEach(user => users.set(user.id, user));
  console.log(`Seeded ${initialUsers.length} users`);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 User Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API Base: http://localhost:${PORT}/api/users`);
  seedUsers();
});

module.exports = app;