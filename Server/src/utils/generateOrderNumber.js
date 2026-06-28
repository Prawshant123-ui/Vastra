const crypto = require("crypto");

const generateOrderNumber = () => {
  return "ORD-" + crypto.randomBytes(4).toString("hex").toUpperCase();
};


module.exports = generateOrderNumber;