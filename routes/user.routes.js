import {Router} from 'express'

import {authMiddleware} from "../middlewares/authMiddleware.js";

import userController from "../controller/user.controller.js";

import {CUUserMiddlewares} from "../validations/user.js";

export const router = new Router()

const middlewares = [
	authMiddleware,
	...CUUserMiddlewares
]

router.put('/users', middlewares, userController.update)
router.delete('/users', middlewares, userController.delete)


// router.get('/users', userController.getAll)
// router.get('/users/:id', userController.getOne)