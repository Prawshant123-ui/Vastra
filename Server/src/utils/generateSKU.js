const crypto = require("crypto");

const generateSKU = () => {

    return "SKU-" + crypto.randomBytes(4).toString("hex").toUpperCase();

};

module.exports = generateSKU;