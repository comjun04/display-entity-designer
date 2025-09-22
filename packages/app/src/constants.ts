export const CDNBaseUrl = import.meta.env.VITE_CDN_BASE_URL

export const BackendHost = import.meta.env.VITE_BACKEND_HOST

export const GameVersions = [
  {
    id: '1.21.7',
    label: '1.21.7 ~ 1.21.8',
  },
  {
    id: '1.21.6',
    label: '1.21.6',
  },
  {
    id: '1.21.5',
    label: '1.21.5',
  },
  {
    id: '1.21.4',
    label: '1.21.4',
  },
  {
    id: '1.21.2',
    label: '1.21.2 ~ 1.21.3',
  },
  {
    id: '1.21',
    label: '1.21 ~ 1.21.1',
  },
  {
    id: '1.20.5',
    label: '1.20.5 ~ 1.20.6',
  },
  {
    id: '1.20.3',
    label: '1.20.3 ~ 1.20.4',
  },
  {
    id: '1.20.2',
    label: '1.20.2',
  },
  {
    id: '1.20',
    label: '1.20 ~ 1.20.1',
  },
  {
    id: '1.19.4',
    label: '1.19.4',
  },
]
export const LegacyHardcodedGameVersion = '1.21'
export const LatestGameVersion = GameVersions[0].id
