import { config as InitializeENV } from 'dotenv'

if (!process.env.TOKEN) InitializeENV()

const Token = process.argv.includes('DEV=true')
	? process.env.TOKEN_DEV
	: process.env.TOKEN

export const Config = {
	token: Token,
	devs: process.env.DEVS?.split(',')
}
