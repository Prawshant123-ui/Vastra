const prisma = require("../config/prisma");

const getAnalytics = async (req, res) => {
  try {

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueResult,
      ordersByStatus,
      recentOrders,
      topProducts,
      monthlyRevenue,
    ] = await Promise.all([

      prisma.user.count({
        where: { isDeleted: false, role: "USER" },
      }),

      prisma.product.count({
        where: { isDeleted: false, isActive: true },
      }),

      prisma.order.count(),

      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),

      prisma.order.groupBy({
        by: ["status"],
        _count: { status: true },
      }),

      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      }),

      prisma.orderItem.groupBy({
        by: ["productId", "productName"],
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),

      prisma.$queryRaw`
        SELECT
          TO_CHAR("createdAt", 'Mon') AS month,
          EXTRACT(MONTH FROM "createdAt") AS month_num,
          EXTRACT(YEAR FROM "createdAt") AS year,
          SUM(amount) AS revenue
        FROM "Payment"
        WHERE status = 'PAID'
          AND "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY month, month_num, year
        ORDER BY year ASC, month_num ASC
      `,
    ]);

    const orderStatusMap = {};
    for (const item of ordersByStatus) {
      orderStatusMap[item.status] = item._count.status;
    }

    const formattedMonthlyRevenue = monthlyRevenue.map((row) => ({
      month: row.month,
      revenue: Number(row.revenue),
    }));

    return res.status(200).json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          products: totalProducts,
          orders: totalOrders,
          revenue: Number(revenueResult._sum.amount) || 0,
        },
        ordersByStatus: orderStatusMap,
        recentOrders,
        topProducts: topProducts.map((p) => ({
          productId: p.productId,
          productName: p.productName,
          totalSold: p._sum.quantity,
          totalRevenue: Number(p._sum.subtotal),
        })),
        revenueByMonth: formattedMonthlyRevenue,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = { getAnalytics };