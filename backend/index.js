const express = require("express")
const http = require("http")
const app = express()
const cors = require("cors")
const router = require("./routes")
const path = require("path")
require("dotenv").config()

const server = http.createServer(app)
const socketIo = require("socket.io")
const io = socketIo(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
})

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

const PORT = process.env.PORT || 5000
const SERVER_IP = process.env.SERVER_IP || "localhost"

server.listen(PORT, SERVER_IP, () =>
	console.log(`Server started ${SERVER_IP} on port ${PORT}`)
)
