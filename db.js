import pg from 'pg'

export const db = new pg.Pool({
	user: 'postgres',
	password: '1234',
	host: 'localhost',
	port: 5432,
	database: 'dashboard'
})