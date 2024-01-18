import bcryptjs from 'bcryptjs'
import {validationResult} from 'express-validator'

import {db} from "../db.js";

import {generateAccessToken} from "../utils/generateAccessToken.js";
import {getDateNow} from "../utils/getDateNow.js";
import {createErrors, errorFormatter} from "../utils/createErrors.js";

class AuthController {
	async registration(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) return res.status(400).json(errorFormatter(errors))

			const {username, password} = req.body

			const candidate = await db.query(`
          SELECT id, username, created_at, updated_at
          FROM public."user"
          where username = $1
			`, [username])

			if (candidate.rows[0]) {
				return res.status(400).json(createErrors('', {
					username: 'Пользователь c таким именем уже существует'
				}))
			}

			const hashPassword = bcryptjs.hashSync(password, 7)
			const dateNow = getDateNow()

			let user = await db.query(`
          INSERT INTO public."user" (username, password, updated_at, created_at)
          values ($1, $2, $3, $4) RETURNING id, username, created_at, updated_at
			`, [username, hashPassword, dateNow, dateNow])

			user = user.rows[0]

			const token = generateAccessToken(user.id)

			res.status(200).json({token, user})
		} catch (e) {
			console.log(e)
			res.status(500).json(e)
		}
	}

	async login(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) return res.status(400).json(errorFormatter(errors))

			const {username, password} = req.body

			let user = await db.query(`
          SELECT id, username, created_at, updated_at, password
          FROM public."user"
          where username = $1
			`, [username])

			user = user.rows[0]

			if (!user) {
				return res.status(400).json(createErrors('', {
					username: `Пользователь ${username} не найден`
				}))
			}

			const validPassword = bcryptjs.compareSync(password, user.password)

			if (!validPassword) {
				return res.status(400).json(createErrors('', {
					password: 'Введен неверный пароль'
				}))
			}

			delete user.password
			const token = generateAccessToken(user.id)

			return res.status(200).json({token, user})
		} catch (e) {
			console.log(e)
			res.status(500).json(e)
		}
	}

	async auth(req, res) {
		try {
			const {id: userId} = req.user

			let user = await db.query(`
          SELECT id, username, created_at, updated_at
          FROM public."user"
          where id = $1
			`, [userId])

			res.status(200).json({user: user.rows[0]})
		} catch (e) {
			console.log(e)
			res.status(500).json(e)
		}
	}
}

export default new AuthController()