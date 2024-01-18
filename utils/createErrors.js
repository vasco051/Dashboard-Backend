export const createErrors = (message, customErrors) => {
	const errors = {
		...customErrors
	}

	if (message) errors.message = message

	return {errors}
}

export const errorFormatter = ({errors}) => {
	const cash = {}

	errors.map(error => {
		cash[error.path] = error.msg
	})

	return {errors: cash}
}