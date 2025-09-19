const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { gql } = require('apollo-server-express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const PORT = process.env.PORT || 3003;

// In-memory databases
let orders = [
  {
    id: '1',
    userId: 'user1',
    status: 'COMPLETED',
    total: 299.99,
    items: [
      {
        id: '1',
        productId: 'prod1',
        productName: 'Laptop',
        quantity: 1,
        price: 299.99
      }
    ],
    createdAt: new Date('2023-01-15').toISOString(),
    updatedAt: new Date('2023-01-15').toISOString()
  },
  {
    id: '2',
    userId: 'user2',
    status: 'PENDING',
    total: 89.99,
    items: [
      {
        id: '2',
        productId: 'prod2',
        productName: 'Headphones',
        quantity: 1,
        price: 89.99
      }
    ],
    createdAt: new Date('2023-01-16').toISOString(),
    updatedAt: new Date('2023-01-16').toISOString()
  }
];

let carts = [
  {
    id: '1',
    userId: 'user1',
    items: [
      {
        id: '1',
        productId: 'prod3',
        productName: 'Mouse',
        quantity: 2,
        price: 25.99
      }
    ],
    total: 51.98,
    updatedAt: new Date().toISOString()
  }
];

// GraphQL schema
const typeDefs = gql`
  type Order {
    id: ID!
    userId: String!
    status: OrderStatus!
    total: Float!
    items: [OrderItem!]!
    createdAt: String!
    updatedAt: String!
  }

  type OrderItem {
    id: ID!
    productId: String!
    productName: String!
    quantity: Int!
    price: Float!
  }

  type Cart {
    id: ID!
    userId: String!
    items: [CartItem!]!
    total: Float!
    updatedAt: String!
  }

  type CartItem {
    id: ID!
    productId: String!
    productName: String!
    quantity: Int!
    price: Float!
  }

  enum OrderStatus {
    PENDING
    PROCESSING
    SHIPPED
    DELIVERED
    COMPLETED
    CANCELLED
  }

  input OrderItemInput {
    productId: String!
    productName: String!
    quantity: Int!
    price: Float!
  }

  input CartItemInput {
    productId: String!
    productName: String!
    quantity: Int!
    price: Float!
  }

  type Query {
    orders(userId: String): [Order!]!
    order(id: ID!): Order
    cart(userId: String!): Cart
  }

  type Mutation {
    createOrder(userId: String!, items: [OrderItemInput!]!): Order!
    updateOrderStatus(id: ID!, status: OrderStatus!): Order
    addToCart(userId: String!, item: CartItemInput!): Cart!
    removeFromCart(userId: String!, productId: String!): Cart!
    checkout(userId: String!): Order!
  }
`;

// GraphQL resolvers
const resolvers = {
  Query: {
    orders: (_, { userId }) => {
      if (userId) {
        return orders.filter(order => order.userId === userId);
      }
      return orders;
    },
    order: (_, { id }) => {
      return orders.find(order => order.id === id);
    },
    cart: (_, { userId }) => {
      return carts.find(cart => cart.userId === userId);
    }
  },
  Mutation: {
    createOrder: (_, { userId, items }) => {
      try {
        const orderId = uuidv4();
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const orderItems = items.map(item => ({
          id: uuidv4(),
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price
        }));

        const newOrder = {
          id: orderId,
          userId,
          status: 'PENDING',
          total,
          items: orderItems,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        orders.push(newOrder);
        return newOrder;
      } catch (error) {
        throw new Error(`Failed to create order: ${error.message}`);
      }
    },
    updateOrderStatus: (_, { id, status }) => {
      try {
        const orderIndex = orders.findIndex(order => order.id === id);
        if (orderIndex === -1) {
          throw new Error('Order not found');
        }

        orders[orderIndex] = {
          ...orders[orderIndex],
          status,
          updatedAt: new Date().toISOString()
        };

        return orders[orderIndex];
      } catch (error) {
        throw new Error(`Failed to update order status: ${error.message}`);
      }
    },
    addToCart: (_, { userId, item }) => {
      try {
        let cart = carts.find(c => c.userId === userId);

        if (!cart) {
          cart = {
            id: uuidv4(),
            userId,
            items: [],
            total: 0,
            updatedAt: new Date().toISOString()
          };
          carts.push(cart);
        }

        const existingItemIndex = cart.items.findIndex(i => i.productId === item.productId);

        if (existingItemIndex >= 0) {
          cart.items[existingItemIndex].quantity += item.quantity;
        } else {
          cart.items.push({
            id: uuidv4(),
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price
          });
        }

        cart.total = cart.items.reduce((sum, cartItem) =>
          sum + (cartItem.price * cartItem.quantity), 0);
        cart.updatedAt = new Date().toISOString();

        return cart;
      } catch (error) {
        throw new Error(`Failed to add item to cart: ${error.message}`);
      }
    },
    removeFromCart: (_, { userId, productId }) => {
      try {
        const cart = carts.find(c => c.userId === userId);

        if (!cart) {
          throw new Error('Cart not found');
        }

        cart.items = cart.items.filter(item => item.productId !== productId);
        cart.total = cart.items.reduce((sum, cartItem) =>
          sum + (cartItem.price * cartItem.quantity), 0);
        cart.updatedAt = new Date().toISOString();

        return cart;
      } catch (error) {
        throw new Error(`Failed to remove item from cart: ${error.message}`);
      }
    },
    checkout: (_, { userId }) => {
      try {
        const cart = carts.find(c => c.userId === userId);

        if (!cart || cart.items.length === 0) {
          throw new Error('Cart is empty or not found');
        }

        const orderId = uuidv4();
        const orderItems = cart.items.map(item => ({
          id: uuidv4(),
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price
        }));

        const newOrder = {
          id: orderId,
          userId,
          status: 'PENDING',
          total: cart.total,
          items: orderItems,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        orders.push(newOrder);

        // Clear the cart
        cart.items = [];
        cart.total = 0;
        cart.updatedAt = new Date().toISOString();

        return newOrder;
      } catch (error) {
        throw new Error(`Failed to checkout: ${error.message}`);
      }
    }
  }
};

async function startServer() {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));
  app.use(cors());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      service: 'order-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      req
    }),
    introspection: true,
    playground: true
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      error: 'Something went wrong!',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Route not found',
      path: req.originalUrl
    });
  });

  app.listen(PORT, () => {
    console.log(`🚀 Order Service (GraphQL) running on port ${PORT}`);
    console.log(`🎮 GraphQL Playground available at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`❤️ Health check available at http://localhost:${PORT}/health`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = { typeDefs, resolvers };