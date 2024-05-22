import RoomTest from "./components/Room/RoomTest"
import RoomUserTests from "./components/Room/RoomUserTests"

import LoginForm from "./page/LoginForm"
import Preview from "./page/Preview"
import Result from "./page/Result"
import Room from "./page/Room"
import Test from "./page/Test"

export const publicRoutes = [
	{
		path: "/",
		Component: LoginForm,
	},
]
export const authRoutes = [
	{
		path: "/preview",
		Component: Preview,
	},
	{
		path: "/test/:testID",
		Component: Test,
	},
	{
		path: "/result/:testID",
		Component: Result,
	},
	{
		path: "/room",
		Component: Room,
	},
	{
		path: "/room/test/:id",
		Component: RoomTest,
	},
	{
		path: "/room/user/:id",
		Component: RoomUserTests,
	},
]
