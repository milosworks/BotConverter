import mediaExtractor from 'media-extractor'
import parser from 'twemoji-parser'
import { ConverterContext } from '../../Classes/ConverterContext.js'
import { Command } from '../../Classes/Command.js'
import { ConverterClient } from '../../Classes/ConverterClient.js'
import { Client } from '../../Lib/constants.js'
import { Converters } from '../../Classes/Converters.js'
import { MessageAttachment, Guild, MessageButton, CollectorFilter, MessageComponentInteraction, MessageActionRow } from 'discord.js'

export default class emojifyCommand extends Command {
	constructor(client: ConverterClient) {
		super(client, {
			name: 'emojify',
			description:
				'Make a png/emoji/avatar to gif, add it to your favorites gifs and use it as an emoji.',
			category: 'images',
			usage: (prefix) =>
				`${prefix}emojify <url/emoji/attachment/user/guildID>`,
			example: (
				prefix
			) => `${prefix}emojify https://vyrekxd.is-inside.me/CydkJGdZ.png\n${prefix}emojify :_XD:\n${prefix}emojify <attach an image>\n${prefix}emojify @Vyrek\n${prefix}emojify 761370919419117598`
		})
	}

	async run(ctx: ConverterContext): Promise<any> {
		if (!ctx.args[0] && !ctx.msg.attachments.first())
			return ctx.embedRes(
				`Incorrect use: \`${(this.usage as any)(Client.prefix)}\``,
				'error'
			)

		//Copied from https://github.com/AndreMor8/gidget/blob/master/src/commands/image/emojify.js
		const UserOrGuild =
			ctx.args[0] || ctx.msg.mentions.users.first()
				? ctx.msg.mentions.users.first() ||
				ctx.client.users.cache.get(ctx.args[0] as any) ||
				ctx.client.users.cache.find(
						(e) =>
							e.username === ctx.args.slice(1).join(' ') ||
							e.tag === ctx.args.slice(1).join(' ') ||
							e.username?.toLowerCase() ===
								ctx.args.slice(1).join(' ')?.toLowerCase() ||
							e.tag?.toLowerCase() ===
								ctx.args.slice(1).join(' ')?.toLowerCase()
				) ||
				ctx.guild?.members.cache.find(
						(e) =>
							e.nickname === ctx.args.slice(1).join(' ') ||
							e.nickname?.toLowerCase() ===
								ctx.args.slice(1).join(' ')?.toLowerCase()
				)?.user ||
				ctx.client.guilds.cache.get(ctx.args[0] as any) ||
				(await ctx.client.users
						.fetch(ctx.args[0] as any)
						.catch(() => {}))
				: null
		let Src: any

		if (UserOrGuild) {
			Src = UserOrGuild instanceof Guild ? UserOrGuild.iconURL({format: 'png', dynamic: true, size: 64}) : UserOrGuild.displayAvatarURL({
				format: 'png',
				dynamic: true,
				size: 64
			})
		} else if (ctx.msg.attachments.first()) {
            Src = ctx.msg.attachments.first()?.url
        } else if (ctx.args[0]?.match(/<?(a:|:)\w*:(\d{17}|\d{18})>/)) {
            const matched = ctx.args[0]?.match(/<?(a:|:)\w*:(\d{17}|\d{18})>/)
            const ext = ctx.args[0].startsWith('<a:') ? ('gif') : ('png')
            Src = `https://cdn.discordapp.com/emojis/${(matched as any)[2]}.${ext}`
        } else if ((/tenor\.com\/view/.test(ctx.args[0] as string) || /tenor.com\/.+\.gif/.test(ctx.args[0] as string) || /giphy\.com\/gifs/.test(ctx.args[0] as string)) && await mediaExtractor.resolve(ctx.args[0] as string)) {
            Src = await mediaExtractor.resolve(ctx.args[0] as string)
        } else if (/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/gm.test(ctx.args[0] as string)) {
            Src = ctx.args[0]
        }

        const parsed = parser.parse(ctx.args[0] as string)
        if (parsed.length >= 1) {
            Src = parsed[0]?.url
        }
        if(!Src)return ctx.embedRes('You need to put a valid link', 'error')

        const { type, buffer } = await Converters.toEmojify(Src, true)
        const Attachment = new MessageAttachment(buffer, 'emoji.gif')
		const Button = new MessageButton()
		.setStyle('SECONDARY')
		.setCustomID('emojify_addsv')
		.setLabel('Add Emoji')
		const Row = new MessageActionRow()
		.addComponents(Button)

		if(!ctx.guild?.me?.permissions.has('MANAGE_EMOJIS'))Row.spliceComponents(0, 1).addComponents(Button.setDisabled(true))
        const msg = await ctx.send({ files: [Attachment], components: [Row]})

		if(ctx.guild?.me?.permissions.has('MANAGE_EMOJIS')){
			const filter: CollectorFilter<[MessageComponentInteraction]> = (interaction) => interaction.isButton() && interaction.message.id === msg.id && interaction.customID === 'emojify_addsv' && interaction.user.id === ctx.user.id
			const colector = msg.createMessageComponentInteractionCollector(filter, {max: 1})

			colector.on('collect', async(interaction) => {
				await interaction.defer()

				const EditedButton = msg.components[0]?.components.map(x => x.setDisabled(true))
				await msg.edit({components: [Row.spliceComponents(0, 1).addComponents(EditedButton as any)]})
				await interaction.reply({embeds: [ctx.embedRes('Write the name of the emoji', 'info', false)]})
				colector.stop(':xd:')

				const MsgCol = ctx.channel.createMessageCollector((user) => user.author.id === ctx.user.id, { time: 40000 })
				MsgCol.on('collect', (mes) => {
                    ctx.guild?.emojis.create(type === 'svg' ? buffer : Src, mes.content, { reason: `Emojify by: ${ctx.user.tag}`}).then((Emoji) => {
                        interaction.editReply({embeds: [ctx.embedRes(`Emoji created! ${Emoji.toString()}`, 'good', false)]})
                    }).catch(e => {
                        interaction.editReply({embeds: [ctx.embedRes(e, 'boterror', false)]})
                    }).finally(() => {
                        mes.delete()
                        MsgCol.stop()
                    })
				})
			})
		}
	}
}
