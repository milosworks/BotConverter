import { ConverterClient } from './Classes/ConverterClient.js'
import { Handlers } from './Classes/Handlers.js'
import './Lib/console.js'

const Client = new ConverterClient({
	intents: [13825],
	messageCacheMaxSize: 25,
	messageCacheLifetime: 60 * 5,
	messageSweepInterval: 60,
	allowedMentions: { repliedUser: true, parse: ['roles', 'everyone'] },
	http: {
		version: 7
	}
})

new Handlers(Client)
