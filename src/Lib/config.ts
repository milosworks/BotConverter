import { config as InitializeENV } from 'dotenv'

if (!process.env.TOKEN) InitializeENV()

export const Config = {
	token: process.env.TOKEN,
	devs: process.env.DEVS?.split(',')
}
