import { KufaConsole } from 'kufa'

export const Client = {
	prefix: 'cb.',
	support: 'https://discord.gg/gc2rRwVFUF'
}

export const console = new KufaConsole({
	timeZone: 'America/Mexico_City',
	onlyHours: true,
	traceFun: true,
	format: '[§a%time%§r] [%prefix%§r] %message% %trace% %memory%',
	log_prefix: '§2LOG',
	warn_prefix: '§6WARN',
	error_prefix: '§4ERROR',
	depth: Infinity,
	parser: (ctx) => {
		if (ctx.str.includes('error')) {
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
			ctx.format = '[§a%time%§r] [%prefix%§r] %message% %trace% %memory%'
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
