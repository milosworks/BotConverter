import {
	DMChannel,
	Message,
	NewsChannel,
	TextChannel,
	Guild,
	User,
	GuildMember,
	APIMessage,
	MessageOptions,
	SplitOptions,
	MessageEmbed,
	CommandInteraction,
	Collection,
	CommandInteractionOption,
	WebhookEditMessageOptions
} from 'discord.js'
import {
	APIInteractionGuildMember,
	APIMessage as RawMessage
} from 'discord-api-types'
import { ConverterClient } from './ConverterClient'
import * as Constants from '../Lib/constants'
import { Config } from '../Lib/config'

type Options = 'boterror' | 'error' | 'info' | 'good' | undefined

export class ConverterContext {
	msg: Message
	client: ConverterClient
	constants: typeof Constants
	args: string[]

	constructor(client: ConverterClient, message: Message) {
		this.msg = message
		this.client = client
		this.constants = Constants
		this.args = []
	}

	get config(): typeof Config {
		return Config
	}

	get channel(): TextChannel | DMChannel | NewsChannel {
		return this.msg.channel
	}

	get guild(): Guild | null {
		return this.msg.guild
	}

	get user(): User {
		return this.msg.author
	}

	get member(): GuildMember | null {
		return this.msg.member
	}

	/* eslint-disable no-unused-vars, @typescript-eslint/explicit-module-boundary-types */
	send(
		options: string | APIMessage | (MessageOptions & { split?: false })
	): Promise<Message>
	send(
		options: APIMessage | (MessageOptions & { split: true | SplitOptions })
	): Promise<Message[]>
	send(options: any): Promise<Message | Message[]> {
		return this.channel.send(options)
	}

	embedRes(text: string, option?: Options, send?: true): Promise<Message>
	embedRes(text: string, option?: Options, send?: false): MessageEmbed
	/* eslint-enable no-unused-vars, @typescript-eslint/explicit-module-boundary-types */
	embedRes(
		text: string,
		option?: Options,
		send = true
	): Promise<Message> | MessageEmbed {
		const color = 'RANDOM'

		const e = new MessageEmbed().setTimestamp()

		switch (option) {
			case 'error': {
				e.setColor(Constants.Colors.error).setDescription(
					`${Constants.Emojis.error} | ${text}`
				)
				break
			}
			case 'info':
				e.setColor(Constants.Colors.info).setDescription(
					`${Constants.Emojis.info} | ${text}`
				)
				break
			case 'boterror': {
				e.setColor('#FF0000')
					.setDescription(
						`${Constants.Emojis.error} | Un error ha ocurrido:\n \`\`\`js\n${text}\`\`\``
					)
					.addField(
						'\u200b',
						`Reporta el error en el servidor de soporte, [únete ya!](${Constants.Client.support})`
					)
				break
			}
			case 'good': {
				e.setColor(Constants.Colors.good).setDescription(
					`${Constants.Emojis.good} | ${text}`
				)
				break
			}
			default: {
				e.setColor(color).setDescription(text)
				break
			}
		}
		if (!send) return e

		return this.send({ embeds: [e] })
	}
}

export class ConverterSlashContext {
	interaction: CommandInteraction
	client: ConverterClient
	constants: typeof Constants

	constructor(client: ConverterClient, interaction: CommandInteraction) {
		this.interaction = interaction
		this.client = client
		this.constants = Constants
	}

	get options(): Collection<string, CommandInteractionOption> {
		return this.interaction.options
	}

	get user(): User {
		return this.interaction.user
	}

	get channel(): TextChannel | DMChannel | NewsChannel {
		return this.interaction.channel
	}

	get guild(): Guild | undefined {
		return this.interaction.guild ? this.interaction.guild : undefined
	}

	get member(): GuildMember | APIInteractionGuildMember | undefined {
		return this.interaction.member ? this.interaction.member : undefined
	}

	/* eslint-disable no-unused-vars, @typescript-eslint/explicit-module-boundary-types */
	reply(
		options: string | APIMessage | WebhookEditMessageOptions
	): Promise<void | Message | RawMessage> {
		if (this.interaction.deferred)
			return this.interaction.editReply(options)
		else {
			return this.interaction.reply(options)
		}
	}

	embedRes(
		text: string,
		option?: Options,
		send?: true
	): Promise<Message | void | RawMessage>
	embedRes(text: string, option?: Options, send?: false): MessageEmbed
	/* eslint-enable no-unused-vars, @typescript-eslint/explicit-module-boundary-types */
	embedRes(
		text: string,
		option?: Options,
		send = true
	): Promise<Message | void | RawMessage> | MessageEmbed {
		const color = 'RANDOM'

		const e = new MessageEmbed().setTimestamp()

		switch (option) {
			case 'error': {
				e.setColor(Constants.Colors.error).setDescription(
					`${Constants.Emojis.error} | ${text}`
				)
				break
			}
			case 'info':
				e.setColor(Constants.Colors.info).setDescription(
					`${Constants.Emojis.info} | ${text}`
				)
				break
			case 'boterror': {
				e.setColor('#FF0000')
					.setDescription(
						`${Constants.Emojis.error} | Un error ha ocurrido:\n \`\`\`js\n${text}\`\`\``
					)
					.addField(
						'\u200b',
						`Reporta el error en el servidor de soporte, [únete ya!](${Constants.Client.support})`
					)
				break
			}
			case 'good': {
				e.setColor(Constants.Colors.good).setDescription(
					`${Constants.Emojis.good} | ${text}`
				)
				break
			}
			default: {
				e.setColor(color).setDescription(text)
				break
			}
		}
		if (!send) return e

		return this.reply({ embeds: [e] })
	}
}
