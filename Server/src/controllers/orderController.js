const prisma = require("../config/prisma");
const generateOrderNumber = require("../utils/generateOrderNumber");

const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddressId, notes } = req.body;

    if (!shippingAddressId) {
      return res.status(400).json({ success: false, message: "Shipping address is required" });
    }

    const address = await prisma.address.findFirst({
      where: { id: Number(shippingAddressId), userId },
    });

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty" });
    }

    for (const item of cart.items) {
      if (!item.product.isActive || item.product.isDeleted) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.product.name}" is no longer available`,
        });
      }
      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for "${item.product.name}". Only ${item.product.stock} left.`,
        });
      }
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.product.discountPrice ?? item.product.price;
      return sum + Number(price) * item.quantity;
    }, 0);

    const shippingFee = subtotal >= 50 ? 0 : 5;
    const total = subtotal + shippingFee;

    const shippingAddress = {
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
    };

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        subtotal,
        shippingFee,
        discount: 0,
        total,
        shippingAddress,
        notes: notes || null,
        status: "PENDING",
        items: {
          create: cart.items.map((item) => {
            const price = item.product.discountPrice ?? item.product.price;
            return {
              productId: item.product.id,
              productName: item.product.name,
              price: Number(price),
              quantity: item.quantity,
              subtotal: Number(price) * item.quantity,
            };
          }),
        },
      },
      include: { items: true },
    });

    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.product.id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: { images: { take: 1, select: { imageUrl: true } } },
            },
          },
        },
        payment: { select: { status: true, method: true } },
      },
    });

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);

    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            product: {
              select: { images: { take: 1, select: { imageUrl: true } } },
            },
          },
        },
        payment: true,
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);

    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled. Current status: ${order.status}`,
      });
    }

    await prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    return res.status(200).json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: true,
          payment: { select: { status: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: orders,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const validStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return res.status(200).json({ success: true, message: "Order status updated", data: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus };