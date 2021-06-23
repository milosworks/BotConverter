import { config as InitializeENV } from 'dotenv'

InitializeENV()

export const Config = {
	token: process.env.TOKEN,
	devs: process.env.DEVS?.split(',')
}
