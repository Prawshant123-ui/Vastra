const prisma = require("../config/prisma");

const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await prisma.wishlist.findUnique({
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
                isActive: true,
                images: { take: 1, select: { imageUrl: true } },
              },
            },
          },
        },
      },
    });

    if (!wishlist) {
      return res.status(200).json({ success: true, data: { items: [] } });
    }

    return res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const product = await prisma.product.findFirst({
      where: { id: Number(productId), isDeleted: false, isActive: true },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({ data: { userId } });
    }

    const alreadyExists = await prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId: Number(productId) } },
    });

    if (alreadyExists) {
      return res.status(400).json({ success: false, message: "Product already in wishlist" });
    }

    await prisma.wishlistItem.create({
      data: { wishlistId: wishlist.id, productId: Number(productId) },
    });

    return res.status(200).json({ success: true, message: "Product added to wishlist" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = Number(req.params.productId);

    const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    const item = await prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    });

    if (!item) {
      return res.status(404).json({ success: false, message: "Product not in wishlist" });
    }

    await prisma.wishlistItem.delete({ where: { id: item.id } });

    return res.status(200).json({ success: true, message: "Product removed from wishlist" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };