import {Router} from "express";

import authController from "../controller/auth.controller.js";

import {authMiddleware} from "../middlewares/authMiddleware.js";

import {CUUserMiddlewares} from "../validations/user.js";

export const router = new Router();

router.post('/registration', CUUserMiddlewares, authController.registration)
router.post('/login', CUUserMiddlewares, authController.login)
router.get('/auth', authMiddleware, authController.auth)