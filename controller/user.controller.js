import bcryptjs from "bcryptjs";

import {db} from "../db.js";

import {getDateNow} from "../utils/getDateNow.js";
import {validationResult} from "express-validator";
import {createErrors} from "../utils/createErrors.js";

class UserController {
	async getAll(req, res) {
		try {
			const users = await db.query(`
          SELECT id, username, created_at, updated_at
          FROM public."user"
			`)

			res.json(users.rows)
		} catch (e) {
			console.log(e)
			res.status(500).json(e)
		}
	}

	async getOne(req, res) {
		try {
			const {id} = req.params

			const user = await db.query(`
          SELECT id, username, created_at, updated_at
          FROM public."user"
          where id = $1
			`, [id])

			res.json(user.rows[0])
		} catch (e) {
			console.log(e)
			res.status(500).json(e)
		}
	}

	async update(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) return res.status(400).json(errors)

			const {username, password} = req.body;
			const {id: userId} = req.user;

			const candidate = await db.query(`
          SELECT username
          FROM public."user"
          where username = $1
			`, [username])

			if (candidate.rows[0]) return res.status(400).json(createErrors('', {
				username: 'Пользователь с таким именем уже существует'
			}))

			const hashPassword = bcryptjs.hashSync(password, 7)
			const dateNow = getDateNow();

			const user = await db.query(`
          UPDATE public."user"
          set username   = $1,
              password   = $2,
              updated_at = $3
          where id = $4
          RETURNING id, username, created_at, updated_at
			`, [username, hashPassword, dateNow, userId])

			res.json(user.rows[0]);
		} catch (e) {
			console.log(e)
			res.status(500).json(e)
		}
	}

	async delete(req, res) {
		try {
			// todo delete logic
		} catch (e) {
			console.log(e)
			res.status(500).json(e)
		}
	}
}

export default new UserController()