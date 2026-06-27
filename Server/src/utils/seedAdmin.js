const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

const seedAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);

    
    await prisma.user.upsert({
      where: { email: process.env.ADMIN_EMAIL },
      update: {
        role: "ADMIN",
        isEmailVerified: true,
      },
      create: {
        name:            process.env.ADMIN_NAME || "Admin",
        email:           process.env.ADMIN_EMAIL,
        password:        hashedPassword,
        phone:           process.env.ADMIN_PHONE || "0000000000",
        role:            "ADMIN",
        isEmailVerified: true, 
      },
    });

    console.log("Admin seeded successfully.");
  } catch (error) {
    console.error("Admin seed failed:", error.message);
  }
};

module.exports = seedAdmin;