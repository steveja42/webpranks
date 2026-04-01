import type { Handler, HandlerEvent } from '@netlify/functions'

const GC_ENDPOINT = 'https://4242.goatcounter.com/count'

export const handler: Handler = async (event: HandlerEvent) => {
	const targetUrl = event.rawQuery
		? `${GC_ENDPOINT}?${event.rawQuery}`
		: GC_ENDPOINT

	const headers: Record<string, string> = {
		'Content-Type': event.headers['content-type'] ?? 'application/json',
		'User-Agent': event.headers['user-agent'] ?? 'netlify-proxy',
	}

	const clientIp = event.headers['x-forwarded-for'] ?? event.headers['client-ip']
	if (clientIp) headers['X-Forwarded-For'] = clientIp

	const fetchOptions: RequestInit = {
		method: event.httpMethod,
		headers,
	}

	if (event.httpMethod === 'POST' && event.body) {
		fetchOptions.body = event.isBase64Encoded
			? Buffer.from(event.body, 'base64').toString('utf-8')
			: event.body
	}

	const response = await fetch(targetUrl, fetchOptions)
	const responseBody = await response.text()

	return { statusCode: response.status, body: responseBody }
}
