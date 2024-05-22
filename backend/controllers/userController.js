const ApiError = require("../error/ApiError.js");
const UserService = require("../services/UserService.js");

class UserController {
  async getUsers(req, res, next) {
    try {
      const users = await UserService.getUsers();
      res.json(users);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async deleteUser(req, res, next) {
    const { id } = req.query;
    try {
      await UserService.deleteUser(id);
      res.json({ message: "Пользователь удален!" });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new UserController();
