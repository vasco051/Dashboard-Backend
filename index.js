import express from 'express'
import cors from 'cors'
import cookieParses from 'cookie-parser'
import dotenv from 'dotenv'

import {db} from "./db.js";

import {router as userRouter} from "./routes/user.routes.js";
import {router as authRouter} from "./routes/auth.routes.js";
import {router as projectRouter} from "./routes/project.routes.js";
import {router as tasksRouter} from "./routes/task.routes.js";

const app = express()
dotenv.config()

app.use(express.json())
app.use(cookieParses())
app.use(cors())

app.use('/api', authRouter)
app.use('/api', userRouter)
app.use('/api', projectRouter)
app.use('/api', tasksRouter)

const startApp = async () => {
	try {
		await db.connect()
		app.listen(process.env.PORT, () => {
			console.log('Server started on port:', process.env.PORT)
		})
	} catch (e) {
		console.log(e)
	}
}

startApp()