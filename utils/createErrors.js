export const createErrors = (message, customErrors) => {
	const errors = {
		...customErrors
	}

	if (message) errors.message = message

	return {errors}
}
