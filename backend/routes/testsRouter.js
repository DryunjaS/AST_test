const Router = require("express")
const router = new Router()
const checkRoleMiddleware = require("../middleware/checkRoleMiddleware")
const testsController = require("../controllers/testsController")

router.get("/get-tests", testsController.getTests)
router.get("/get-test", testsController.getTest)
router.post("/add-test", checkRoleMiddleware("admin"), testsController.addTest)
router.post(
	"/add-questions",
	checkRoleMiddleware("admin"),
	testsController.addQuestions
)
router.delete(
	"/delete-test",
	checkRoleMiddleware("admin"),
	testsController.deleteTest
)
router.delete(
	"/delete-question",
	checkRoleMiddleware("admin"),
	testsController.deleteQuestion
)
router.post("/create-store", testsController.createStore)
router.get("/get-store", testsController.getStore)
router.get("/get-stores", testsController.getStores)
router.get(
	"/get-admin-stores",
	checkRoleMiddleware("admin"),
	testsController.getAdminStores
)
router.put("/update-store", testsController.updateStore)
router.post("/finish-test", testsController.finishTest)
router.get("/get-test-result", testsController.getResult)
router.get("/download-result/:idTest", testsController.downloadResult)
router.get(
	"/get-user-store",
	checkRoleMiddleware("admin"),
	testsController.getResults
)
router.delete(
	"/delete-user-store",
	checkRoleMiddleware("admin"),
	testsController.deleteStoreItemById
)
router.get(
	"/get-online-store",
	checkRoleMiddleware("admin"),
	testsController.getOnlineStore
)

module.exports = router
