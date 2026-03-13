import Cart from '../models/cart.js';

async function getCarts(req, res, next) {
  try {
    const carts = await Cart.find().populate('user').populate('products.product');
    res.json(carts);
  } catch (err) {
    next(err);
  }
};

async function getCartById(req, res, next) {
  try {
    const id = req.params.id;
    const cart = await Cart.findById(id).populate('user').populate('products.product');

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

async function getCartByUser(req, res, next) {
  try {
    const userId = req.params.userId;

    // Verificar si el usuario es el dueño del carrito o es admin
    if (userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not allowed to access this cart' });
    }

    const cart = await Cart.findOne({ user: userId }).populate('user').populate('products.product');

    if (!cart) {
      return res.status(404).json({ message: 'No cart found for this user', cart: null });
    }
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

async function createCart(req, res, next) {
  try {
    const { user, products } = req.body;

    const newCart = await Cart.create({
      user,
      products
    });

    await newCart.populate('user');
    await newCart.populate('products.product');

    res.status(201).json(newCart);
  } catch (err) {
    next(err);
  }
};

async function updateCart(req, res, next) {
  try {
    const { id } = req.params;
    const { user, products } = req.body;

    // Validar que al menos un campo sea proporcionado
    if (user === undefined && products === undefined) {
      return res.status(400).json({
        message:
          "At least one field (user or products) must be provided for update",
      });
    }

    // Validar que el usuario es dueño del carrito o es admin
    const cart = await Cart.findById(id);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    if (cart.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not allowed to modify this cart' });
    }

    // Construir objeto de actualización con campos proporcionados
    const updateData = {};
    if (user !== undefined) updateData.user = user;
    if (products !== undefined) updateData.products = products;

    const updatedCart = await Cart.findByIdAndUpdate(id, updateData, { new: true }
    ).populate('user').populate('products.product');

    if (updatedCart) {
      return res.status(200).json(updatedCart);
    } else {
      return res.status(404).json({ message: 'Cart not found' });
    }
  } catch (err) {
    next(err);
  }
};

async function deleteCart(req, res, next) {
  try {
    const { id } = req.params;
    const deletedCart = await Cart.findByIdAndDelete(id);

    if (deletedCart) {
      return res.status(204).send();
    } else {
      return res.status(404).json({ message: 'Cart not found' });
    }
  } catch (err) {
    next(err);
  }
};

async function addProductToCart(req, res, next) {
  try {
    const { productId, quantity = 1, size } = req.body;
    const userId = req.user.userId;

    // 1. Intentar actualizar la cantidad si el producto y talla ya existen en el carrito
    let cart = await Cart.findOneAndUpdate(
      {
        user: userId,
        "products.product": productId,
        "products.size": size
      },
      { $inc: { "products.$.quantity": quantity } },
      { new: true }
    );

    // 2. Si no se encontró el producto/talla, agregarlo al array (o crear el carrito si no existe)
    if (!cart) {
      cart = await Cart.findOneAndUpdate(
        { user: userId },
        {
          $push: {
            products: { product: productId, quantity, size }
          }
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );
    }

    await cart.populate('user');
    await cart.populate('products.product');

    res.status(200).json({ message: "Product added to cart successfully", cart });
  } catch (err) {
    if (err.code === 11000) {
      // Si hubo una colisión en el upsert del carrito, reintentar una vez
      return addProductToCart(req, res, next);
    }
    next(err);
  }
};

async function updateCartItem(req, res, next) {
  try {
    const { productId, quantity, size, oldSize } = req.body;
    const userId = req.user.userId; // Seguridad: Usar ID del token

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const searchSize = (oldSize && oldSize !== null) ? oldSize : size;

    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId && item.size === searchSize
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    if (quantity !== undefined) cart.products[productIndex].quantity = quantity;
    if (size !== undefined) cart.products[productIndex].size = size;

    await cart.save();
    await cart.populate("user");
    await cart.populate("products.product");

    res.json({ message: "Cart item updated", cart });
  } catch (error) {
    next(error);
  }
};

async function removeCartItem(req, res, next) {
  try {
    const { productId } = req.params;
    const { size } = req.body;
    const userId = req.user.userId; // Seguridad: Usar ID del token

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.products = cart.products.filter(
      (item) => item.product.toString() !== productId || item.size !== size
    );

    await cart.save();
    await cart.populate("user");
    await cart.populate("products.product");

    res.json({ message: "Product removed from cart", cart });
  } catch (error) {
    next(error);
  }
};

async function clearCartItems(req, res, next) {
  try {
    const userId = req.user.userId; // Seguridad: Usar ID del token

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.products = [];

    await cart.save();
    await cart.populate("user");

    res.json({ message: "Cart cleared succesfully", cart });
  } catch (error) {
    next(error);
  }
};

async function mergeCart(req, res, next) {
  try {
    const { products } = req.body;
    const userId = req.user.userId;

    if (!products || !Array.isArray(products)) {
       return res.status(400).json({ message: "Products array is required for merging" });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, products: [] });
    }

    products.forEach(item => {
      const productIndex = cart.products.findIndex(
        p => p.product.toString() === item.productId && p.size === item.size
      );

      if (productIndex !== -1) {
        cart.products[productIndex].quantity += (item.quantity || 1);
      } else {
        cart.products.push({
          product: item.productId,
          quantity: item.quantity || 1,
          size: item.size
        });
      }
    });

    await cart.save();
    await cart.populate('user');
    await cart.populate('products.product');

    res.json({ message: "Cart merged successfully", cart });
  } catch (error) {
    next(error);
  }
};

export {
  getCarts,
  getCartById,
  getCartByUser,
  createCart,
  updateCart,
  deleteCart,
  addProductToCart,
  updateCartItem,
  removeCartItem,
  clearCartItems,
  mergeCart
};