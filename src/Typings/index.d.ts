import { KufaConsole } from 'kufa'

declare global {
	namespace NodeJS {
		interface ProcessENV {
			TOKEN: string
			DEVS: string
		}

		interface Global {
			Console: KufaConsole
		}
	}
}
