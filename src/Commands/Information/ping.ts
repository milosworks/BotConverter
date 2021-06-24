import { ConverterContext } from '../../Classes/ConverterContext.js'
import { Command } from '../../Classes/Command.js'
import { ConverterClient } from '../../Classes/ConverterClient.js'

export default class pingCommand extends Command {
	constructor(client: ConverterClient) {
		super(client, {
			name: 'ping',
			description: 'Gives you the latency of the bot',
			category: 'information',
			usage: (prefix) => `${prefix}ping`,
			example: (prefix) => `${prefix}ping`
		})
	}

	async run(ctx: ConverterContext): Promise<any> {
		ctx.embedRes('Pong')
	}
}
