import {validationResult} from "express-validator";

import {db} from "../db.js";

import {getDateNow} from "../utils/getDateNow.js";
import {createErrors, errorFormatter} from "../utils/createErrors.js";

class ProjectController {
	getAll = async (req, res) => {
		try {
			const {id: userId} = req.user

			let projects = await db.query(`
          SELECT project.id, project.name, project.description, project.created_at, project.updated_at, color.name as color_name
          FROM project JOIN color ON project.color_id = color.id
          where user_id = $1
			`, [userId])

			projects = projects.rows

			if (projects.length) {
				return res.status(200).json({projects})
			} else return res.status(404).json([])
		} catch (e) {
			console.log(e)
			res.status(500).json(e)
		}
	}

	getOne = async (req, res) => {
		try {
			const {id: userId} = req.user
			const {id: projectId} = req.params

			let project = await db.query(`
          SELECT project.id, project.name, project.description, project.created_at, project.updated_at, color.name as color_name
          FROM project JOIN color ON project.color_id = color.id
          where user_id = $1
            and project.id = $2
			`, [userId, projectId])

			project = project.rows[0]

			if (project) {

				return res.status(200).json({project})
			} else return res.status(404).json([])
		} catch (e) {
			console.log(e)
			res.status(500).json(e)
		}
	}

	create = async (req, res) => {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) return res.status(400).json(errorFormatter(errors))

			const {id: userId} = req.user
			const {name, color, description} = req.body

			const hasNameInSystem = await this.checkHasProjectNameInSystem(userId, name)
			if (!!hasNameInSystem) return res.status(400).json(createErrors('', {
				name: 'Проект с таким именем уже существует'
			}))

			const colorCandidate = await this.checkHasProjectColorInSystem(color)
			if (!colorCandidate) return res.status(400).json(createErrors('', {
				color: 'Такого цвета нет в системе'
			}))

			const dateNow = getDateNow()

			let project = await db.query(`
          with inserted_project as (
          INSERT
          INTO project (name, description, user_id, color_id, created_at, updated_at)
          values ($1, $2, $3, $4, $5, $6) RETURNING *
              )
          SELECT inserted_project.id,
                 inserted_project.name,
                 inserted_project.description,
                 inserted_project.created_at,
                 inserted_project.updated_at,
                 color.name as color_name
          FROM inserted_project
                   JOIN color
                        ON inserted_project.color_id = color.id
			`, [name, description, userId, colorCandidate.id, dateNow, dateNow])

			project = project.rows[0]

			return res.status(200).json({project})
		} catch (e) {
			console.log(e)
			res.status(500).json(e)
		}
	}

	update = async (req, res) => {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) return res.status(400).json(errorFormatter(errors))

			const {id: userId} = req.user
			const {id: projectId} = req.params
			const {name, color, description} = req.body

			const colorCandidate = await this.checkHasProjectColorInSystem(color)
			if (!colorCandidate) return res.status(400).json(createErrors('', {
				color: 'Такого цвета нет в системе'
			}))

			const dateNow = getDateNow()

			let project = await db.query(`
          with inserted_project as (
          UPDATE project
          SET name        = $1,
              description = $2,
              color_id    = $3,
              updated_at  = $4
          WHERE user_id = $5
            AND id = $6 RETURNING *
              )
          SELECT inserted_project.id,
                 inserted_project.name,
                 inserted_project.description,
                 inserted_project.created_at,
                 inserted_project.updated_at,
                 color.name as color_name
          FROM inserted_project
                   JOIN color
                        ON inserted_project.color_id = color.id
			`, [name, description, colorCandidate.id, dateNow, userId, projectId])

			project = project.rows[0]

			return res.status(200).json({project})
		} catch (e) {
			console.log(e)
			res.status(500).json(e)
		}
	}

	async delete(req, res) {
		try {
			const {id: userId} = req.user
			const {id: projectId} = req.params

			const candidate = await db.query(`
          SELECT *
          FROM project
          WHERE id = $1
            AND user_id = $2
			`, [projectId, userId])

			if (!candidate.rows[0]) return res.status(404).json(createErrors('Проекта с таким id не существует'))

			await db.query(`
          DELETE
          FROM project
          WHERE id = $1
            AND user_id = $2
			`, [projectId, userId])

			return res.status(200).json('ok')
		} catch (e) {
			console.log(e)
			res.status(500).json(e)
		}
	}

	async checkHasProjectNameInSystem(userId, name) {
		const candidate = await db.query(`
        SELECT name
        FROM project
        WHERE user_id = $1
          AND name = $2
		`, [userId, name])

		return candidate.rows[0]
	}

	async checkHasProjectColorInSystem(color) {
		const candidate = await db.query(`
        SELECT *
        FROM color
        WHERE name = $1
		`, [color])

		return candidate.rows[0]
	}
}

export default new ProjectController()