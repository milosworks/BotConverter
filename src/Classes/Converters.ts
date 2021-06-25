import ax from 'axios'
import Extensions from 'file-type'
import isSvg from 'is-svg'
import svg2img_pre from 'node-svg2img'
import { promisify } from 'util'
import Resize from '../Lib/gifresize.js'

const svg2img = promisify(svg2img_pre as any)

interface BufferOBJ {
	type: string
	buffer: any
}

interface EmojifyOptions {
	width: number
	height: number
}

export default new (class Converters {
	constructor() {}

	//Copied from https://github.com/AndreMor8/gidget/blob/master/src/commands/image/emojify.js
	async GetImageBuffer(
		Src: string,
		Additions?: EmojifyOptions
	): Promise<BufferOBJ> {
		const Res = await ax(Src, {
			method: 'GET',
			responseType: 'arraybuffer'
		})
		if (Res.status !== 200)
			throw new Error('An error ocurred fetching the image')

		const LoadBuffer = Buffer.from(Res.data, 'binary')
		const Ext = await Extensions.fromBuffer(LoadBuffer)
		if (Ext?.mime === 'image/gif') {
			if (!Additions?.width) {
				return { type: 'gif', buffer: LoadBuffer }
			}

			const Buffer = await Resize({
				width: Additions.width,
				interlanced: true
			})(LoadBuffer)

			return { type: 'gif', buffer: Buffer }
		} else if (isSvg(LoadBuffer)) {
			const options = {
				format: 'png',
				width: Additions?.width,
				height: Additions?.height
			}

			const Buffer = await svg2img(LoadBuffer, options)

			return { type: 'svg', buffer: Buffer }
		} else if (process.platform === 'win32') {
			const { default: JIMP } = await import('jimp')
			const IMG = await JIMP.read(LoadBuffer)
			if (Additions?.width) IMG.resize(Additions.width, JIMP.AUTO)

			const Buffer = await IMG.getBufferAsync(JIMP.MIME_PNG)

			return { type: 'image', buffer: Buffer }
		} else {
			const { default: Sharp } = await import('sharp')
			const Buffer = await Sharp(LoadBuffer)
			if (Additions?.width)
				Buffer.resize(Additions.width, Additions.height)

			Buffer.png().toBuffer()

			return { type: 'image', buffer: Buffer }
		}
	}
})()
