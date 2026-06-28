const { body } = require("express-validator");

const createProductValidator = [

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Product name is required")
        .isLength({ min: 3, max: 150 }),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required")
        .isLength({ min: 20 }),

    body("price")
        .isFloat({ gt: 0 })
        .withMessage("Price must be greater than 0"),

    body("discountPrice")
        .optional()
        .isFloat({ gt: 0 }),

    body("stock")
        .isInt({ min: 0 })
        .withMessage("Stock cannot be negative"),

    body("categoryId")
        .isInt()
        .withMessage("Category is required"),

    body("brand")
        .optional()
        .trim()
        .isLength({ max: 100 }),

    body("weight")
        .optional()
        .isFloat({ gt: 0 })

];

module.exports={createProductValidator}