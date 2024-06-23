const { config, GatewayIntentBits } = require('seyfert')

module.exports = config.bot({
	token: process.env.TOKEN ?? '',
	intents: [
		'DirectMessages',
		'GuildIntegrations',
		'GuildMessages',
		'GuildWebhooks',
		'MessageContent'
	],
	locations: {
		base: 'src',
		output: 'src',
		commands: 'commands',
		events: 'events'
	}
})
