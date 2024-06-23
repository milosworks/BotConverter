import {
	AttachmentBuilder,
	Command,
	Declare,
	Embed,
	Guild,
	Options,
	createAttachmentOption,
	createStringOption,
	createUserOption,
	type CommandContext,
	type OKFunction
} from 'seyfert'
import sharp from 'sharp'
import { attachmentUrl, readableDimensions, readableSize } from '../../common'
import { getData } from '../../common/get-data'

type Destinations = 'png'

const options = {
	destination: createStringOption({
		description: 'Destination type to convert the origin image to',
		required: true,
		choices: [{name: 'PNG', value: 'png'}],
		value(data, ok: OKFunction<Destinations>, fail) {
			ok(data.value as Destinations)
		},
	}),
	url: createStringOption({
		description:
			'Urls from the image you want to convert. (Use space to separate)',
		required: false,
		value(data, ok: OKFunction<string[] | undefined>, fail) {
			const mapped = []

			for (const x of data.value.split(' ')) {
				if (URL.canParse(x)) mapped.push(x)
			}

			if (!mapped.length) ok(undefined)

			ok(mapped)
		}
	}),
	emoji: createStringOption({
		description:
			'Emojis you want to convert to image. (Use space to separate)',
		required: false,
		value(data, ok: OKFunction<string[] | undefined>, fail) {
			if (!/<?(a:|:)\w*:\d+>/g.test(data.value)) ok(undefined)

			const mapped = []

			for (const x of data.value.split(' ')) {
				if (!/<?(a:|:)\w*:\d+>/g.test(x)) continue
				mapped.push(
					
						`https://cdn.discordapp.com/emojis/${x
							.match(/:\d+/)![0]
							.replace(':', '')}.png?size=4096&quality=lossless`
					
				)
			}

			if (!mapped.length) return ok(undefined)

			ok(mapped)
		}
	}),
	attachment: createAttachmentOption({
		description: 'Attachment you want to convert to image.',
		required: false
	}),
	user: createUserOption({
		description: 'User icon to convert to image',
		required: false
	}),
	guild: createStringOption({
		description:
			'Id of the guilds whose image to convert to png. (Use space to separate)',
		required: false,
		async value(data, ok: OKFunction<Guild[] | undefined>, fail) {
			const mapped = []

			for (const x of data.value.split(' ')) {
				const guild = await data.context.client.guilds.fetch(x)
				if (!guild || !guild.iconURL()) continue

				mapped.push(guild as Guild)
			}

			if (!mapped.length) ok(undefined)

			ok(mapped)
		}
	})
}

@Declare({
	name: 'toimage',
	description: 'Convert supported file types to images: png'
})
@Options(options)
export default class ToImageCommand extends Command {
	async run(ctx: CommandContext<typeof options>) {
		await ctx.deferReply()

		let quantity = 0
		let converted = 0

		if (ctx.options.url?.length){
			for (const url of ctx.options.url) {
				let startTime = Date.now()
				quantity++

				const data = await getData(new URL(url)).catch(async(e) => {
					await ctx.client.messages.write(ctx.channelId, {
						content: `An error ocurred: **${e}**\nOrigin URL: \`${url}\``
					})
				})
				if (!data)continue

				let image!: sharp.Sharp

				try {
					image = await sharp(data.buffer)[ctx.options.destination]()
				} catch (e) {
					await ctx.client.messages.write(ctx.channelId, {
						content: `An error ocurred: **${e}**\nOrigin URL: \`${url}\``
					})
				}

				const metadata = await image.metadata()
				data.convBuffer = await image.toBuffer()
				
				await ctx.client.messages.write(ctx.channelId, {
					embeds: [
						new Embed()
						.setAuthor({name: ctx.author.username, iconUrl: ctx.author.avatarURL()})
						.setColor('Random')
						.setDescription(ctx.guildId ? `[Download Converted](${attachmentUrl(ctx.guildId!, ctx.channelId, startTime)})` : '')
						.addFields([
							{name: 'Original URL', value: `\`${url}\``},
							{
								name: 'Image Info',
								value: `**File Type:** \`${data.contentType.type} → png\`
								**File Size:** \`(Original) ${readableSize(data.buffer.byteLength)}${data.convBuffer ? ` → ${readableSize(data.convBuffer.byteLength)}` : ''}\`
								**Image Dimensions:** ${readableDimensions(metadata as Required<sharp.Metadata>)}`
							}
						])
						.setImage(`attachment://${startTime}.${ctx.options.destination}`)
						.setFooter({text: `Took ${Date.now() - startTime}ms`})
					],
					files: [
						new AttachmentBuilder().setFile('buffer', data.convBuffer || data.buffer).setName(`${startTime}.${ctx.options.destination}`)
					]
				})
				
				converted++
			}
		}

		if (ctx.options.emoji?.length) {
			for (const url of ctx.options.emoji) {
				quantity++

				await ctx.client.messages.write(ctx.channelId, {
					embeds: [
						new Embed()
						.setAuthor({name: ctx.author.username, iconUrl: ctx.author.avatarURL({
							extension: ctx.options.destination, size: 4096
						})})
						.setColor('Random')
						.setImage(url)
					],
				})

				converted++
			}
		}

		if (ctx.options.user) {
				quantity++

				await ctx.client.messages.write(ctx.channelId, {
					embeds: [
						new Embed()
						.setAuthor({name: ctx.author.username, iconUrl: ctx.author.avatarURL()})
						.setColor('Random')
						.setDescription(`Avatar icon of user **${ctx.options.user.username}** (\`${ctx.options.user.id}\`)`)
						.setImage(ctx.options.user.avatarURL({extension: ctx.options.destination, size: 4096}))
					],
				})

				converted++
		}

		if (ctx.options.guild) {
			for (const guild of ctx.options.guild) {
				quantity++

				const icon = guild.iconURL({extension: 'png', size: 4096})
				if (!icon){
					await ctx.client.messages.write(ctx.channelId, {
						content: `No icon for the guild **${guild.name}** \`(${guild.id})\``
					})
					continue
				}

				await ctx.client.messages.write(ctx.channelId, {
					embeds: [
						new Embed()
						.setAuthor({name: ctx.author.username, iconUrl: ctx.author.avatarURL({extension: ctx.options.destination, size: 4096})})
						.setColor('Random')
						.setImage(icon)
					],
				})

				converted++
			}
	}

		await ctx.editResponse({content: 
			converted === 0
			? 'None of the images provided could be converted.'
			: quantity !== converted
				? `**${converted}** of **${quantity}** images have been converted, remaining images could not be converted.`
				: 'All images were converted'
		})
	}
}
