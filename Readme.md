## 🚀 1. Setup Instructions (Frontend)

This repository contains the **frontend** application for OrderBiz, built with React and styled with TailwindCSS.

### Prerequisites

You must have the following installed on your system:

  * **Node.js** (LTS version recommended)
  * **npm** (Node Package Manager) or **yarn**

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/roninstack101/orderbiz.git
    cd orderbiz/frontend
    ```

2.  **Install dependencies:**
    Using npm:
    npm install

    or using yarn:
    yarn install

3.  **Configure Environment Variables:**
    Create a file named `.env` in the root of the frontend directory and add the following variables.

    > **Note:** Replace the placeholder values with your actual configuration. The application needs a Google Maps API Key for mapping features.

    MONGO_URI=''
    JWT_SECRET=''
    OPENCAGE_API_KEY=''
    CLOUDINARY_CLOUD_NAME=''
    CLOUDINARY_API_KEY=''
    CLOUDINARY_API_SECRET=''
    EMAIL_USER=''
    EMAIL_PASS=''
    FRONTEND_URL=http://localhost:3000  
    REACT_APP_Maps_API_KEY='' 


## 🏃 2. Running the Project

### Starting the Development Server

You can start the application using the following scripts defined in `package.json`:

1.  **To run the app in development mode:**

    ```bash
    npm start
    # or
    npm run dev
    ```

    The application will open in your browser at [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000). The page will reload if you make edits.

2.  **To create a production build:**

    ```bash
    npm run build
    ```

    This command builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

-----

## 📂 3. Project Structure

The frontend is a standard React application. Key directories include:

```
frontend/
├── node_modules/       # Project dependencies
├── public/             # Static assets (HTML template, manifest, etc.)
├── src/
│   ├── assets/         # Images, icons, and other static files
│   ├── components/     # Reusable UI components (Buttons, Cards, Modals, etc.)
│   ├── contexts/       # React Context for global state management
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Top-level components for different routes (Home, Dashboard, Shop, etc.)
│   ├── utils/          # Utility functions (e.g., API helpers, formatters)
│   ├── App.js          # Main application component and router setup
│   ├── index.js        # Entry point of the application
│   └── index.css       # TailwindCSS imports and global styles
└── package.json        # Project metadata and dependencies
```

-----

## 🗺️ 4. API Endpoint Descriptions

The frontend communicates with a RESTful backend API. Below are some of the critical endpoints as per the project description. (Assuming a base URL of `${REACT_APP_API_URL}`).

### 4.1. User/Customer Endpoints

| Endpoint | Method | Description | Protected? |
| :--- | :--- | :--- | :--- |
| `/auth/register` | `POST` | Registers a new customer account. | No |
| `/auth/login` | `POST` | Authenticates a user and returns a JWT. | No |
| `/profile` | `GET` | Retrieves the logged-in user's profile details. | Yes (User/Shop Owner) |
| `/shops/nearby` | `GET` | Finds shops within a 500m radius of the provided latitude/longitude. | Yes (User) |
| `/cart` | `POST` / `GET` / `PATCH` | Manages the user's "universal cart" state. | Yes (User) |
| `/orders` | `POST` | Places a new order, splitting the universal cart into separate orders per shop. | Yes (User) |
| `/orders/history` | `GET` | Retrieves a list of the user's past orders. | Yes (User) |

### 4.2. Shop Owner Endpoints

| Endpoint | Method | Description | Protected? |
| :--- | :--- | :--- | :--- |
| `/shops/register-request` | `POST` | Submits a new shop owner registration request for admin approval. | No |
| `/products` | `POST` | Creates a new product for the shop. | Yes (Shop Owner) |
| `/products/:id` | `GET` / `PATCH` / `DELETE` | Retrieves, updates, or deletes a specific product. | Yes (Shop Owner) |
| `/shop/orders` | `GET` | Retrieves all incoming orders for the logged-in shop. | Yes (Shop Owner) |
| `/shop/orders/:id/accept` | `PATCH` | Accepts a specific incoming customer order. | Yes (Shop Owner) |
| `/shop/orders/:id/reject` | `PATCH` | Rejects a specific incoming customer order. | Yes (Shop Owner) |

### 4.3. Admin Endpoints

| Endpoint | Method | Description | Protected? |
| :--- | :--- | :--- | :--- |
| `/admin/shop-requests` | `GET` | Retrieves all pending shop registration requests. | Yes (Admin) |
| `/admin/shop-requests/:id/approve` | `PATCH` | Approves a shop request, creating the shop and shop owner account. | Yes (Admin) |
| `/admin/shops/:id` | `DELETE` | Deletes a shop and its associated user/products. | Yes (Admin) |
| `/admin/users/:id` | `PATCH` / `DELETE` | Updates or deletes a user account. | Yes (Admin) |

-----