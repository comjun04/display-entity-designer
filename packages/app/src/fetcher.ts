import { CDNVersionAssetsUrl } from './constants'

export default async function fetcher(url: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return fetch(`${CDNVersionAssetsUrl}/${url}`).then((r) => r.json())
}
