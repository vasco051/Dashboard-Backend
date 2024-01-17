import {Router} from "express";
import {check} from "express-validator";

import {authMiddleware} from "../middlewares/authMiddleware.js";

import TaskController from "../controller/task.controller.js";

export const router = new Router()

const CUMiddlewares = [
	authMiddleware,
	check('title', 'Название не может быть меньше 2 символов').isLength({min: 2}),
	check('status', 'Поле статуса не может быть пустым').notEmpty(),
]

router.get('/projects/:projectId/tasks', authMiddleware, TaskController.getAll)
router.get('/projects/:projectId/tasks/:id', authMiddleware, TaskController.getOne)
router.post('/projects/:projectId/tasks', CUMiddlewares, TaskController.create)
router.put('/projects/:projectId/tasks/:id', CUMiddlewares, TaskController.update)
router.delete('/projects/:projectId/tasks/:id', authMiddleware, TaskController.delete)
