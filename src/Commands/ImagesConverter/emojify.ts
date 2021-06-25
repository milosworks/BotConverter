import {
	MessageAttachment,
	MessageButton,
	CollectorFilter,
	MessageComponentInteraction,
	MessageActionRow
} from 'discord.js'
import { ConverterContext } from '../../Classes/ConverterContext.js'
import { Command } from '../../Classes/Command.js'
import { ConverterClient } from '../../Classes/ConverterClient.js'
import { Client } from '../../Lib/constants.js'
import Converters from '../../Classes/Converters.js'
import { GetURL } from '../../Lib/GetURL.js'

export default class emojifyCommand extends Command {
	constructor(client: ConverterClient) {
		super(client, {
			name: 'emojify',
			description:
				'Make a png/emoji/avatar to gif, add it to your favorites gifs and use it as an emoji.',
			category: 'images',
			usage: (prefix) =>
				`${prefix}emojify <url/emoji/attachment/user/guildID> [--name <Image Name>]`,
			example: (prefix) =>
				`${prefix}emojify https://vyrekxd.is-inside.me/CydkJGdZ.png\n${prefix}emojify https://vyrekxd.is-inside.me/CydkJGdZ.png --name my-emoji\n${prefix}emojify :_XD:\n${prefix}emojify <attach an image>\n${prefix}emojify @Vyrek\n${prefix}emojify 761370919419117598`
		})
	}

	async run(ctx: ConverterContext): Promise<any> {
		if (!ctx.args[0] && !ctx.msg.attachments.first())
			return ctx.embedRes(
				`Incorrect use: \`${(this.usage as any)(Client.prefix)}\``,
				'error'
			)

		const Src = await GetURL(ctx)
		if (!Src) return ctx.embedRes('You need to put a valid link', 'error')

		const Name =
			ctx.args[1] === '--name' ? ctx.args[2] ?? 'my-emoji' : 'my-emoji'
		const { type, buffer } = await Converters.GetImageBuffer(Src, {
			width: 48,
			height: 48
		})
		const Attachment = new MessageAttachment(buffer, `${Name}.gif`)
		const Button = new MessageButton()
			.setStyle('SECONDARY')
			.setCustomID('emojify_addsv')
			.setLabel('Add Emoji')
		const Row = new MessageActionRow().addComponents(Button)

		if (!ctx.guild?.me?.permissions.has('MANAGE_EMOJIS'))
			Row.spliceComponents(0, 1).addComponents(Button.setDisabled(true))
		const msg = await ctx.send({ files: [Attachment], components: [Row] })

		if (ctx.guild?.me?.permissions.has('MANAGE_EMOJIS')) {
			const filter: CollectorFilter<[MessageComponentInteraction]> = (
				interaction
			) =>
				interaction.isButton() &&
				interaction.message.id === msg.id &&
				interaction.customID === 'emojify_addsv' &&
				interaction.user.id === ctx.user.id
			const colector = msg.createMessageComponentInteractionCollector(
				filter,
				{ max: 1 }
			)

			colector.on('collect', async (interaction) => {
				await interaction.defer()

				const EditedButton = msg.components[0]?.components.map((x) =>
					x.setDisabled(true)
				)
				await msg.edit({
					components: [
						Row.spliceComponents(0, 1).addComponents(
							EditedButton as any
						)
					]
				})
				await interaction.reply({
					embeds: [
						ctx.embedRes(
							'Write the name of the emoji',
							'info',
							false
						)
					]
				})
				colector.stop(':xd:')

				const MsgCol = ctx.channel.createMessageCollector(
					(user) => user.author.id === ctx.user.id,
					{ time: 40000 }
				)
				MsgCol.on('collect', (mes) => {
					ctx.guild?.emojis
						.create(type === 'svg' ? buffer : Src, mes.content, {
							reason: `Emojify by: ${ctx.user.tag}`
						})
						.then((Emoji) => {
							interaction.editReply({
								embeds: [
									ctx.embedRes(
										`Emoji created! ${Emoji.toString()}`,
										'good',
										false
									)
								]
							})
						})
						.catch((e) => {
							interaction.editReply({
								embeds: [ctx.embedRes(e, 'boterror', false)]
							})
						})
						.finally(() => {
							mes.delete()
							MsgCol.stop()
						})
				})
			})
		}
	}
}
