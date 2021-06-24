import { Message } from 'discord.js'
import { ConverterClient } from '../Classes/ConverterClient.js'
import { ConverterContext } from '../Classes/ConverterContext.js'
import { Client } from '../Lib/constants.js'

export const run = (Converter: ConverterClient, message: Message): void => {
	if (message.author.bot) return
	if (!message.content.startsWith(Client.prefix)) return

	const Context = new ConverterContext(Converter, message)
	Context.args.push(
		...message.content.slice(Client.prefix.length).trimEnd().split(/ +/g)
	)

	const Command = (Context.args.shift() as string).toLowerCase()
	const Cmd =
		Context.client.commands.get(Command) ||
		Context.client.commands.find((x) => x.aliases.includes(Command))

	if (!Cmd) return
	if (Cmd.canRun(Context)) return

	Cmd.run(Context)
}
