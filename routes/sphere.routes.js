import {Router} from "express";

import {authMiddleware} from "../middlewares/authMiddleware.js";

import SphereController from "../controller/sphere.controller.js";

export const router = new Router()

const CUMiddlewares = [
    authMiddleware,
    // check('title', 'Название не может быть меньше 2 символов').isLength({min: 2}),
    // check('status', 'Поле статуса не может быть пустым').notEmpty(),
]

router.get('/projects/:projectId/spheres', authMiddleware, SphereController.getAll)
router.get('/projects/:projectId/spheres/:id', authMiddleware, SphereController.getOne)
router.post('/projects/:projectId/spheres', CUMiddlewares, SphereController.create)
router.put('/projects/:projectId/spheres/:id', CUMiddlewares, SphereController.update)
router.delete('/projects/:projectId/spheres/:id', authMiddleware, SphereController.delete)
