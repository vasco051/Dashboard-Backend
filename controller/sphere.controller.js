import {db} from "../db.js";

class SphereController {
    getAll = async (req, res) => {
        try {
            const {id: userId} = req.user
            const {projectId} = req.params

            let statuses = await db.query(`
          SELECT status.id,
                 status.name,
                 status.is_completed,
                 status.updated_at,
                 status.created_at,
                 color.name as color_name
          FROM status
                   JOIN color ON status.color_id = color.id
          where user_id = $1
            AND project_id = $2
			`, [userId, projectId])

            statuses = statuses.rows

            if (statuses.length) {
                const spheres = await Promise.all(statuses.map(async status => {
                    let tasks = await db.query(`
              SELECT task.id,
                     task.title,
                     task.description,
                     task.created_at,
                     task.updated_at,
                     task.status_id,
                     tag_id
              FROM task
              WHERE task.user_id = $1
                AND task.project_id = $2
                AND status_id = $3
					`, [userId, projectId, status.id])

                    tasks = tasks.rows

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
                    }));

                    return {...status, tasks: transformTasks}
                }));

                return res.status(200).json({spheres})
            } else return res.status(404).json([])
        } catch (e) {
            console.log(e)
            res.status(500).json(e)
        }
    }
    getOne = async (req, res) => {
        try {
            const {id: userId} = req.user
            const {projectId, id: sphereId} = req.params

            let statuses = await db.query(`
          SELECT status.id,
                 status.name,
                 status.is_completed,
                 status.updated_at,
                 status.created_at,
                 color.name as color_name
          FROM status
                   JOIN color ON status.color_id = color.id
          where user_id = $1
            AND project_id = $2
            AND status.id = $3
			`, [userId, projectId, sphereId])

            statuses = statuses.rows

            if (statuses.length) {
                const sphere = await Promise.all(statuses.map(async status => {
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
                AND status_id = $3
					`, [userId, projectId, status.id])

                    tasks = tasks.rows

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
                    }));

                    return {...status, tasks: transformTasks}
                }));

                return res.status(200).json({sphere})
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
}

export default new SphereController();