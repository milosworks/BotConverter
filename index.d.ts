import { KufaConsole } from 'kufa'

declare global {
	namespace NodeJS {
		interface ProcessENV {
			TOKEN: string
			DEVS: string
			INVITE: string
		}

		interface Global {
			Console: KufaConsole
		}
	}
}

declare module 'discord-api-types' {
	type Snowflake = string
}

declare module 'node-svg2img' {}
