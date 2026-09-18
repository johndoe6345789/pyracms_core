const INSTALLED_KEY = 'pyracms.launcher.installed'
const FAV_KEY = 'pyracms.launcher.favourites'

type Rec = Record<string, string>

function read(key: string): Rec {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as Rec) : {}
  } catch {
    return {}
  }
}

function write(key: string, v: Rec) {
  try {
    localStorage.setItem(key, JSON.stringify(v))
  } catch { /* ignore */ }
}

/** Per-browser convenience only; not a real install record. */
export const installedStore = {
  get: () => read(INSTALLED_KEY),
  set: (name: string, version: string) =>
    write(INSTALLED_KEY, { ...read(INSTALLED_KEY), [name]: version }),
  remove: (name: string) => {
    const cur = read(INSTALLED_KEY)
    delete cur[name]
    write(INSTALLED_KEY, cur)
  },
}

export const favouriteStore = {
  get: () => read(FAV_KEY),
  toggle: (name: string): Rec => {
    const cur = read(FAV_KEY)
    if (cur[name]) delete cur[name]
    else cur[name] = '1'
    write(FAV_KEY, cur)
    return cur
  },
}
