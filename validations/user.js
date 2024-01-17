import {check} from "express-validator";

export const CUUserMiddlewares = [
	check('username', 'Имя пользователя не может быть меньше 4 и больше 30 символов').isLength({min: 4, max: 30}),
	check('password', 'Пароль не может быть меньше 8 символов и 30 символов').isLength({min: 8, max: 30}),
]