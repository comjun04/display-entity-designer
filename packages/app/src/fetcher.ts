export default async function fetcher(url: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return fetch(`${import.meta.env.VITE_CDN_BASE_URL}${url}`).then((r) =>
    r.json(),
  )
}
