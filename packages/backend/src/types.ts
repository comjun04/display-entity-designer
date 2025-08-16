export type {
  TextureValue,
  BackendAPIV1GetPlayerSkinResponse,
} from '@depl/shared'

export interface ProfileLookupData {
  id: string // player uuid
  name: string // player username
}

export interface PlayerSkinQueryResult {
  id: string // uuid
  name: string // player username
  properties: {
    name: string
    signature: string | undefined
    value: string // base64 encoded
  }[]
}

// TextureValue = base64 decoded value from PlayerSkinQueryResult
