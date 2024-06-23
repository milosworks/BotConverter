import { Command, Declare, Embed, type CommandContext } from 'seyfert'

@Declare({
	name: 'ping',
	description: 'Show the ping of the gateway',
	guildId: ['807241041425334323']
})
export default class PingCommand extends Command {
	async run(ctx: CommandContext) {
		await ctx.deferReply()

		const ping = ctx.client.gateway.latency
		const initMessagePing = Date.now()

		const m = await ctx.editOrReply({
			content: `Pong!`
		})
		if (!m) return

		await ctx.editOrReply({
			embeds: [
				new Embed()
					.setColor('Random')
					.setAuthor({
						name: ctx.author.username,
						iconUrl: ctx.author.avatarURL()
					})
					.setDescription(
						`🛰️ Gateway Ping: ${ping} ms\n✉️ Message Ping: ${
							initMessagePing - m.createdTimestamp
						} ms`
					)
			]
		})
	}
}
