import jwt from 'jsonwebtoken'

import {createErrors} from "../utils/createErrors.js";

export const authMiddleware = (req, res, next) => {
	if (req.method === 'OPTIONS') next()

	try {
		const token = req.headers.authorization?.split(' ')[1]

		if (!token) return res.status(401).json(createErrors('Пользователь не авторизован'))

		req.user = jwt.verify(token, process.env.SECRET)
		next()
	} catch (e) {
		console.log(e)
		return res.status(401).json(createErrors('Пользователь не авторизован'))
	}
}