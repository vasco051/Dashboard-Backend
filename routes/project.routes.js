import {Router} from "express";

import {authMiddleware} from "../middlewares/authMiddleware.js";

import ProjectController from "../controller/project.controller.js";
import {check} from "express-validator";

export const router = new Router()

const CUMiddlewares = [
	authMiddleware,
	check('name', 'Название не может быть меньше 2 символов').isLength({min: 2}),
	check('color', 'Цвет не может быть меньше 2 символов').isLength({min: 2}),
]

router.get('/projects', authMiddleware, ProjectController.getAll)
router.get('/projects/:id', authMiddleware, ProjectController.getOne)
router.post('/projects', CUMiddlewares, ProjectController.create)
router.put('/projects/:id', CUMiddlewares, ProjectController.update)
router.delete('/projects/:id', authMiddleware, ProjectController.delete)
