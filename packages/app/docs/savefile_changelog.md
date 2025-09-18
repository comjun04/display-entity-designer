# Save file format changelog

### Version `3`

- Add `targetGameVersion` root field
  - Indicates which Minecraft version this project is targetting at (used for block/item list, feature flags etc)
  - older projects which does not have this field will use `1.21`

### Version `2`

- Add `playerHeadProperties` field in `ItemDisplay`
  - This field is only present if entity.type is `player_head`

```ts
interface PlayerHeadProperties {
  texture:
    | {
        baked: true
        url: string
      }
    | {
        baked: false
      }
    | null
}
```

### Version `1`

- Add text display data

### Version `0` (v1.0.0+)

- Initial version
- Add block display, item display and group data
