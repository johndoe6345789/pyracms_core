import type { SvgIconComponent } from '@mui/icons-material'

export interface IconEntry {
  /** What the menu stores: the Material icon's name, e.g. TrainOutlined */
  name: string
  label: string
  Icon: SvgIconComponent
}

export interface IconCategory {
  title: string
  icons: IconEntry[]
}

/** "DirectionsRailwayOutlined" -> "Directions Railway". */
const labelOf = (name: string) =>
  name
    .replace(/Outlined$/, '')
    .replace(/(?<=[a-z])(?=[A-Z])/g, ' ')
    .replace(/\d+$/, '')

export const entry = (name: string, Icon: SvgIconComponent): IconEntry => ({
  name,
  label: labelOf(name),
  Icon,
})
