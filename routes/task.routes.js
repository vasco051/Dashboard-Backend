import {Router} from "express";
import {check} from "express-validator";

import {authMiddleware} from "../middlewares/authMiddleware.js";

import TaskController from "../controller/task.controller.js";

export const router = new Router()

const CUMiddlewares = [
    authMiddleware,
    check('title', 'Название не может быть пустым').notEmpty({ignore_whitespace: true}),
    check('title', 'Название не может быть больше 250 символов').isLength({max: 250}),
    check('status', 'Поле статуса не может быть пустым').notEmpty(),
]

router.get('/projects/:projectId/spheres/:sphereId/tasks', authMiddleware, TaskController.getAll)
router.get('/projects/:projectId/spheres/:sphereId/tasks/:id', authMiddleware, TaskController.getOne)
router.post('/projects/:projectId/spheres/:sphereId/tasks', CUMiddlewares, TaskController.create)
router.put('/projects/:projectId/spheres/:sphereId/tasks/:id', CUMiddlewares, TaskController.update)
router.delete('/projects/:projectId/spheres/:sphereId/tasks/:id', authMiddleware, TaskController.delete)
