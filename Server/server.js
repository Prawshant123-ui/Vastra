require("dotenv").config();

const app      = require("./app");
const prisma   = require("./src/config/prisma");
const seedAdmin = require("./src/utils/seedAdmin");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log(" PostgreSQL connected via Prisma");

    await seedAdmin();

    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(" Failed to start server:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  console.log("\n Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n SIGTERM received. Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();