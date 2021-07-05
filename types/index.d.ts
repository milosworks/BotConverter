import { KufaConsole } from 'kufa'

declare global {
	namespace NodeJS {
		interface ProcessENV {
			TOKEN: string
			TOKEN_DEV: string
			DEVS: string
			INVITE: string
		}

		interface Global {
			Console: KufaConsole
		}
	}
}
