const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable for GraphQL playground
}));
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json());

// Service configuration
const services = {
  users: {
    url: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    endpoints: ['/api/users']
  },
  products: {
    url: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
    endpoints: ['/api/products']
  },
  orders: {
    url: process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
    endpoints: ['/api/orders', '/graphql']
  },
  analytics: {
    url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3004',
    endpoints: ['/api/analytics', '/analytics/graphql']
  }
};

// Health check endpoint
app.get('/health', async (req, res) => {
  const serviceHealthChecks = await Promise.allSettled([
    fetch(`${services.users.url}/health`).then(r => r.json()).catch(() => ({ status: 'unhealthy' })),
    fetch(`${services.products.url}/health`).then(r => r.json()).catch(() => ({ status: 'unhealthy' })),
    fetch(`${services.orders.url}/health`).then(r => r.json()).catch(() => ({ status: 'unhealthy' })),
    fetch(`${services.analytics.url}/health`).then(r => r.json()).catch(() => ({ status: 'unhealthy' }))
  ]);

  res.json({
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      users: serviceHealthChecks[0].value || { status: 'unknown' },
      products: serviceHealthChecks[1].value || { status: 'unknown' },
      orders: serviceHealthChecks[2].value || { status: 'unknown' },
      analytics: serviceHealthChecks[3].value || { status: 'unknown' }
    }
  });
});

// Gateway info endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'API Gateway',
    description: 'E-Commerce Microservices API Gateway',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: '/api/users/*',
      products: '/api/products/*',
      orders: '/api/orders/*',
      ordersGraphQL: '/orders/graphql',
      analytics: '/api/analytics/*',
      analyticsGraphQL: '/analytics/graphql'
    },
    documentation: {
      products: `${services.products.url}/docs`,
      analytics: `${services.analytics.url}/docs`,
      ordersGraphQL: `${services.orders.url}/graphql`,
      analyticsGraphQL: `${services.analytics.url}/graphql`
    }
  });
});

// Simple authentication middleware (mock)
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  // Skip auth for health checks and root
  if (req.path === '/health' || req.path === '/') {
    return next();
  }

  // Simple mock validation (in production, validate JWT)
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No authorization token provided'
    });
  }

  // Mock token validation (always passes for now)
  req.user = {
    id: '1',
    email: 'user@example.com',
    role: 'customer'
  };

  next();
};

// Apply auth middleware to protected routes (optional, can be removed for testing)
// app.use(authMiddleware);

// Proxy configuration options
const createProxyOptions = (target) => ({
  target,
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error(`Proxy error for ${target}:`, err.message);
    res.status(502).json({
      success: false,
      error: 'Service unavailable',
      service: target,
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal service error'
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    // Forward user context if available
    if (req.user) {
      proxyReq.setHeader('X-User-Id', req.user.id);
      proxyReq.setHeader('X-User-Email', req.user.email);
      proxyReq.setHeader('X-User-Role', req.user.role);
    }
  },
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error'
});

// User Service routes
app.use('/api/users', createProxyMiddleware({
  ...createProxyOptions(services.users.url),
  pathRewrite: { '^/api/users': '/api/users' }
}));

// Product Service routes
app.use('/api/products', createProxyMiddleware({
  ...createProxyOptions(services.products.url),
  pathRewrite: { '^/api/products': '/api/products' }
}));

// Order Service routes
app.use('/api/orders', createProxyMiddleware({
  ...createProxyOptions(services.orders.url),
  pathRewrite: { '^/api/orders': '/api/orders' }
}));

// Order Service GraphQL
app.use('/orders/graphql', createProxyMiddleware({
  ...createProxyOptions(services.orders.url),
  pathRewrite: { '^/orders/graphql': '/graphql' },
  ws: true // Enable WebSocket for GraphQL subscriptions
}));

// Analytics Service routes
app.use('/api/analytics', createProxyMiddleware({
  ...createProxyOptions(services.analytics.url),
  pathRewrite: { '^/api/analytics': '/api/analytics' }
}));

// Analytics Service GraphQL
app.use('/analytics/graphql', createProxyMiddleware({
  ...createProxyOptions(services.analytics.url),
  pathRewrite: { '^/analytics/graphql': '/graphql' }
}));

// Combined GraphQL endpoint (optional - federates both GraphQL services)
app.post('/graphql', async (req, res) => {
  const { query, variables } = req.body;

  try {
    // Determine which service to route to based on query content
    let targetUrl;
    if (query.includes('order') || query.includes('cart') || query.includes('Order') || query.includes('Cart')) {
      targetUrl = `${services.orders.url}/graphql`;
    } else if (query.includes('sales') || query.includes('analytics') || query.includes('revenue') || query.includes('Report')) {
      targetUrl = `${services.analytics.url}/graphql`;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Unable to determine target service for query'
      });
    }

    // Forward the request
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      },
      body: JSON.stringify({ query, variables })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('GraphQL routing error:', error);
    res.status(500).json({
      success: false,
      error: 'GraphQL query failed',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Gateway error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Gateway error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found in gateway',
    path: req.originalUrl,
    availableEndpoints: {
      users: '/api/users',
      products: '/api/products',
      orders: '/api/orders',
      ordersGraphQL: '/orders/graphql',
      analytics: '/api/analytics',
      analyticsGraphQL: '/analytics/graphql'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌐 API Gateway running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 Gateway info: http://localhost:${PORT}/`);
  console.log('\n🔀 Routing configuration:');
  console.log(`  → User Service: ${services.users.url}`);
  console.log(`  → Product Service: ${services.products.url}`);
  console.log(`  → Order Service: ${services.orders.url}`);
  console.log(`  → Analytics Service: ${services.analytics.url}`);
});

module.exports = app;