const prisma = require("../config/prisma");

const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const addresses = await prisma.address.findMany({ where: { userId } });

    return res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { label, street, city, state, country, postalCode, isDefault } = req.body;

    if (!street || !city || !state || !country || !postalCode) {
      return res.status(400).json({ success: false, message: "All address fields are required" });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        label: label || "home",
        street,
        city,
        state,
        country,
        postalCode,
        isDefault: isDefault || false,
      },
    });

    return res.status(201).json({ success: true, message: "Address added", data: address });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);
    const { label, street, city, state, country, postalCode, isDefault } = req.body;

    const address = await prisma.address.findFirst({ where: { id, userId } });
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: { label, street, city, state, country, postalCode, isDefault: isDefault || false },
    });

    return res.status(200).json({ success: true, message: "Address updated", data: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);

    const address = await prisma.address.findFirst({ where: { id, userId } });
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    await prisma.address.delete({ where: { id } });

    return res.status(200).json({ success: true, message: "Address deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress };