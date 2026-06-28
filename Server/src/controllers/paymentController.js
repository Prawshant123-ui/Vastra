const prisma = require("../config/prisma");
const axios = require("axios");

const KHALTI_BASE_URL = "https://dev.khalti.com/api/v2";

const initiatePayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const order = await prisma.order.findFirst({
      where: { id: Number(orderId), userId },
      include: { user: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status === "CANCELLED") {
      return res.status(400).json({ success: false, message: "Cannot pay for a cancelled order" });
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { orderId: order.id },
    });

    if (existingPayment && existingPayment.status === "PAID") {
      return res.status(400).json({ success: false, message: "Order is already paid" });
    }

    const amountInPaisa = Math.round(Number(order.total) * 100);

    const khaltiResponse = await axios.post(
      `${KHALTI_BASE_URL}/epayment/initiate/`,
      {
        return_url: `${process.env.CLIENT_URL}/payment/verify`,
        website_url: process.env.CLIENT_URL || "http://localhost:3000",
        amount: amountInPaisa,
        purchase_order_id: order.orderNumber,
        purchase_order_name: `Order ${order.orderNumber}`,
        customer_info: {
          name: order.user.name,
          email: order.user.email,
          phone: order.user.phone,
        },
      },
      {
        headers: {
          Authorization: `key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { pidx, payment_url } = khaltiResponse.data;

    await prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        amount: order.total,
        method: "khalti",
        status: "PENDING",
        transactionId: pidx,
      },
      update: {
        status: "PENDING",
        transactionId: pidx,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Payment initiated",
      data: {
        pidx,
        payment_url,
        amount: amountInPaisa,
        orderId: order.id,
      },
    });
  } catch (error) {
    console.error("Khalti initiate error:", error.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Failed to initiate payment" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { pidx } = req.query;

    if (!pidx) {
      return res.status(400).json({ success: false, message: "pidx is required" });
    }

    const khaltiResponse = await axios.post(
      `${KHALTI_BASE_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { status, transaction_id, total_amount } = khaltiResponse.data;

    const payment = await prisma.payment.findFirst({
      where: { transactionId: pidx },
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment record not found" });
    }

    if (status === "Completed") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });

      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "CONFIRMED" },
      });

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: {
          status: "PAID",
          transactionId: transaction_id,
          amount: total_amount,
        },
      });
    }

    if (["Cancelled", "Expired", "Failed", "User canceled"].includes(status)) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });

      return res.status(400).json({
        success: false,
        message: `Payment ${status.toLowerCase()}`,
        data: { status },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment is still pending",
      data: { status },
    });
  } catch (error) {
    console.error("Khalti verify error:", error.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Failed to verify payment" });
  }
};

const getPaymentByOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = Number(req.params.orderId);

    const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const payment = await prisma.payment.findUnique({ where: { orderId } });
    if (!payment) {
      return res.status(404).json({ success: false, message: "No payment found for this order" });
    }

    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = { initiatePayment, verifyPayment, getPaymentByOrder };