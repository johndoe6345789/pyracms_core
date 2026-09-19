/** Downloads an object as a formatted JSON file. */
export function downloadJson(data: object, filename: string) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** Builds the stub settings export payload. */
export function buildSettingsPayload() {
  return {
    exportType: 'settings',
    exportedAt: new Date().toISOString(),
    data: {
      site_name: 'PyraCMS',
      site_description: 'A modern multi-tenant CMS',
      max_upload_size: '10485760',
      default_language: 'en',
      smtp_host: 'smtp.example.com',
      smtp_port: '587',
      registration_enabled: 'true',
    },
  }
}

const item = (
  name: string,
  route: string,
  position: number,
  permissions = 'public',
) => ({ name, route, position, permissions })

/** Builds the stub menus export payload. */
export function buildMenusPayload() {
  return {
    exportType: 'menus',
    exportedAt: new Date().toISOString(),
    data: [
      {
        name: 'main',
        items: [
          item('Home', '/', 0),
          item('Articles', '/articles', 1),
          item('Forum', '/forum', 2, 'authenticated'),
        ],
      },
      {
        name: 'footer',
        items: [
          item('About', '/about', 0),
          item('Contact', '/contact', 1),
        ],
      },
    ],
  }
}

/** Parses an import file, returning a success message. */
export function parseImport(text: string): string {
  const parsed = JSON.parse(text)
  if (!parsed || typeof parsed !== 'object'
    || !parsed.exportType || !parsed.data) {
    throw new Error('Invalid format')
  }
  return `Successfully imported ${parsed.exportType} data.`
}
