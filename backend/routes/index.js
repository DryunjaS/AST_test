const Router = require("express");
const router = new Router();
const authMiddleware = require("../middleware/authMiddleware");

const authRouter = require("./authRouter.js");
const userRouter = require("./userRouter.js");
const testsRouter = require("./testsRouter.js");

router.use("/auth", authRouter);
router.use("/user", authMiddleware, userRouter);
router.use("/tests", authMiddleware, testsRouter);

module.exports = router;
