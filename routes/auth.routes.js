import {Router} from "express";

import authController from "../controller/auth.controller.js";

import {authMiddleware} from "../middlewares/authMiddleware.js";

import {CUUserMiddlewares} from "../validations/user.js";
import {check} from "express-validator";

export const router = new Router();

const regMiddlewares = [
	...CUUserMiddlewares,
	check('approve_password', 'Пароль не может быть меньше 8 символов и 30 символов').isLength({min: 8, max: 30}),
]

router.post('/registration', regMiddlewares, authController.registration)
router.post('/login', CUUserMiddlewares, authController.login)
router.get('/auth', authMiddleware, authController.auth)