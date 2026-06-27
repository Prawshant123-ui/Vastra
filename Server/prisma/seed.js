require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const seedAdmin = async () => {
    try {
        const adminExists = await prisma.user.findUnique({
            where: {
                email: process.env.ADMIN_EMAIL,
            },
        });

        if (adminExists) {
            console.log("✅ Admin already exists.");
            return;
        }

        const hashedPassword = await bcrypt.hash(
            process.env.ADMIN_PASSWORD,
            12
        );

        await prisma.user.create({
            data: {
                name: process.env.ADMIN_NAME,
                email: process.env.ADMIN_EMAIL,
                phone: process.env.ADMIN_PHONE,
                password: hashedPassword,
                role: "ADMIN",
                isVerified: true,
            },
        });

        console.log(" Admin created successfully.");
    } catch (error) {
        console.error(" Error seeding admin:", error.message);
    } finally {
        await prisma.$disconnect();
    }
};

seedAdmin();

