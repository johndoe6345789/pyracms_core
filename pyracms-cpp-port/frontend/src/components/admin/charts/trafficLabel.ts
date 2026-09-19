/** Builds the pie slice label text. */
export const renderLabel = ({
  name,
  percent,
}: {
  name: string
  percent: number
}) => `${name} ${(percent * 100).toFixed(0)}%`
