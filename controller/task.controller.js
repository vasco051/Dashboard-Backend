import {db} from "../db.js";

class TaskController {
	getAll = async (req, res) => {
		try {
			const {id: userId} = req.user
			const {projectId} = req.params

			let tasks = await db.query(`
          SELECT *
          FROM task
          where user_id = $1
            AND project_id = $2
			`, [userId, projectId])

			tasks = tasks.rows

			if (tasks.length) {
				const transformTasks = await Promise.all(tasks.map(async (task) => {
					return await this.convertTaskToResponse(task, userId);
				}));

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
			const {projectId, id: taskId} = req.params

			let task = await db.query(`
          SELECT *
          FROM task
          where user_id = $1
            AND project_id = $2
          	AND id = $3
			`, [userId, projectId, taskId])

			task = task.rows[0]

			if (task) {
				const transformTasks = await this.convertTaskToResponse(task, userId)

				return res.status(200).json({task: transformTasks})
			} else return res.status(404).json([])
		} catch (e) {
			console.log(e)
			res.status(500).json(e)
		}
	}
	create = async (req, res) => {
		try {

		} catch (e) {
			console.log(e)
			res.status(500).json(e)
		}
	}
	update = async (req, res) => {
		try {

		} catch (e) {
			console.log(e)
			res.status(500).json(e)
		}
	}
	delete = async (req, res) => {
		try {

		} catch (e) {
			console.log(e)
			res.status(500).json(e)
		}
	}

	async convertTaskToResponse(task, userId) {
		let status = await db.query(`
        SELECT status.id, status.name, status.created_at, status.updated_at, color.name as color_name
        FROM status
                 JOIN color ON status.color_id = color.id
        WHERE status.user_id = $1
          AND status.id = $2
		`, [userId, task.status_id])

		status = status.rows[0]

		task.status = status
		delete task.status_id
		delete task.user_id
		delete task.project_id

		return task
	}
}

export default new TaskController();