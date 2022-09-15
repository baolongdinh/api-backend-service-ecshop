const router = require("express").Router();

const productRouter = require("./productRouter")
const orderRouter = require("./ordersRouter")
const cartRouter = require("./cartRouter")


router.use('/products', productRouter);
router.use('/orders', orderRouter);
router.use('/cart', cartRouter);


module.exports = router;
