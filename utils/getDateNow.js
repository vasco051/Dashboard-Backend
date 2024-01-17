export const getDateNow = () => {
	const dateNow = new Date();

	return dateNow.toISOString().slice(0, -5).split('T').join(', ');
}