import { Client, ClientOptions, Collection } from 'discord.js'
import { Config } from '../Lib/config.js'
import { Command } from './Command.js'

export class ConverterClient extends Client {
	commands: Collection<string, Command>

	constructor(options: ClientOptions) {
		super(options)

		this.commands = new Collection()

		this.login(Config.token).then(() => console.log('Client logged'))
	}
}
