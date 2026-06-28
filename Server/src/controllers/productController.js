const prisma = require("../config/prisma");
const generateSlug = require("../utils/generateSlug");
const generateSKU = require("../utils/generateSKU");
const { uploadImage } = require("../services/cloudinaryService");

const createProduct = async (req, res) => {
  try {
    const { name, description, price, discountPrice, stock, categoryId, brand, weight, isFeatured } = req.body;

    const slug = generateSlug(name);

    const existingProduct = await prisma.product.findUnique({ where: { slug } });
    if (existingProduct) {
      return res.status(400).json({ success: false, message: "A product with this name already exists" });
    }

    const category = await prisma.category.findFirst({ where: { id: Number(categoryId), isDeleted: false } });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const sku = generateSKU();

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        stock: parseInt(stock),
        categoryId: Number(categoryId),
        brand: brand || null,
        weight: weight ? parseFloat(weight) : null,
        sku,
        isFeatured: isFeatured === "true" || isFeatured === true,
      },
    });

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadImage(file.buffer, "products")
      );
      const uploadedImages = await Promise.all(uploadPromises);

      await prisma.productImage.createMany({
        data: uploadedImages.map((img) => ({
          imageUrl: img.secure_url,
          publicId: img.public_id,
          productId: product.id,
        })),
      });
    }

    const productWithImages = await prisma.product.findUnique({
      where: { id: product.id },
      include: { images: true, category: true },
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: productWithImages,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, minPrice, maxPrice, sort = "createdAt", order = "desc" } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where = { isDeleted: false, isActive: true };

    if (category) {
      where.categoryId = Number(category);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const allowedSortFields = ["createdAt", "price", "name", "stock"];
    const sortField = allowedSortFields.includes(sort) ? sort : "createdAt";
    const sortOrder = order === "asc" ? "asc" : "desc";

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortField]: sortOrder },
        include: { images: true, category: { select: { id: true, name: true, slug: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getProductById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const product = await prisma.product.findFirst({
      where: { id, isDeleted: false },
      include: { images: true, category: { select: { id: true, name: true, slug: true } } },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findFirst({
      where: { slug, isDeleted: false },
      include: { images: true, category: { select: { id: true, name: true, slug: true } } },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description, price, discountPrice, stock, categoryId, brand, weight, isFeatured, isActive } = req.body;

    const product = await prisma.product.findFirst({ where: { id, isDeleted: false } });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const updateData = {};

    if (name && name !== product.name) {
      const newSlug = generateSlug(name);
      const duplicate = await prisma.product.findFirst({ where: { slug: newSlug, NOT: { id } } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: "A product with this name already exists" });
      }
      updateData.name = name;
      updateData.slug = newSlug;
    }

    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice ? parseFloat(discountPrice) : null;
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (brand !== undefined) updateData.brand = brand || null;
    if (weight !== undefined) updateData.weight = weight ? parseFloat(weight) : null;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured === "true" || isFeatured === true;
    if (isActive !== undefined) updateData.isActive = isActive === "true" || isActive === true;

    if (categoryId !== undefined) {
      const category = await prisma.category.findFirst({ where: { id: Number(categoryId), isDeleted: false } });
      if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" });
      }
      updateData.categoryId = Number(categoryId);
    }

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => uploadImage(file.buffer, "products"));
      const uploadedImages = await Promise.all(uploadPromises);

      await prisma.productImage.createMany({
        data: uploadedImages.map((img) => ({
          imageUrl: img.secure_url,
          publicId: img.public_id,
          productId: id,
        })),
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { images: true, category: { select: { id: true, name: true, slug: true } } },
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const product = await prisma.product.findFirst({ where: { id, isDeleted: false } });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await prisma.product.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    });

    return res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const deleteProductImage = async (req, res) => {
  try {
    const imageId = Number(req.params.imageId);
    const productId = Number(req.params.id);

    const image = await prisma.productImage.findFirst({ where: { id: imageId, productId } });
    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    await prisma.productImage.delete({ where: { id: imageId } });

    return res.status(200).json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  deleteProductImage,
};
