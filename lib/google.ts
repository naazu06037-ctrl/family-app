export const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

function createOAuth2Client() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { google } = require('googleapis')
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

export const getAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    access_type: 'offline',
    prompt: 'consent',
    state: 'family-app-csrf-token',
    include_granted_scopes: 'true',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export const getTokensFromCode = async (code: string) => {
  const client = createOAuth2Client()
  const { tokens } = await client.getToken(code)
  return tokens
}

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
  description?: string
}

export const getTodayEvents = async (
  accessToken: string,
  refreshToken: string,
  onNewAccessToken?: (token: string) => Promise<void>
): Promise<CalendarEvent[]> => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { google } = require('googleapis')
  const client = createOAuth2Client()
  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  if (onNewAccessToken) {
    client.on('tokens', async (tokens: { access_token?: string }) => {
      if (tokens.access_token) {
        await onNewAccessToken(tokens.access_token)
      }
    })
  }

  const calendar = google.calendar({ version: 'v3', auth: client })

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  })

  const events = response.data.items || []

  return events.map((event: {
    id?: string
    summary?: string
    start?: { dateTime?: string; date?: string }
    end?: { dateTime?: string; date?: string }
    description?: string
  }) => ({
    id: event.id || '',
    title: event.summary || '(タイトルなし)',
    start: event.start?.dateTime || event.start?.date || '',
    end: event.end?.dateTime || event.end?.date || '',
    allDay: !event.start?.dateTime,
    description: event.description || '',
  }))
}

