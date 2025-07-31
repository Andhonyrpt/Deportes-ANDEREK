import Order from '../models/order.js';

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
}

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
}

async function getOrdersByUser(req, res, next) {
  try {
    const userId = req.params.userId;
    const orders = await Order.find({ user: userId })
      .populate('user')
      .populate('products.productId')
      .populate('shippingAddress')
      .populate('paymentMethod')
      .sort({ status: 1 });

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

async function createOrder(req, res, next) {
  try {
    const {
      user,
      products,
      shippingAddress,
      paymentMethod,
      shippingCost = 0
    } = req.body;

    // Validaciones básicas
    if (!user || !products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'User and products array are required' });
    }
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ error: 'Shipping address and payment method are required' });
    }

    // Validar estructura de productos
    for (const item of products) {
      if (!item.productId || !item.quantity || !item.price || item.quantity < 1) {
        return res.status(400).json({
          error: 'Each product must have productId, quantity >= 1, and price'
        });
      }
    }

    // Calcular precio total
    const subtotal = products.reduce((total, item) => total + (item.price * item.quantity), 0);
    const totalPrice = subtotal + shippingCost;

    const newOrder = await Order.create({
      user,
      products,
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
  } catch (err) {
    next(err);
  }
}

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
}

async function cancelOrder(req, res, next) {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Solo permitir cancelar si el estado lo permite
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        message: 'Cannot cancel order with status: ' + order.status
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

    res.status(200).json(updatedOrder);
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Valid statuses: ' + validStatuses.join(', ')
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
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
}

async function updatePaymentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        error: 'Invalid payment status. Valid statuses: ' + validPaymentStatuses.join(', ')
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { paymentStatus },
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
}

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
}

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
