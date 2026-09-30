// "New Delhi (NDLS)" -> "NDLS"; falls back to the full string when there's no code in brackets
export const stationCode = (station: string): string =>
  station.match(/\(([^)]+)\)/)?.[1] ?? station;
