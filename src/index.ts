import { ConverterClient } from './Classes/ConverterClient'
import { Handlers } from './Classes/Handlers'
import './Typings'

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
