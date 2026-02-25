# AGENTS.md - E-commerce API Documentation

Technical guide for agentic interactions with the `ecommerce-api`.

## Directory Structure (src/)
```
src/
├── config/           # Database and environment configurations
├── controllers/      # Business logic and request handlers
├── middlewares/      # Auth, Admin check, Validations, Rate limiting
├── models/           # Mongoose schemas and models
├── routes/           # Express route definitions
```

## API Route Map

### Authentication
| Method | Path | Auth | Admin | Description |
| :--- | :--- | :---: | :---: | :--- |
| **POST** | `/auth/register` | No | No | Register a new customer |
| **POST** | `/auth/login` | No | No | Login and receive tokens |
| **POST** | `/auth/refresh` | No | No | Refresh expired access token |
| **GET** | `/auth/check-email` | No | No | Check if email is registered |

### Products & Categories
| Method | Path | Auth | Admin | Description |
| :--- | :--- | :---: | :---: | :--- |
| **GET** | `/products` | No | No | List products with pagination |
| **GET** | `/products/search` | No | No | Search products with filters |
| **GET** | `/products/:id` | No | No | Get product by ID |
| **POST** | `/products` | Yes | Yes | Create new product |
| **PUT** | `/products/:id` | Yes | Yes | Update product |
| **DELETE** | `/products/:id` | Yes | Yes | Delete product |
| **GET** | `/categories` | No | No | List all categories |
| **GET** | `/categories/search` | No | No | Search categories |
| **POST** | `/categories` | Yes | Yes | Create category |
| **GET** | `/subcategories` | No | No | List all subcategories |

### User & Profile
| Method | Path | Auth | Admin | Description |
| :--- | :--- | :---: | :---: | :--- |
| **GET** | `/users/profile` | Yes | No | Get current user profile |
| **PUT** | `/users/profile` | Yes | No | Update current user profile |
| **GET** | `/users` | Yes | Yes | List all users (admin) |
| **POST** | `/users` | Yes | Yes | Create user (admin) |
| **PUT** | `/change-password/:userId` | Yes | No | Change user password |
| **PATCH** | `/deactivate` | Yes | No | Deactivate own account |

### Cart & Orders
| Method | Path | Auth | Admin | Description |
| :--- | :--- | :---: | :---: | :--- |
| **GET** | `/cart/user/:userId` | Yes | No | Get user's active cart |
| **POST** | `/cart/add` | Yes | No | Add item to cart |
| **PUT** | `/cart/update-item` | Yes | No | Update quantity/size in cart |
| **GET** | `/orders` | Yes | Yes | List all orders (admin) |
| **GET** | `/orders/user/:userId` | Yes | No | Get orders of a specific user |
| **POST** | `/orders` | Yes | No | Create a new order |
| **PATCH** | `/orders/:id/status` | Yes | Yes | Update order status |
| **PATCH** | `/orders/:id/cancel` | Yes | Yes | Cancel order |

### Shipping & Payments
| Method | Path | Auth | Admin | Description |
| :--- | :--- | :---: | :---: | :--- |
| **GET** | `/user-addresses` | Yes | No | Get user's addresses |
| **POST** | `/new-address` | Yes | No | Add new shipping address |
| **GET** | `/payment-methods` | Yes | No | Get user's payment methods |
| **POST** | `/payment-methods` | Yes | No | Add new payment method |

### Wishlist & Reviews
| Method | Path | Auth | Admin | Description |
| :--- | :--- | :---: | :---: | :--- |
| **GET** | `/wishlist` | Yes | No | Get user's wishlist |
| **POST** | `/wishlist/add` | Yes | No | Add product to wishlist |
| **POST** | `/review` | Yes | No | Create product review |
| **GET** | `/review-product/:productId` | No | No | Get reviews for a product |

### Notifications
| Method | Path | Auth | Admin | Description |
| :--- | :--- | :---: | :---: | :--- |
| **GET** | `/notifications/user/:userId` | Yes | No | Get user notifications |
| **PATCH** | `/notifications/:id/mark-read` | Yes | No | Mark notification as read |

## Mongoose Models

| Model | Key Fields |
| :--- | :--- |
| **User** | `displayName`, `email`, `hashPassword`, `phone`, `role` (admin/customer/guest), `isActive`, `avatar` |
| **Product** | `name`, `description`, `modelo`, `price`, `imagesUrl` (Array), `category` (Ref), `variants` ([{size, stock}]) |
| **Cart** | `user` (Ref), `products` ([{product (Ref), quantity, size}]) |
| **Order** | `user` (Ref), `products` ([{productId, size, quantity, price}]), `totalPrice`, `status`, `shippingAddress` (Ref), `paymentMethod` (Ref) |
| **Category**| `name`, `description`, `imageUrl`, `parentCategory` (Ref) |
| **SubCategory**| `name`, `description`, `category` (Ref) |
| **ShippingAddress**| `user` (Ref), `name`, `addressLine`, `city`, `state`, `postalCode`, `country`, `isDefault` |
| **PaymentMethod**| `user` (Ref), `alias`, `cardNumber`, `cardHolder`, `expiryDate`, `isDefault` |
| **Review** | `user` (Ref), `product` (Ref), `rating`, `comment` |
| **WishList** | `user` (Ref), `products` ([{product (Ref), addedAt}]) |
| **Notification**| `user` (Ref), `message`, `isRead`, `type` |

## Available Validators (`validators.js`)
Use these functions in routes to validate input:
- `emailValidation`, `passwordValidation`, `userDisplayNameValidation`, `phoneValidation`
- `mongoIdValidation`, `bodyMongoIdValidation`, `queryMongoIdValidation`
- `priceValidation`, `quantityValidation`, `sizeValidation` (S, M, L, XL)
- `stockValidation`, `paginationValidation`, `orderStatusValidation`, `paymentStatusValidation`
- `searchQueryValidation`, `sortFieldValidation`, `orderValidation`
- `urlValidation`, `imagesUrlValidation`, `booleanValidation`
- `ratingValidation`, `commentValidation`, `messageValidation`

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
