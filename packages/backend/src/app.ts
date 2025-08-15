import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { requestId } from 'hono/request-id'
import { nanoid } from 'nanoid'

import {
  PlayerSkinQueryResult,
  ProfileLookupResult,
  TextureValue,
} from './types'
import { getConnInfoFn } from './platform-dependent'

const app = new Hono()

app.use(
  requestId({
    generator: () => nanoid(32),
  }),
)
app.use(async (c, next) => {
  const getConnInfo = await getConnInfoFn()
  const conninfo = await getConnInfo(c)

  const origFn = logger((msg, ...rest) => {
    console.log(
      msg,
      { reqId: c.get('requestId'), remote: conninfo.remote.address },
      ...rest,
    )
  })
  await origFn(c, next)
})

app.use(
  '/*',
  cors({
    origin: (process.env.CORS_ORIGINS ?? '')
      .split(',')
      .map((item) => item.trim()),
    allowMethods: ['GET'],
    maxAge: 3600,
  }),
)

app.get('/v1/skin/:usernameOrUuid', async (c) => {
  const { usernameOrUuid } = c.req.param()

  let type: 'username' | 'uuid'
  if (/^[a-z0-9_]{3,16}$/gi.test(usernameOrUuid)) {
    type = 'username'
  } else if (
    /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/gi.test(
      usernameOrUuid,
    )
  ) {
    type = 'uuid'
  } else {
    c.status(400)
    return c.json({ error: 'Invalid username or uuid' })
  }

  let uuid: string
  if (type === 'username') {
    const profileLookupResponse = await fetch(
      `https://api.minecraftservices.com/minecraft/profile/lookup/name/${usernameOrUuid}`,
    )
    if (profileLookupResponse.status === 404) {
      c.status(404)
      return c.json({ error: 'Player not found' })
    } else if (!profileLookupResponse.ok) {
      console.error(await profileLookupResponse.json())
      throw new Error('Unexpected')
    }

    const profileLookupData =
      (await profileLookupResponse.json()) as ProfileLookupData
    console.log(profileLookupData)
    uuid = profileLookupData.id
  } else {
    uuid = usernameOrUuid
  }

  uuid = uuid.replaceAll('-', '')

  const skinQueryResult = (await fetch(
    `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`,
  ).then((res) => res.json())) as PlayerSkinQueryResult
  const textureValue = JSON.parse(
    Buffer.from(skinQueryResult.properties[0].value, 'base64').toString(),
  ) as TextureValue

  return c.json({
    id: skinQueryResult.id,
    name: skinQueryResult.name,
    skinUrl: textureValue.textures.SKIN?.url ?? null,
  })
})

export default app
