import { ConverterContext } from '../../Classes/ConverterContext.js'
import { Command } from '../../Classes/Command.js'
import { ConverterClient } from '../../Classes/ConverterClient.js'
import Converters from '../../Classes/Converters.js'
import { GetURL } from '../../Lib/GetURL.js'
import { MessageAttachment } from 'discord.js'

export default class topngCommand extends Command {
	constructor(client: ConverterClient) {
		super(client, {
			name: 'topng',
			description: 'Converts any image to png',
			category: 'images',
			usage: (prefix) =>
				`${prefix}topng <url/emoji/attachment/user/guildID> [--name <Image Name>]`,
			example: (prefix) =>
				`${prefix}topng https://vyrekxd.is-inside.me/CydkJGdZ.png\n${prefix}topng https://vyrekxd.is-inside.me/CydkJGdZ.png --name my-image\n${prefix}emojify :_XD:\n${prefix}emojify <attach an image>\n${prefix}emojify @Vyrek\n${prefix}emojify 761370919419117598`
		})
	}

	async run(ctx: ConverterContext): Promise<any> {
		if (!ctx.args[0])
			return ctx.embedRes(
				`Incorrect use: \`${(this.usage as any)(
					ctx.constants.Client.prefix as any
				)}\``,
				'error'
			)

		const Src = await GetURL(ctx)
		if (!Src) return ctx.embedRes('You need to put a valid link', 'error')

		const Name =
			ctx.args[1] === '--name' ? ctx.args[2] ?? 'my-image' : 'my-image'
		const { buffer } = await Converters.GetImageBuffer(Src)
		const Attach = new MessageAttachment(buffer, `${Name}.png`)

		await ctx.send({ files: [Attach] })
	}
}
