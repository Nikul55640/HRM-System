import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 5002;

// Middleware
app.use(cors());
app.use(express.json());

// Simple SSE test endpoint
app.get('/test-sse-simple', (req, res) => {
  console.log('🔔 SSE connection attempt received');
  console.log('Headers:', req.headers);
  console.log('Query:', req.query);

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  console.log('✅ SSE headers sent');

  // Send initial connection message
  res.write(`data: ${JSON.stringify({
    type: 'connection',
    message: 'Connected to test SSE stream',
    timestamp: new Date().toISOString()
  })}\n\n`);

  console.log('✅ Initial message sent');

  // Send periodic messages
  let counter = 0;
  const interval = setInterval(() => {
    counter++;
    const message = {
      type: 'test',
      message: `Test message ${counter}`,
      timestamp: new Date().toISOString()
    };

    try {
      res.write(`data: ${JSON.stringify(message)}\n\n`);
      console.log(`📤 Sent message ${counter}`);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      clearInterval(interval);
    }

    if (counter >= 10) {
      clearInterval(interval);
      console.log('🏁 Test completed');
    }
  }, 2000);

  // Handle client disconnect
  req.on('close', () => {
    console.log('🔌 Client disconnected');
    clearInterval(interval);
  });

  req.on('aborted', () => {
    console.log('🔌 Connection aborted');
    clearInterval(interval);
  });
});

// Test with authentication
app.get('/test-sse-auth', (req, res) => {
  console.log('🔔 SSE connection with auth attempt received');
  
  // Check for token
  let token = req.headers.authorization?.replace('Bearer ', '');
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({
      success: false,
      message: 'Token required'
    });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified for user:', decoded.id);
    
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Send connection confirmation
    res.write(`data: ${JSON.stringify({
      type: 'connection',
      message: `Connected as user ${decoded.id}`,
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Keep connection alive
    const heartbeat = setInterval(() => {
      try {
        res.write(`data: ${JSON.stringify({
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        })}\n\n`);
        console.log('💓 Heartbeat sent');
      } catch (error) {
        console.error('❌ Heartbeat error:', error);
        clearInterval(heartbeat);
      }
    }, 10000);

    req.on('close', () => {
      console.log('🔌 Authenticated client disconnected');
      clearInterval(heartbeat);
    });

  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🧪 SSE Debug Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('📋 Test URLs:');
  console.log(`1. Simple SSE: http://localhost:${PORT}/test-sse-simple`);
  console.log(`2. Auth SSE: http://localhost:${PORT}/test-sse-auth?token=YOUR_JWT_TOKEN`);
  console.log('');
  console.log('💡 Test with curl:');
  console.log(`curl -N http://localhost:${PORT}/test-sse-simple`);
});