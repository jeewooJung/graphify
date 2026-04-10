import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { BACKEND_API_URL } from '@/lib/api/backend-url'
import { AUTH_TOKEN_COOKIE } from '@/lib/auth/session'

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params
  const cookieStore = await cookies()
  const authToken = cookieStore.get(AUTH_TOKEN_COOKIE)?.value
  const search = request.nextUrl.search
  const backendUrl = `${BACKEND_API_URL}/${path.join('/')}${search}`

  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('cookie')
  headers.delete('content-length')

  if (authToken && !headers.has('authorization')) {
    headers.set('authorization', `Bearer ${authToken}`)
  }

  const requestInit: RequestInit = {
    method: request.method,
    headers,
    cache: 'no-store',
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    requestInit.body = await request.text()
  }

  const backendResponse = await fetch(backendUrl, requestInit)
  const responseHeaders = new Headers(backendResponse.headers)

  responseHeaders.delete('content-encoding')
  responseHeaders.delete('content-length')
  responseHeaders.delete('transfer-encoding')

  return new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    headers: responseHeaders,
  })
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context)
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context)
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context)
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context)
}
