import {
	PermissionResolvable,
	GuildMember,
	ChannelResolvable
} from 'discord.js'
import { ConverterClient } from './ConverterClient.js'
import { ConverterContext, ConverterSlashContext } from './ConverterContext.js'
import { Utils } from './Utils.js'

export type SlashCommandOptions = Omit<CommandOptions, 'usage' | 'example'>

export interface CommandOptions {
	name: string
	description: string
	category: string
	dev?: boolean
	status?: boolean
	onlyGuild?: boolean
	aliases?: string[]
	cooldown?: number
	botPermissions?: PermissionResolvable[]
	botChannelPermissions?: PermissionResolvable[]
	memberPermissions?: PermissionResolvable[]
	memberChannelPermissions?: PermissionResolvable[]

	/* eslint-disable no-unused-vars */

	usage: (prefix: string) => string
	example: (prefix: string) => string

	/* eslint-enable no-unused-vars */
}

export class BaseCommand {
	client: ConverterClient
	name: string
	category: string
	description: string
	dev: boolean
	status: boolean
	onlyGuild: boolean
	aliases: string[]
	cooldown: number
	cooldowns: Map<string, { advised: boolean; date: number }>
	botPermissions: PermissionResolvable[]
	botChannelPermissions: PermissionResolvable[]
	memberPermissions: PermissionResolvable[]
	memberChannelPermissions: PermissionResolvable[]

	/* eslint-disable no-unused-vars */

	usage?: (prefix: string) => string
	example?: (prefix: string) => string

	/* eslint-enable no-unused-vars */

	constructor(
		client: ConverterClient,
		options: CommandOptions | SlashCommandOptions
	) {
		this.client = client
		this.name = options.name
		this.category = options.category
		this.description = options.description
		this.dev = options.dev ?? false
		this.status = options.status ?? true
		this.onlyGuild = options.onlyGuild ?? false
		this.aliases = options.aliases || []
		this.cooldown = options.cooldown ?? 3

		this.cooldowns = new Map()

		this.botPermissions = []
		this.botChannelPermissions = []
		this.memberPermissions = []
		this.memberChannelPermissions = []

		this.HandlePermissions(options)
	}

	LostPermissions(
		AllPerms: PermissionResolvable[],
		member: GuildMember,
		channel?: ChannelResolvable
	): PermissionResolvable[] {
		const LostPerms: PermissionResolvable[] = []

		for (const Perm of AllPerms) {
			if (channel) {
				if (
					!member.permissionsIn(channel).has(Perm) &&
					!LostPerms.includes(Perm)
				)
					LostPerms.push(Perm)
			} else {
				if (!member.permissions.has(Perm) && !LostPerms.includes(Perm))
					LostPerms.push(Perm)
			}
		}

		return LostPerms
	}

	GetCooldown(context: ConverterContext | ConverterSlashContext): boolean {
		const Cooldown = this.cooldowns.get(context.user.id)
		if (Cooldown) return true

		this.cooldowns.set(context.user.id, {
			advised: true,
			date: this.cooldown * 1000 + Date.now()
		})

		setTimeout(() => {
			this.cooldowns.delete(context.user.id)
		}, this.cooldown * 1000)

		return false
	}

	private HandlePermissions(options: CommandOptions | SlashCommandOptions) {
		if (options.botPermissions && options.botPermissions.length) {
			this.botPermissions = options.botPermissions
		}

		if (this.botPermissions.length) {
			this.botChannelPermissions = [...this.botPermissions]

			if (options.botChannelPermissions?.length) {
				this.botChannelPermissions = [
					...this.botChannelPermissions,
					...options.botChannelPermissions
				]

				this.botChannelPermissions = Utils.DeleteDuplicate(
					this.botChannelPermissions
				)
			}
		}

		if (options.memberPermissions && options.memberPermissions.length) {
			this.memberPermissions = options.memberPermissions
		}

		if (this.memberPermissions.length) {
			this.memberChannelPermissions = [...this.memberPermissions]

			if (options.memberChannelPermissions?.length) {
				this.memberChannelPermissions = [
					...this.memberChannelPermissions,
					...options.memberChannelPermissions
				]

				this.memberChannelPermissions = Utils.DeleteDuplicate(
					this.memberChannelPermissions
				)
			}
		}
	}
}
