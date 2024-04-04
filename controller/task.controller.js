import {validationResult} from "express-validator";

import {db} from "../db.js";

import {createErrors, errorFormatter} from "../utils/createErrors.js";
import {getDateNow} from "../utils/getDateNow.js";

class TaskController {
    getAll = async (req, res) => {
        try {
            const {id: userId} = req.user
            const {projectId, sphereId} = req.params

            let tasks = await db.query(`
              SELECT task.id,
                     task.title,
                     task.description,
                     task.created_at,
                     task.updated_at,
                     tag_id
              FROM task
              WHERE task.user_id = $1
                AND task.project_id = $2
                AND task.status_id = $3
					`, [userId, projectId, sphereId])

            tasks = tasks.rows

            if (tasks.length) {
                const transformTasks = await Promise.all(tasks.map(async task => {
                    const tag = await db.query(`
                SELECT tag.id, tag.name, tag.created_at, tag.updated_at, color.name as color_name
                FROM tag
                         JOIN color ON tag.color_id = color.id
                WHERE tag.user_id = $1
                  AND tag.project_id = $2
                	AND tag.id = $3
						`, [userId, projectId, task.tag_id])

                    delete task.tag_id
                    task.tag = tag.rows[0] || null

                    return task
                }))

                return res.status(200).json({tasks: transformTasks})
            } else return res.status(404).json([])
        } catch (e) {
            console.log(e)
            res.status(500).json(e)
        }
    }

    getOne = async (req, res) => {
        try {
            const {id: userId} = req.user
            const {projectId, sphereId, id: taskId} = req.params

            let task = await db.query(`
              SELECT task.id,
                     task.title,
                     task.description,
                     task.created_at,
                     task.updated_at,
                     tag_id
              FROM task
              WHERE task.user_id = $1
                AND task.project_id = $2
                AND task.status_id = $3
                AND task.id = $4
					`, [userId, projectId, sphereId, taskId])

            task = task.rows[0]

            if (task) {
                const tag = await db.query(`
                SELECT tag.id, tag.name, tag.created_at, tag.updated_at, color.name as color_name
                FROM tag
                         JOIN color ON tag.color_id = color.id
                WHERE tag.user_id = $1
                  AND tag.project_id = $2
                	AND tag.id = $3
						`, [userId, projectId, task.tag_id])

                delete task.tag_id
                task.tag = tag.rows[0] || null

                return res.status(200).json({task})
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
            const {title, status: statusName, description, tag: tagName} = req.body
            const {projectId} = req.params

            const status = await this.getStatusByName(statusName, userId);
            if (!status) return res.status(400).json(createErrors('', {
                status: 'Статус с таким названием отсутствует'
            }))

            const tag = await this.getTagByName(tagName, userId)

            const dateNow = getDateNow()

            let task = await db.query(`
          INSERT INTO task (title, description, user_id, project_id, status_id, created_at, updated_at, tag_id)
          values ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
			`, [title, description, userId, projectId, status.id, dateNow, dateNow, tag?.id])

            task = await this.convertTaskToResponse(task.rows[0], userId, projectId)

            return res.status(200).json({task})
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
            const {title, status: statusName, description, tag: tagName} = req.body
            const {projectId, id: taskId} = req.params

            const status = await this.getStatusByName(statusName, userId);
            if (!status) return res.status(400).json(createErrors('', {
                status: 'Статус с таким названием отсутствует'
            }))

            const tag = await this.getTagByName(tagName, userId)

            const dateNow = getDateNow()

            let task = await db.query(`
          UPDATE task
          SET title       = $1,
              description = $2,
              status_id   = $3,
              updated_at  = $4,
              tag_id      = $5
          WHERE user_id = $6
            AND project_id = $7
            AND id = $8
          RETURNING *
			`, [title, description, status.id, dateNow, tag?.id, userId, projectId, taskId])

            task = await this.convertTaskToResponse(task.rows[0], userId)

            return res.status(200).json({task})
        } catch (e) {
            console.log(e)
            res.status(500).json(e)
        }
    }
    delete = async (req, res) => {
        try {
            const {id: userId} = req.user
            const {projectId, id: taskId} = req.params

            const candidate = await db.query(`
          SELECT *
          FROM task
          WHERE user_id = $1
            AND project_id = $2
            AND id = $3
			`, [userId, projectId, taskId])

            if (!candidate.rows[0]) return res.status(404).json(createErrors('Задачи с таким id не существует'))

            await db.query(`
          DELETE
          FROM task
          WHERE user_id = $1
            AND project_id = $2
            AND id = $3
			`, [userId, projectId, taskId])

            return res.status(200).json('ok')
        } catch (e) {
            console.log(e)
            res.status(500).json(e)
        }
    }

    async convertTaskToResponse(task, userId, projectId) {
        let status = await db.query(`
        SELECT status.id, status.name, status.created_at, status.updated_at, color.name as color_name
        FROM status
                 JOIN color ON status.color_id = color.id
        WHERE status.user_id = $1
					AND status.project_id = $2
          AND status.id = $3
		`, [userId, projectId, task.status_id])

        status = status.rows[0]

        task.status = status
        delete task.status_id
        delete task.user_id
        delete task.project_id

        let tag = await db.query(`
			SELECT tag.id, tag.name, tag.created_at, tag.updated_at, color.name as color_name
			FROM tag
						 JOIN color ON tag.color_id = color.id
			WHERE tag.user_id = $1
				AND tag.project_id = $2
				AND tag.id = $3
		`, [userId, projectId, task.tag_id])

        tag = tag.rows[0]

        task.tag = tag || null
        delete task.tag_id

        return task
    }

    async getStatusByName(name, userId) {
        const status = await db.query(`
        SELECT *
        FROM status
        WHERE user_id = $1
          AND name = $2
		`, [userId, name])

        return status.rows[0]
    }

    async getTagByName(name, userId) {
        const tag = await db.query(`
        SELECT *
        FROM tag
        WHERE user_id = $1
          AND name = $2
		`, [userId, name])

        return tag.rows[0]
    }
}

export default new TaskController();