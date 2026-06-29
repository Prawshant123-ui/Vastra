
const prisma = require("../config/prisma");


const getAllUsers = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim()  || "";
    const role   = req.query.role            || null;
    const skip   = (page - 1) * limit;

    const where = {
      isDeleted: false,
      ...(role && { role }),
      ...(search && {
        OR: [
          { name:  { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id:              true,
          name:            true,
          email:           true,
          phone:           true,
          role:            true,
          isEmailVerified: true,
          avatar:          true,
          createdAt:       true,
          _count: {
            select: { orders: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("getAllUsers:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};


const getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const user = await prisma.user.findFirst({
      where: { id, isDeleted: false },
      select: {
        id:              true,
        name:            true,
        email:           true,
        phone:           true,
        role:            true,
        isEmailVerified: true,
        avatar:          true,
        createdAt:       true,
        addresses:       true,
        orders: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id:          true,
            orderNumber: true,
            total:       true,
            status:      true,
            createdAt:   true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(" getUserById:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};


const updateUserRole = async (req, res) => {
  try {
    const id   = parseInt(req.params.id);
    const { role } = req.body;

    if (!["USER", "ADMIN"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

   
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: "Cannot change your own role" });
    }

    const user = await prisma.user.update({
      where: { id },
      data:  { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return res.status(200).json({ success: true, data: user, message: "Role updated" });
  } catch (error) {
    console.error(" updateUserRole:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};


const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: "Cannot delete your own account" });
    }

    await prisma.user.update({
      where: { id },
      data:  { isDeleted: true },
    });

    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error(" deleteUser:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllUsers, getUserById, updateUserRole, deleteUser };