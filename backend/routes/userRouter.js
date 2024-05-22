const Router = require("express");
const router = new Router();
const userController = require("../controllers/userController");
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware");

router.get("/get-users", checkRoleMiddleware("admin"), userController.getUsers);
router.delete(
  "/delete-user",
  checkRoleMiddleware("admin"),
  userController.deleteUser
);

module.exports = router;
