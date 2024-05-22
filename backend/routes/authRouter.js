const Router = require("express");
const router = new Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware");

router.post("/registration", authController.registration);
router.post("/login", authController.login);
router.get("/auth", authMiddleware, authController.check);
router.post(
  "/change-password",
  authMiddleware,
  checkRoleMiddleware("admin"),
  authController.changePasswordUser
);
module.exports = router;
