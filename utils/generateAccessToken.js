import jwt from 'jsonwebtoken'

export const generateAccessToken = (id) => {
	const payload = {
		id,
	}

	return jwt.sign(payload, process.env.SECRET, {expiresIn: "24h"})
}