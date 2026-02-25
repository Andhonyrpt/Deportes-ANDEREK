# AGENTS.md - E-commerce API Documentation

Technical guide for agentic interactions with the `ecommerce-api`.

## Directory Structure (src/)
```
src/
├── config/           # Database and environment configurations
├── controllers/      # Business logic and request handlers
├── middlewares/      # Auth, Admin check, Validations, Rate limiting
├── models/           # Mongoose schemas and models
└── routes/           # Express route definitions
```

## API Route Map

| Method | Path | Auth | Admin | Description |
| :--- | :--- | :---: | :---: | :--- |
| **POST** | `/auth/register` | No | No | Register a new customer |
| **POST** | `/auth/login` | No | No | Login and receive tokens |
| **POST** | `/auth/refresh` | No | No | Refresh expired access token |
| **GET** | `/auth/check-email` | No | No | Check if email is registered |
| **GET** | `/products` | No | No | List products with pagination |
| **GET** | `/products/search` | No | No | Search products with filters |
| **GET** | `/products/:id` | No | No | Get product by ID |
| **POST** | `/products` | Yes | Yes | Create new product |
| **PUT** | `/products/:id` | Yes | Yes | Update product |
| **DELETE** | `/products/:id` | Yes | Yes | Delete product |
| **GET** | `/cart/user/:userId` | Yes | No | Get user's active cart |
| **POST** | `/cart/add` | Yes | No | Add item to cart |
| **PUT** | `/cart/update-item` | Yes | No | Update quantity/size in cart |
| **GET** | `/orders/user/:userId` | Yes | No | Get orders of a specific user |
| **POST** | `/orders` | Yes | No | Create a new order |
| **PATCH** | `/orders/:id/status` | Yes | Yes | Update order status |

## Mongoose Models

| Model | Key Fields |
| :--- | :--- |
| **User** | `displayName`, `email`, `hashPassword`, `phone`, `role` (admin/customer/guest), `isActive` |
| **Product** | `name`, `description`, `modelo`, `price`, `imagesUrl` (Array), `category` (Ref), `variants` ([{size, stock}]) |
| **Cart** | `user` (Ref), `products` ([{product (Ref), quantity, size}]) |
| **Order** | `user` (Ref), `products` ([{productId, size, quantity, price}]), `totalPrice`, `status`, `shippingAddress` (Ref) |
| **Category**| `name`, `description`, `imageUrl`, `parentCategory` (Ref) |

## Available Validators (`validators.js`)
Use these functions in routes to validate input:
- `emailValidation`, `passwordValidation`, `displayNameValidation`, `phoneValidation`
- `mongoIdValidation`, `bodyMongoIdValidation`, `queryMongoIdValidation`
- `priceValidation`, `quantityValidation`, `sizeValidation` (S, M, L, XL)
- `stockValidation`, `paginationValidation`, `orderStatusValidation`
- `searchQueryValidation`, `sortFieldValidation`, `orderValidation`
- `urlValidation`, `imagesUrlValidation`

## Implementation Patterns

### Controller Pattern (Standard)
```javascript
async function sampleHandler(req, res, next) {
    try {
        const data = await Model.find();
        res.status(200).json(data);
    } catch (err) {
        next(err); // Pass error to global handler
    }
}
```

### Route Pattern (Protected + Validated)
```javascript
router.post('/path', 
    authMiddleware, 
    [bodyMongoIdValidation("id", "Label"), quantityValidation()], 
    validate, 
    controllerFunction
);
```

## Agent Restrictions
> [!IMPORTANT]
> - **DO NOT** use `require()` (Project uses ESM `import`).
> - **DO NOT** create new Contexts in the API (API is stateless).
> - **DO NOT** modify `server.js` unless explicitly asked to change server-wide config.
> - **DO NOT** skip `validate` middleware when using validator arrays.
> - **DO NOT** implement new business logic inside Routes (use Controllers).
