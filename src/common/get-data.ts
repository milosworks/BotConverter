interface ContentType {
    file: string
    type: string
}

interface UrlData {
    buffer: Buffer
    contentType: ContentType
    convBuffer?: Buffer
}

function getContentType(header: string): ContentType {
    const types = header.split('/')
    
    return {
        file: types[0],
        type: types[1].split(';')[0]
    }
}

export async function getData(url: URL): Promise<UrlData> {
    const res = await fetch(url, {method: 'GET'})
    if (res.status !== 200) throw new Error(`An error ocurred fetching the url`)

    const header = res.headers.get('Content-Type')
    if (!header) throw new Error(`No content type`)
            
    const contentType = getContentType(header)
    if(contentType.type === 'html')throw new Error(`Tried to fetch html`)
                
    const buffer = Buffer.from(await res.arrayBuffer())
    
    return {
        buffer,
        contentType
    }
} 