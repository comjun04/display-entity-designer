import { CDNVersionAssetsUrl } from './constants'

export default async function fetcher(url: string) {
  const slashPrefixedUrl = url.length > 0 && url[0] !== '/' ? `/${url}` : url

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return fetch(`${CDNVersionAssetsUrl}${slashPrefixedUrl}`).then((r) => r.json())
}
