import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Simple server working' }));
});

server.listen(3003, '0.0.0.0', () => {
  console.log('Simple server running on port 3003');
});

// Test with: curl http://localhost:3003