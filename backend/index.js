const express = require("express")
const http = require("http")
const app = express()
const cors = require("cors")
const router = require("./routes")
const path = require("path")
require("dotenv").config()
const multer = require("multer")
const fs = require("fs")

const server = http.createServer(app)
const socketIo = require("socket.io")
const io = socketIo(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
})
// Указываем директорию для сохранения загруженных файлов
const uploadDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir)
}

// Настройка Multer для сохранения файлов в указанную директорию
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadDir)
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname))
	},
})

// Используем upload.array() для загрузки нескольких файлов
const upload = multer({ storage: storage })

app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
	req.io = io
	return next()
})

app.use("/api", router)

app.use(express.static(path.resolve(__dirname, "./dist")))

app.get("/", function (req, res) {
	res.sendFile(path.resolve(__dirname, "./dist", "index.html"))
})

// Обновленный маршрут для загрузки нескольких файлов
app.post("/api/tests/add-images", upload.array("files"), (req, res) => {
	const files = req.files
	console.log(files)
	if (!files || files.length === 0) {
		return res.status(400).send("No files uploaded.")
	}

	res.send("Files uploaded successfully.")
})

const PORT = process.env.PORT || 5000
const SERVER_IP = process.env.SERVER_IP || "localhost"

server.listen(PORT, SERVER_IP, () =>
	console.log(`Server started ${SERVER_IP} on port ${PORT}`)
)
