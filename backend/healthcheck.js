/**
 * Docker Health Check Script for Backend API
 * This script checks if the backend API is responding correctly
 */

const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3001,
  path: '/health',
  method: 'GET',
  timeout: 3000
};

const request = http.request(options, (response) => {
  if (response.statusCode === 200) {
    console.log('Health check passed');
    process.exit(0);
  } else {
    console.log(`Health check failed with status: ${response.statusCode}`);
    process.exit(1);
  }
});

request.on('error', (error) => {
  console.log(`Health check failed with error: ${error.message}`);
  process.exit(1);
});

request.on('timeout', () => {
  console.log('Health check timeout');
  request.abort();
  process.exit(1);
});

request.end();