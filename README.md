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
## 1. Overall System Architecture

This diagram shows the high-level view of the entire system. A single **API Gateway** acts as the entry point for all client requests, routing them to the appropriate backend microservice.
```mermaid
graph TD
Client[Client] --> Gateway[API Gateway :8000]
Gateway --> Client[Client]
Gateway --> UserService[User Service :8002]
Gateway --> SellerService[Seller Service :8003]
Gateway --> OrderService[Order Service :8001]
Gateway --> AdminService[Admin Service :8004]
UserService --> DB[(MongoDB)]
SellerService --> DB
AdminService --> DB
OrderService --> DB
OrderService --> Razorpay[Razorpay API]
Razorpay[Razorpay API] --> OrderService
```


| Component | Responsibility |
| :--- | :--- |
| **API Gateway** | The single entry point for all requests. Handles routing, CORS, authentication cookies, and logging. |
| **User Service** | Manages user registration, login/logout, profile, and viewing products. |
| **Seller Service** | Manages seller-specific actions, like adding and managing their products. |
| **Order Service** | Manages creating and viewing orders. Handles payment integration. |
| **Admin Service** | Manages administrative tasks and has oversight over the platform. |
| **MongoDB** | The shared database. While all services connect to it, they each operate on their own distinct data models. |

---

## 2. Request & Routing Flow

This diagram shows how a request is processed, from the browser to the microservice and back. The key is the `pathRewrite` rule in the gateway, which makes the microservices independent of the public URL structure.

**Example Request:** `GET http://localhost:8000/api/v1/users/allproduct`

```mermaid
sequenceDiagram
    participant Browser
    participant API Gateway
    participant UserService

    Browser->>API Gateway: GET /api/v1/users/allproduct
    Note over API Gateway: Matches route '/api/v1/users'.
    Note over API Gateway: Rewrites path from '/api/v1/users/allproduct' to '/allproduct'.
    API Gateway->>UserService: GET /allproduct
    UserService-->>API Gateway: 200 OK (Product Data)
    API Gateway-->>Browser: 200 OK (Product Data)
```

**Explanation:**
1.  The Gateway receives the request and matches the `/api/v1/users` prefix.
2.  It **strips that prefix** from the URL, leaving just `/allproduct`.
3.  It forwards the simplified request to the `user-service`.
4.  The `user-service` has a simple router that listens for `/allproduct` at its root, so it matches perfectly.

---

## 3. Authentication Flow (Login & Cookies)

This is the most critical flow. It shows how a user logs in and how the gateway ensures the authentication cookie is set correctly in the browser.


```mermaid
sequenceDiagram
    participant Browser
    participant API Gateway
    participant UserService

    Browser->>API Gateway: POST /api/v1/users/login (with credentials)
    API Gateway->>UserService: POST /login (with credentials)
    UserService->>UserService: Validate credentials, create JWTs.
    Note over UserService: Prepares 'Set-Cookie' header for domain 'localhost:8002'.
    UserService-->>API Gateway: 200 OK (with 'Set-Cookie' header)
    Note over API Gateway: Receives cookie for 'localhost:8002'.
    Note over API Gateway: 'cookieDomainRewrite' rewrites it to 'localhost'.
    API Gateway-->>Browser: 200 OK (with rewritten 'Set-Cookie' header)
    Note over Browser: Stores cookie for domain 'localhost', valid for requests to port 8000.
```

**Key Concept: `cookieDomainRewrite`**
- Without this, the browser would reject the cookie because it came from the gateway (`localhost:8000`) but was for the user service's domain (`localhost:8002`).
- The gateway fixes this by changing the cookie's domain to its own, making the browser trust it.

---

## 4. Authenticated Request Flow

Once logged in, the browser automatically sends the cookie with every subsequent request to the gateway.

```mermaid
sequenceDiagram
    participant Browser
    participant API Gateway
    participant OrderService

    Browser->>API Gateway: GET /api/v1/orders/view-all (with auth cookie)
    API Gateway->>OrderService: GET /view-all (with auth cookie)
    OrderService->>OrderService: Middleware verifies JWT from cookie.
    OrderService-->>API Gateway: 200 OK (Order Data)
    API Gateway-->>Browser: 200 OK (Order Data)
```

**Explanation:**
- The browser sends the cookie it stored during login.
- The gateway transparently passes the cookie along to the `order-service`.
- The `order-service`'s `auth.middleware.js` reads the cookie, verifies the JWT, and attaches the user's data to the request.

---


---

## 5. Create Order Flow (via Razorpay)

This diagram shows the end-to-end process for creating an order using Razorpay for online payment. It involves two main stages: creating the order on Razorpay's servers and then verifying the payment after the user completes it.

```mermaid
sequenceDiagram
    participant Browser
    participant API Gateway
    participant OrderService
    participant RazorpayAPI

    Browser->>API Gateway: 1. POST /api/v1/orders/create-payment-order (with product details)
    API Gateway->>OrderService: 2. POST /create-payment-order
    OrderService->>RazorpayAPI: 3. Create Order(amount, currency)
    RazorpayAPI-->>OrderService: 4. Returns Razorpay Order ID
    OrderService-->>API Gateway: 5. Returns {razorpay_order_id, api_key}
    API Gateway-->>Browser: 6. Returns {razorpay_order_id, api_key}
    
    Note over Browser: 7. User pays with Razorpay Checkout UI

    Browser->>API Gateway: 8. POST /api/v1/orders/verify-payment (with payment details)
    API Gateway->>OrderService: 9. POST /verify-payment
    OrderService->>OrderService: 10. Verify Razorpay signature
    Note over OrderService: If signature is valid...
    OrderService->>OrderService: 11. Save final order to MongoDB
    OrderService-->>API Gateway: 12. 200 OK (Payment Successful)
    API Gateway-->>Browser: 13. 200 OK (Payment Successful)
```

---

## 6. Create Order Flow (Cash on Delivery - COD)

The COD flow is simpler as it doesn't involve an external payment provider. The order is created directly in our system with a pending status.

```mermaid
sequenceDiagram
    participant Browser
    participant API Gateway
    participant OrderService

    Browser->>API Gateway: POST /api/v1/orders/create-cod-order (with product & address)
    API Gateway->>OrderService: POST /create-cod-order
    OrderService->>OrderService: Create order in MongoDB with status 'PENDING'
    OrderService-->>API Gateway: 200 OK (Order Placed)
    API Gateway-->>Browser: 200 OK (Order Placed)
```

---

## 7. Seller Flow (Add a New Product)

This diagram shows how a seller adds a new product to the platform. This flow includes handling file uploads and interacting with an external service like Cloudinary to store images.

```mermaid
sequenceDiagram
    participant Browser
    participant API Gateway
    participant SellerService
    participant CloudinaryAPI

    Note over Browser: Seller fills out product form with image and submits.
    Browser->>API Gateway: POST /api/v1/seller/add-product (multipart/form-data)
    API Gateway->>SellerService: POST /add-product (multipart/form-data)
    Note over SellerService: Multer middleware processes the image file.
    SellerService->>CloudinaryAPI: Upload image file
    CloudinaryAPI-->>SellerService: Return secure image URL
    SellerService->>SellerService: Save product details (with image URL) to MongoDB
    SellerService-->>API Gateway: 201 Created (Product Added)
    API Gateway-->>Browser: 201 Created (Product Added)
```

---

---

## 8. Seller Flow (Order Management)

This diagram outlines how a seller manages their orders, from viewing incoming orders for their products to updating an order's status (e.g., dispatching it).

```mermaid
sequenceDiagram
    participant Browser
    participant API Gateway
    participant SellerService
    participant MongoDB

    Note over Browser: Seller wants to view their orders.
    Browser->>API Gateway: GET /api/v1/seller/orders
    API Gateway->>SellerService: GET /orders
    SellerService->>MongoDB: Find products where seller_id = current_seller
    MongoDB-->>SellerService: Return seller's product list
    SellerService->>MongoDB: Find orders where product_id is in seller's product list
    MongoDB-->>SellerService: Return order list
    SellerService-->>API Gateway: 200 OK (Order List)
    API Gateway-->>Browser: 200 OK (Order List)

    Note over Browser: Seller dispatches an order.
    Browser->>API Gateway: PATCH /api/v1/seller/orders/:id/dispatch
    API Gateway->>SellerService: PATCH /orders/:id/dispatch
    SellerService->>SellerService: Verify order belongs to seller
    SellerService->>MongoDB: Update order status to 'DISPATCHED'
    MongoDB-->>SellerService: Update successful
    SellerService-->>API Gateway: 200 OK (Order Updated)
    API Gateway-->>Browser: 200 OK (Order Updated)
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
