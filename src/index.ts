import {
	Client,
	Logger,
	type ParseClient
} from 'seyfert';
import { bgBrightWhite, black, brightBlack } from 'seyfert/lib/common';
import { formatMemoryUsage } from './common';

const client = new Client()

Logger.customize((log, lvl, args) => {
	const date = new Date()
	const color = Logger.colorFunctions.get(lvl) ?? Logger.noColor;

	return [
		brightBlack(formatMemoryUsage(process.memoryUsage().rss)),
		bgBrightWhite(black(`[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]`)),
		color(Logger.prefixes.get(lvl) ?? 'DEBUG'),
		'[BotConverter] >',
		...args,
	];
})

client.setServices({
	handlers: {
		commands: {
			onCommand: (file) => {
				let cmd = new file()
				cmd.guildId = ['807241041425334323']
				return cmd
			}
		}
	}
})

client.start().then(() => {
	client.uploadCommands().catch(console.error)
})

declare module 'seyfert' {
	interface UsingClient extends ParseClient<Client<true>> {}
}
