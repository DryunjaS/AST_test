import { $authApi } from "../http"

export default class TestService {
	static async getTestsEvents() {
		return $authApi.get("api/tests/get-tests")
	}
	static async getTestEvent(id) {
		return $authApi.get(`api/tests/get-test?id=${id}`)
	}

	static async geleteTestEvent(id) {
		return $authApi.delete(`api/tests/delete-test?id=${id}`)
	}
	static async geleteQuestionEvent(id) {
		return $authApi.delete(`api/tests/delete-question?id=${id}`)
	}

	static async addTestEvent(title, time) {
		return $authApi.post("api/tests/add-test", { title, time })
	}
	static async addQuesEvent(id, questions) {
		return $authApi.post("api/tests/add-questions", { id, questions })
	}
	static async addImagesEvent(images) {
		return await $authApi.post("api/tests/add-images", images)
	}
	static async createStoreEvent(idTest) {
		return $authApi.post("api/tests/create-store", { idTest })
	}
	static async getStoreEvent(idTest) {
		return $authApi.get(`api/tests/get-store?idTest=${idTest}`)
	}
	static async updateStoreEvent(idTest, buffer) {
		return $authApi.put("api/tests/update-store", { idTest, buffer })
	}
	static async resultEvent(idTest) {
		return $authApi.get(`api/tests/get-test-result?idTest=${idTest}`)
	}
	static async resultsEvent(idUser) {
		return $authApi.get(`api/tests/get-user-store?idUser=${idUser}`)
	}
	static async getAdminStoreEvent(idTest) {
		return $authApi.get(`api/tests/get-admin-stores?id=${idTest}`)
	}
	static async deleteStoreItemById(id) {
		return $authApi.delete(`api/tests/delete-user-store?id=${id}`)
	}
	static async finishTestEvent(idTest) {
		return $authApi.post(`api/tests/finish-test`, { idTest })
	}
	static async getOnlineStoreEvent() {
		return $authApi.get(`api/tests/get-online-store`)
	}
	static async getStoreUserEvent() {
		return $authApi.get(`api/tests/get-user-store`)
	}
}
