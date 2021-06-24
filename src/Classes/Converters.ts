import ax from 'axios'
import Extensions from 'file-type'
import isSvg from 'is-svg'
import svg2img_pre from 'node-svg2img'
import { promisify } from 'util'
import { MessageAttachment } from 'discord.js'
import Resize from '../Lib/gifresize.js'

const svg2img = promisify(svg2img_pre as any)

type AttachmentResolvable = string | MessageAttachment

interface EmojifyOBJ {
	type: string
	buffer: any
}

export class Converters {
	constructor() {
		throw new Error('This class cannot be instanced')
	}

	static ParseAttachmentResolvable(
		AttachmentOrString: AttachmentResolvable
	): string {
		if (AttachmentOrString instanceof MessageAttachment)
			return AttachmentOrString.url
		else {
			return AttachmentOrString
		}
	}

	static toPNG(src: AttachmentResolvable): MessageAttachment {
		const ToPNG = new MessageAttachment(
			Converters.ParseAttachmentResolvable(src),
			'image.png'
		)
		return ToPNG
	}

	static toGIF(src: AttachmentResolvable): MessageAttachment {
		const ToGIF = new MessageAttachment(
			Converters.ParseAttachmentResolvable(src),
			'image.gif'
		)
		return ToGIF
	}

	//Copied from https://github.com/AndreMor8/gidget/blob/master/src/commands/image/emojify.js
	static async toEmojify(src: string, resize = false): Promise<EmojifyOBJ> {
		const Res = await ax(src, {
			method: 'GET',
			responseType: 'arraybuffer'
		})
		if (Res.status !== 200)
			throw new Error('An error ocurred fetching the image')

		const LoadBuffer = Buffer.from(Res.data, 'binary')
		const Ext = await Extensions.fromBuffer(LoadBuffer)
		if (Ext?.mime === 'image/gif') {
			if (!resize) {
				return { type: 'gif', buffer: LoadBuffer }
			}

			const Buffer = await Resize({ width: 48, interlanced: true })(
				LoadBuffer
			)

			return { type: 'gif', buffer: Buffer }
		} else if (isSvg(LoadBuffer)) {
			const options = resize
				? {
						format: 'png',
						width: 48,
						height: 48
				  }
				: {
						format: 'png'
				  }

			const Buffer = await svg2img(LoadBuffer, options)

			return { type: 'svg', buffer: Buffer }
		} else if (process.platform === 'win32') {
			const { default: JIMP } = await import('jimp')
			const IMG = await JIMP.read(LoadBuffer)
			if (resize) IMG.resize(48, JIMP.AUTO)

			const Buffer = await IMG.getBufferAsync(JIMP.MIME_PNG)

			return { type: 'image', buffer: Buffer }
		} else {
			const { default: Sharp } = await import('sharp')
			const Buffer = await Sharp(LoadBuffer)
			if (resize) Buffer.resize(48)

			Buffer.png().toBuffer()

			return { type: 'image', buffer: Buffer }
		}
	}
}
