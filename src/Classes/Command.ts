import { ConverterClient } from './ConverterClient'
import { CommandOptions, BaseCommand } from './BaseCommand'
import { ConverterContext } from './ConverterContext'
import {
	ChannelResolvable,
	GuildMember,
	PermissionResolvable
} from 'discord.js'

export class Command extends BaseCommand {
	constructor(Client: ConverterClient, options: CommandOptions) {
		super(Client, options)
	}

	canRun(context: ConverterContext): any {
		const isDev = context.config.devs?.includes(context.user.id)

		if (!context.msg.guild && this.onlyGuild) {
			return context
				.embedRes('This command can only runned in a guild!', 'error')
				.catch(() => true)
		} else if (
			!context.msg.guild?.me?.permissions.has('SEND_MESSAGES') ||
			!context.msg.guild.me
				.permissionsIn(context.channel)
				.has('SEND_MESSAGES')
		) {
			try {
				if (
					context.msg.guild?.me?.permissions.has('ADD_REACTIONS') &&
					context.msg.guild.me
						.permissionsIn(context.channel)
						.has('ADD_REACTIONS')
				) {
					context.msg.react('✍️')
					context.msg.react('❌')
				} else {
					context.user.send({
						embeds: [
							context.embedRes(
								'I cant talk in that channel!',
								'info',
								false
							)
						]
					})
				}
			} catch (e) {
				return true
			}
		} else if (this.dev && !isDev)
			return context.embedRes(
				'This command is only for developers',
				'error'
			)
		else if (!this.status && !isDev)
			return context.embedRes('This command is disabled', 'error')
		else if (this.GetCooldown(context)) {
			const Cooldown = this.cooldowns.get(context.user.id)
			if (!Cooldown) return true
			if (Cooldown.advised) return true

			const TimeLeft = ((Cooldown?.date as number) - Date.now()) / 1000

			Cooldown.advised = true
			return context.embedRes(
				`Tienes que esperar **${TimeLeft.toFixed(
					1
				)}s** para usar el comando`,
				'error'
			)
		} else if (this.botPermissions.length) {
			if (
				!this.botPermissions.some((x) =>
					context.guild?.me?.permissions.has(x)
				)
			) {
				return context.embedRes(
					`Me faltan estos permisos: \`${this.LostPermissions(
						this.botPermissions,
						context.guild?.me as GuildMember
					)}\``
				)
			} else if (this.botChannelPermissions.length) {
				return context.embedRes(
					`Me faltan estos permisos en este canal: \`${this.LostPermissions(
						this.botChannelPermissions,
						context.guild?.me as GuildMember,
						context.channel
					)}\``
				)
			}
		} else if (this.memberPermissions) {
			if (
				!this.memberPermissions.some((x) =>
					context.guild?.me?.permissions.has(x)
				)
			) {
				return context.embedRes(
					`Te faltan estos permisos: \`${this.LostPermissions(
						this.memberPermissions,
						context.guild?.me as GuildMember
					)}\``
				)
			} else if (this.memberChannelPermissions.length) {
				return context.embedRes(
					`Te faltan estos permisos en este canal: \`${this.LostPermissions(
						this.memberChannelPermissions,
						context.guild?.me as GuildMember,
						context.channel
					)}\``
				)
			}
		}

		return false
	}

	private LostPermissions(
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

	private GetCooldown(context: ConverterContext): boolean {
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
}
