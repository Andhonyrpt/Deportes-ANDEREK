import Order from '../models/order.js';
import Product from '../models/product.js';

async function getOrders(req, res, next) {
  try {
    const orders = await Order.find()
      .populate('user')
      .populate('products.productId')
      .populate('shippingAddress')
      .populate('paymentMethod')
      .sort({ status: 1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('user')
      .populate('products.productId')
      .populate('shippingAddress')
      .populate('paymentMethod');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
};

async function getOrdersByUser(req, res, next) {
  try {
    const userId = req.params.userId;
    const orders = await Order.find({ user: userId })
      .populate('user')
      .populate('products.productId')
      .populate('shippingAddress')
      .populate('paymentMethod')
      .sort({ status: 1 });

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

async function createOrder(req, res, next) {
  try {
    const {
      user,
      products,
      shippingAddress,
      paymentMethod,
      shippingCost = 0
    } = req.body;

    const stockChecks = await Promise.all(products.map(async (item) => {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const variant = product.variants.find((v) => v.size === item.size);

      if (!variant || variant.stock < item.quantity) {
        return {
          productId: item.productId,
          productName: product.name,
          size: item.size,
          error: `Insufficient stock for size ${item.size}`,
          available: variant ? variant.stock : 0,
          requested: item.quantity,
        };
      }
      return { productId: item.productId, product, size: item.size, ok: true };
    }));

    // Verificar si hubo algún error de stock
    const errors = stockChecks.filter((check) => check.error);
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Cannot create order due to stock issues",
        errors: errors.map((e) => ({
          productId: e.productId,
          productName: e.productName,
          message: e.error,
          available: e.available,
          requested: e.requested,
          size: e.size
        })),
      });
    }

    // Reducir stock de cada producto de forma atómica
    const stockUpdates = await Promise.all(
      stockChecks.map(async (check, index) => {
        const item = products[index];
        return Product.findOneAndUpdate(
          { _id: check.productId, "variants.size": item.size },
          { $inc: { "variants.$.stock": -item.quantity } },
          { new: true }
        );
      })
    );

    // Verificar que todas las actualizaciones fueron exitosas
    if (stockUpdates.some((update) => !update)) {
      // Si alguna actualización falló, revertir cambios
      await Promise.all(
        stockChecks.map(async (check, index) => {
          if (stockUpdates[index]) {
            const item = products.find(
              (p) => p.productId.toString() === check.productId.toString()
            );
            return Product.findOneAndUpdate(
              { _id: check.productId, "variants.size": item.size },
              { $inc: { "variants.$.stock": item.quantity } }
            );
          }
        })
      );
      return res.status(500).json({
        message: "Failed to update product stock. Order was not created.",
      });
    }

    const normalizedProducts = stockChecks.map((check, index) => ({
      productId: check.product._id,
      quantity: products[index].quantity,
      size: products[index].size,
      price: check.product.price,
    }));

    // Calcular precio total con precios del servidor
    const subtotal = normalizedProducts.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const totalPrice = subtotal + shippingCost;


    const newOrder = await Order.create({
      user,
      products: normalizedProducts,
      shippingAddress,
      paymentMethod,
      shippingCost,
      totalPrice,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await newOrder.populate('user');
    await newOrder.populate('products.productId');
    await newOrder.populate('shippingAddress');
    await newOrder.populate('paymentMethod');

    res.status(201).json(newOrder);
  }
  catch (err) {
    next(err);
  }
};

async function updateOrder(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Solo permitir actualizar ciertos campos
    const allowedFields = ['status', 'paymentStatus', 'shippingCost'];
    const filteredUpdate = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredUpdate[field] = updateData[field];
      }
    }

    // Validar que al menos un campo sea proporcionado
    if (Object.keys(filteredUpdate).length === 0) {
      return res.status(400).json({
        message: "At least one field must be provided for update",
      });
    }

    // Si se actualiza shippingCost, recalcular totalPrice
    if (filteredUpdate.shippingCost !== undefined) {
      const order = await Order.findById(id);
      if (order) {
        const subtotal = order.products.reduce((total, item) => total + (item.price * item.quantity), 0);
        filteredUpdate.totalPrice = subtotal + filteredUpdate.shippingCost;
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      filteredUpdate,
      { new: true }
    )
      .populate('user')
      .populate('products.productId')
      .populate('shippingAddress')
      .populate('paymentMethod');

    if (updatedOrder) {
      return res.status(200).json(updatedOrder);
    } else {
      return res.status(404).json({ message: 'Order not found' });
    }
  } catch (err) {
    next(err);
  }
};

async function cancelOrder(req, res, next) {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate("products.productId");

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Solo permitir cancelar si el estado lo permite
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        message: 'Cannot cancel order with status: ' + order.status
      });
    }

    // Restaurar el stock de los productos
    const stockRestorations = await Promise.all(
      order.products.map(async (item) => {
        return Product.findOneAndUpdate(
          { _id: item.productId._id, "variants.size": item.size },
          { $inc: { "variants.$.stock": item.quantity } },
          { new: true }
        );
      })
    );

    // Verificar que todas las restauraciones fueron exitosas
    if (stockRestorations.some((update) => !update)) {
      return res.status(500).json({
        message: "Failed to restore product stock. Order status not changed.",
      });
    }


    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        paymentStatus: order.paymentStatus === 'paid' ? 'refunded' : 'failed'
      },
      { new: true }
    )
      .populate('user')
      .populate('products.productId')
      .populate('shippingAddress')
      .populate('paymentMethod');

    res.status(200).json({ message: "Order cancelled successfully. Stock has been restored.", updatedOrder });
  } catch (err) {
    next(err);
  }
};

async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true })
      .populate("user")
      .populate("products.productId")
      .populate("shippingAddress")
      .populate("paymentMethod");

    if (updatedOrder) {
      return res.status(200).json(updatedOrder);
    } else {
      return res.status(404).json({ message: 'Order not found' });
    }
  } catch (err) {
    next(err);
  }
};

async function updatePaymentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(id, { paymentStatus }, { new: true })
      .populate("user")
      .populate("products.productId")
      .populate("shippingAddress")
      .populate("paymentMethod");

    if (updatedOrder) {
      return res.status(200).json(updatedOrder);
    } else {
      return res.status(404).json({ message: 'Order not found' });
    }
  } catch (err) {
    next(err);
  }
};

async function deleteOrder(req, res, next) {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Solo permitir eliminar órdenes canceladas
    if (order.status !== 'cancelled') {
      return res.status(400).json({
        message: 'Only cancelled orders can be deleted'
      });
    }

    await Order.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export {
  getOrders,
  getOrderById,
  getOrdersByUser,
  createOrder,
  updateOrder,
  cancelOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder
};
