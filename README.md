Here's a **README** file tailored for your project after refactoring it from a **monolithic architecture** to a **microservices architecture** using **Node.js**, **Express**, **MongoDB**, and **API Gateway/Proxy**.

---

## 🏪 Lonar Marketplace Backend - Microservices Architecture

This is a refactored version of the original monolithic [Lonar Marketplace Backend](https://github.com/NileshRaut-code/Lonar-markate-place-backend) into a microservices-based architecture using **Node.js**, **Express**, **MongoDB**, and **API Gateway** pattern.

---

### 📦 Tech Stack

| Component     | Technology           |
| ------------- | -------------------- |
| Backend       | Node.js, Express     |
| Database      | MongoDB              |
| API Gateway   | Express + http-proxy |
| Auth          | JWT-based Auth       |
| Communication | REST APIs (HTTP)     |
| Environment   | Docker (optional) i will add latter   |

---

### 🧱 Microservices Overview

Each microservice runs independently and handles a specific domain:

| Service           | Description                                 |
| ----------------- | ------------------------------------------- |
| `User-service`    | Handles user registration, login, JWT auth Manages user profiles, roles, data     |
| `seller-service` | Manages product listings, categories        |
| `order-service`   | Handles order processing, cart, checkout ,Integrates with payment gateways     |
| `Admin-service`   | Handles whole App super admin  |
| `gateway`         | Acts as the API Gateway/Proxy               |

---

### 📁 Project Structure

```bash
lonar-marketplace-microservices/
├── user-service/
├── order-service/
├── Seller-service/
├── Admin-service/
├── gateway/               # API Gateway
```

Each service has its own:

* `package.json`
* `.env`
* `Dockerfile` (optional)
* `routes/`, `controllers/`, `models/` (Express structure)

---

### ⚙️ Setup Instructions

#### 1. Clone Repository

```bash
git clone [https://github.com/NileshRaut-code/Lonar-markate-place-backend](https://github.com/NileshRaut-code/Lonar_Backend_Microservices)
cd 
```

> You can split this monolith into folders as per the structure above or use branches/submodules for each service.

---

#### 2. Install Dependencies

Each service must install its own dependencies:

```bash
cd user-service && npm install
cd ../user-service && npm install
...
```

---

#### 3. Environment Variables

Create a `.env` file inside each service directory:

**Example for `user-service`**

```env
PORT=8001
MONGO_URI=mongodb://localhost:27017/
JWT_SECRET=your_jwt_secret
```

Repeat for each service with their specific ports and DB URIs.

---

#### 4. Run Services Individually

```bash
# From each microservice folder
npm start
```

Or use `concurrently` or `pm2` for orchestration in local dev.

---

#### 5. API Gateway Setup (gateway/)

**gateway/index.js**

```js
const express = require('express');
const proxy = require('http-proxy-middleware').createProxyMiddleware;

const app = express();

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
            [`^${route}`]: '',
        },
        onProxyReq,
        onError,
        cookieDomainRewrite: "localhost" 
    }));
});
app.listen(8000, () => {
  console.log('API Gateway running at http://localhost:5000');
});
```

Start the API gateway:

```bash
cd gateway
npm install
npm start
```

---

### ✅ Features

* Modular microservices
* JWT-based authentication
* MongoDB per service (schema separation)
* Easy horizontal scaling
* Gateway pattern for centralized routing

---

### 📘 Future Improvements

* Service Discovery (via Consul/NATS)
* Event-driven architecture (Kafka/NATS)
* Docker Compose support
*  Circuit Breaker (via gateway)

---

### 🙌 Contribution

Feel free to fork, clone, and raise PRs.

---

### 🔗 Original Monolith Reference

[Monolithic Version]([https://github.com/NileshRaut-code/Lonar-markate-place-backend](https://github.com/NileshRaut-code/Lonar_Backend_Microservices))

---

Would you like me to:

* Generate this as individual folders for each service?
* Write Docker/Compose setup?
* Add Swagger/OpenAPI documentation?

Let me know!
