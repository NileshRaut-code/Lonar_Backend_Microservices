import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

const app = express();
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
const onProxyReq = (proxyReq, req, res) => {
    console.log(`[Gateway] Forwarding request: ${req.method} ${req.originalUrl} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
};

const onError = (err, req, res) => {
    console.error('[Gateway] Proxy Error:', err);
    res.status(500).send('Proxy encountered an error.');
};

const services = [
    { route: '/api/v1/users', target: 'http://localhost:8002' },    // User Service
    { route: '/api/v1/seller', target: 'http://localhost:8003' },   // Seller Service
    { route: '/api/v1/orders', target: 'http://localhost:8001' },   // Order Service
    { route: '/api/v1/admin', target: 'http://localhost:8004' },    // Admin Service
];

services.forEach(({ route, target }) => {
    app.use(route, createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: {
            [`^${route}`]: '', // remove base path
        },
        onProxyReq,
        onError,
        cookieDomainRewrite: "localhost" // Rewrite cookie domain to the gateway's domain
    }));
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`API Gateway listening on port ${PORT}`);
});
