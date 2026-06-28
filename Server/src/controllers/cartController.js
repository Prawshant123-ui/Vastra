const prisma = require("../config/prisma");

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                discountPrice: true,
                stock: true,
                isActive: true,
                images: {
                  take: 1,
                  select: { imageUrl: true },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: { items: [], total: 0 },
      });
    }

    const total = cart.items.reduce((sum, item) => {
      const price = item.product.discountPrice ?? item.product.price;
      return sum + Number(price) * item.quantity;
    }, 0);

    return res.status(200).json({
      success: true,
      data: { ...cart, total },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const qty = parseInt(quantity);
    if (qty < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const product = await prisma.product.findFirst({
      where: { id: Number(productId), isDeleted: false, isActive: true },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: Number(productId) } },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + qty;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available. You already have ${existingItem.quantity} in your cart.`,
        });
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      if (qty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available`,
        });
      }

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: Number(productId),
          quantity: qty,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Item added to cart",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = Number(req.params.itemId);
    const { quantity } = req.body;

    const qty = parseInt(quantity);
    if (!qty || qty < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId: cart.id },
      include: { product: true },
    });

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    if (qty > cartItem.product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${cartItem.product.stock} units available`,
      });
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: qty },
    });

    return res.status(200).json({ success: true, message: "Cart updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = Number(req.params.itemId);

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId: cart.id },
    });

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    await prisma.cartItem.delete({ where: { id: cartItemId } });

    return res.status(200).json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return res.status(200).json({ success: true, message: "Cart cleared" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };