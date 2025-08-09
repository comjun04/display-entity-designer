export interface ProfileLookupResult {
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

// base64 decoded value from PlayerSkinQueryResult
export interface TextureValue {
  timestamp: number
  profileId: string // player uuid
  profileName: string // player username
  signatureRequired: boolean | undefined
  textures: {
    SKIN: {
      url: string
      metadata: {
        model: 'slim' | undefined // wide skin = undefined
      } | undefined
    } | undefined
    CAPE: {
      url: string
    } | undefined
  }
}
