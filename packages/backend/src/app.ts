import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { PlayerSkinQueryResult, ProfileLookupResult, TextureValue } from './types'

const app = new Hono()

app.use('/*', cors({
  origin: (process.env.CORS_ORIGINS ?? '').split(',').map(item => item.trim()),
  allowMethods: ['GET'],
  maxAge: 3600
}))

app.get('/v1/skin/:usernameOrUuid', async (c) => {
  const { usernameOrUuid } = c.req.param()

  let type: 'username' | 'uuid'
  if (/^[a-z0-9_]{3,16}$/gi.test(usernameOrUuid)) {
    type = 'username'
  } else if (/^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/gi.test(usernameOrUuid)) {
    type = 'uuid'
  } else {
    c.status(400)
    return c.json({ error: 'Invalid username or uuid' })
  }

  let uuid: string
  if (type === 'username') {
    const profileLookupResult = await fetch(`https://api.minecraftservices.com/minecraft/profile/lookup/name/${usernameOrUuid}`).then(res => res.json()) as ProfileLookupResult
    uuid = profileLookupResult.id
  } else {
    uuid = usernameOrUuid
  }

  uuid = uuid.replaceAll('-', '')

  const skinQueryResult = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`).then(res => res.json()) as PlayerSkinQueryResult
  const textureValue = JSON.parse(Buffer.from(skinQueryResult.properties[0].value, 'base64').toString()) as TextureValue

  return c.json({
    id: skinQueryResult.id,
    name: skinQueryResult.name,
    skinUrl: textureValue.textures.SKIN?.url ?? null
  })
})

export default app
