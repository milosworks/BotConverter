import { lstatSync, readdirSync } from 'fs'
import { join } from 'path'
import { ConverterClient } from './ConverterClient.js'
import { Command as GeneralCommand } from './Command.js'
import Commons from '../Lib/commons.js'

const { __dirname } = Commons(import.meta.url)

export class Handlers {
	client: ConverterClient
	CommandsLoaded: number
	EventsLoaded: number

	constructor(client: ConverterClient) {
		this.client = client
		this.CommandsLoaded = 0
		this.EventsLoaded = 0

		this.Commands()
			.then(() =>
				console.log(`§c${this.CommandsLoaded}§r commands are loaded`)
			)
			.catch(console.error)
		this.Events()
			.then(() =>
				console.log(`§c${this.EventsLoaded}§r events are now listening`)
			)
			.catch(console.error)
	}

	private async Commands(dir = '../Commands'): Promise<void> {
		const Files = readdirSync(join(__dirname, dir))
		if (!Files.length)
			return console.warn(
				`There is no commands in the folder: §b${join(
					__dirname,
					dir
				)}§r`
			)

		for (const File of Files) {
			const FileStats = lstatSync(join(__dirname, dir, File))

			if (FileStats.isDirectory()) {
				await this.Commands(join(dir, File))
			} else {
				if (!File.endsWith('.js')) continue

				const { default: CommandClass } = await import(
					`file://${join(__dirname, dir, File)}`
				)
				const Command = new CommandClass(this.client) as GeneralCommand

				this.client.commands.set(Command.name, Command)
				this.CommandsLoaded++
			}
		}
	}

	private async Events(dir = '../Events'): Promise<void> {
		const Files = readdirSync(join(__dirname, dir))
		if (!Files.length)
			return console.warn(
				`The is no events on the folder: §b${join(__dirname, dir)}§r`
			)

		for (const File of Files) {
			const FileStats = lstatSync(join(__dirname, dir, File))

			if (FileStats.isDirectory()) {
				await this.Events(join(dir, File))
			} else {
				if (!File.endsWith('.js')) continue

				const Event = await import(
					`file://${join(__dirname, dir, File)}`
				)
				const EventName = File.substring(0, File.indexOf('.js'))

				this.EventsLoaded++
				this.client.on(EventName, Event.run.bind(null, this.client))
			}
		}
	}
}
