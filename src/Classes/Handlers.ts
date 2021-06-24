import { lstatSync, readdirSync } from 'fs'
import { join } from 'path'
import { ConverterClient } from './ConverterClient.js'
import { Command as GeneralCommand } from './Command.js'
import Commons from '../Lib/commons.js'

const { __dirname } = Commons(import.meta.url)

export class Handlers {
	client: ConverterClient

	constructor(client: ConverterClient) {
		this.client = client

		this.Commands()
			.then((i) =>
				console.log(`§c${i}§r commands are loaded`)
			)
			.catch(console.error)
		this.Events()
			.then((i) =>
				console.log(`§c${i}§r events are now listening`)
			)
			.catch(console.error)
	}

	private async Commands(dir = '../Commands'): Promise<number|void> {
		let i = 0
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
				const tosum = await this.Commands(join(dir, File))
				if(typeof tosum === 'number')i += tosum
			} else {
				if (!File.endsWith('.js')) continue

				const { default: CommandClass } = await import(
					`file://${join(__dirname, dir, File)}`
				)
				const Command = new CommandClass(this.client) as GeneralCommand

				this.client.commands.set(Command.name, Command)
				i++
			}
		}

		return i
	}

	private async Events(dir = '../Events'): Promise<number|void> {
		let i = 0
		const Files = readdirSync(join(__dirname, dir))
		if (!Files.length)
			return console.warn(
				`The is no events on the folder: §b${join(__dirname, dir)}§r`
			)

		for (const File of Files) {
			const FileStats = lstatSync(join(__dirname, dir, File))

			if (FileStats.isDirectory()) {
				const tosum = await this.Events(join(dir, File))
				if(typeof tosum === 'number')i += tosum
			} else {
				if (!File.endsWith('.js')) continue

				const Event = await import(
					`file://${join(__dirname, dir, File)}`
				)
				const EventName = File.substring(0, File.indexOf('.js'))

				i++
				this.client.on(EventName, Event.run.bind(null, this.client))
			}
		}

		return i
	}
}
