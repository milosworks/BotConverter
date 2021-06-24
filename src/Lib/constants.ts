import { KufaConsole } from 'kufa'
import { config as InitializeENV } from 'dotenv'

if (!process.env.TOKEN) InitializeENV()

export const Client = {
	prefix: '&',
	support: 'https://discord.gg/gc2rRwVFUF',
	invite: process.env.INVITE
}

export const console = new KufaConsole({
	timeZone: 'America/Mexico_City',
	onlyHours: true,
	format: '[§a%time%§r] [%prefix%§r] %message% §b%memory%§r',
	log_prefix: '§2LOG',
	warn_prefix: '§6WARN',
	error_prefix: '§4ERROR',
	depth: Infinity,
	parser: (ctx) => {
		if (ctx.type === 'error') {
			// Copied from kufa/src/Utils
			const date = new Date()
			let parsed = date.toLocaleString('es-MX', {
				timeZone: 'America/Mexico_City'
			})
			parsed = parsed.replace(/(AM|PM|,)/gim, ' ')
			parsed = parsed
				.split(' ')
				.filter((x) => x.length > 0)
				.join(' ')
			ctx.time = parsed
			ctx.format = `[§a%time%§r] [%prefix%§r] %message% ${ctx.trace} %memory%`
		}
	}
})

export const Colors = {
	error: 0xcc0000,
	success: 0x00890b,
	info: 0xd1a428,
	good: 0x2ecc71
}

export const Emojis = {
	error: '<:error:822476382768201810>',
	good: '<:good:822477659497562142>',
	info: '<:info:822475639562174464>'
}
