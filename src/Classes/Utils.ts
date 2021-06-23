export class Utils {
	constructor() {
		throw new Error('This class cannot be instanced')
	}

	static DeleteDuplicate<T = any>(ArrayToChange: T[]): T[] {
		const FinalArray: any[] = []

		for (const Element of ArrayToChange) {
			if (FinalArray.includes(Element)) continue

			FinalArray.push(Element)
		}

		return FinalArray
	}
}
