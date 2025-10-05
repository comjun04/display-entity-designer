import { Grid } from '@react-three/drei'
import { type FC, useCallback } from 'react'
import { ImageLoader, MathUtils } from 'three'

import { loadTextureImage } from '@/services/resources/material'
import type { ModelFaceKey, PlayerHeadProperties } from '@/types'

const imageLoader = new ImageLoader()

function getPixelIntegerPos(pos: number) {
  return Math.floor((pos + 0.25) * 16)
}

type PlayerHeadPainterProps = {
  playerHeadProperties: PlayerHeadProperties
}

const PlayerHeadPainter: FC<PlayerHeadPainterProps> = ({
  playerHeadProperties,
}) => {
  const handlePaint = useCallback(
    (side: ModelFaceKey, x: number, y: number) => {
      console.log(side, x, y)

      const f = async () => {
        let paintTexture: string
        const textureData = playerHeadProperties.texture

        let image: HTMLImageElement
        if (textureData?.baked === true) {
          // load texture from cdn, and just load it to canvas
          ;({ image } = await loadTextureImage({
            type: 'player_head',
            playerHeadTextureUrl: textureData.url,
          })) // no resource fromVersion required on player_head
        } else if (textureData?.baked === false) {
          // load texture dataurl from properties obj, load it to canvas
          image = await imageLoader.loadAsync(textureData.paintTexture)
        } else {
          // load default steve texture to canvas
          ;({ image } = await loadTextureImage({
            type: 'vanilla',
            resourceLocation: 'entity/player/slim/steve',
          }))
        }

        // load it to canvas
        const canvas = document.createElement('canvas')
        canvas.width = 64
        canvas.height = 16
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(image, 0, 0, 64, 16, 0, 0, 64, 16)

        // TODO: draw
      }
      f().catch(console.error)
    },
    [playerHeadProperties],
  )

  return (
    <>
      {/* top */}
      <group position={[0, 0.0001, 0]}>
        <Grid
          args={[0.5, 0.5]}
          cellSize={0.5 / 8}
          cellThickness={1}
          cellColor="#ffffff"
          sectionSize={0}
        />
        <mesh
          rotation={[MathUtils.degToRad(-90), 0, MathUtils.degToRad(-90)]}
          onClick={(evt) => {
            const localPos = evt.object.worldToLocal(evt.point.clone())
            handlePaint(
              'top',
              getPixelIntegerPos(localPos.x),
              getPixelIntegerPos(localPos.y),
            )
          }}
        >
          <planeGeometry args={[0.5, 0.5]} />
          <meshBasicMaterial transparent opacity={0} alphaTest={0.01} />
        </mesh>
      </group>

      {/* bottom */}
      <group
        position={[0, -(0.5 + 0.0001), 0]}
        rotation={[MathUtils.degToRad(180), 0, 0]}
      >
        <Grid
          args={[0.5, 0.5]}
          cellSize={0.5 / 8}
          cellThickness={1}
          cellColor="#ffffff"
          sectionSize={0}
        />
        <mesh
          rotation={[MathUtils.degToRad(-90), 0, 0]}
          onClick={(evt) => {
            const localPos = evt.object.worldToLocal(evt.point.clone())
            handlePaint(
              'bottom',
              getPixelIntegerPos(localPos.x),
              getPixelIntegerPos(localPos.y),
            )
          }}
        >
          <planeGeometry args={[0.5, 0.5]} />
          <meshBasicMaterial transparent opacity={0} alphaTest={0.01} />
        </mesh>
      </group>

      {/* front (south) */}
      <group
        position={[0, -0.25, -(0.25 + 0.0001)]}
        rotation={[MathUtils.degToRad(-90), 0, 0]}
      >
        <Grid
          args={[0.5, 0.5]}
          cellSize={0.5 / 8}
          cellThickness={1}
          cellColor="#ffffff"
          sectionSize={0}
        />
        <mesh
          rotation={[MathUtils.degToRad(-90), 0, MathUtils.degToRad(90)]}
          onClick={(evt) => {
            const localPos = evt.object.worldToLocal(evt.point.clone())
            handlePaint(
              'front',
              getPixelIntegerPos(localPos.x),
              getPixelIntegerPos(localPos.y),
            )
          }}
        >
          <planeGeometry args={[0.5, 0.5]} />
          <meshBasicMaterial transparent opacity={0} alphaTest={0.01} />
        </mesh>
      </group>

      {/* back (north) */}
      <group
        position={[0, -0.25, 0.25 + 0.0001]}
        rotation={[MathUtils.degToRad(90), 0, 0]}
      >
        <Grid
          args={[0.5, 0.5]}
          cellSize={0.5 / 8}
          cellThickness={1}
          cellColor="#ffffff"
          sectionSize={0}
        />
        <mesh
          rotation={[MathUtils.degToRad(-90), 0, MathUtils.degToRad(-90)]}
          onClick={(evt) => {
            const localPos = evt.object.worldToLocal(evt.point.clone())
            handlePaint(
              'back',
              getPixelIntegerPos(localPos.x),
              getPixelIntegerPos(localPos.y),
            )
          }}
        >
          <planeGeometry args={[0.5, 0.5]} />
          <meshBasicMaterial transparent opacity={0} alphaTest={0.01} />
        </mesh>
      </group>

      {/* east */}
      <group
        position={[0.25 + 0.0001, -0.25, 0]}
        rotation={[0, 0, MathUtils.degToRad(-90)]}
      >
        <Grid
          args={[0.5, 0.5]}
          cellSize={0.5 / 8}
          cellThickness={1}
          cellColor="#ffffff"
          sectionSize={0}
        />
        <mesh
          rotation={[MathUtils.degToRad(-90), 0, 0]}
          onClick={(evt) => {
            const localPos = evt.object.worldToLocal(evt.point.clone())
            handlePaint(
              'east',
              getPixelIntegerPos(localPos.x),
              getPixelIntegerPos(localPos.y),
            )
          }}
        >
          <planeGeometry args={[0.5, 0.5]} />
          <meshBasicMaterial transparent opacity={0} alphaTest={0.01} />
        </mesh>
      </group>

      {/* west */}
      <group
        position={[-(0.25 + 0.0001), -0.25, 0]}
        rotation={[0, 0, MathUtils.degToRad(90)]}
      >
        <Grid
          args={[0.5, 0.5]}
          cellSize={0.5 / 8}
          cellThickness={1}
          cellColor="#ffffff"
          sectionSize={0}
        />
        <mesh
          rotation={[MathUtils.degToRad(-90), 0, MathUtils.degToRad(180)]}
          onClick={(evt) => {
            const localPos = evt.object.worldToLocal(evt.point.clone())
            handlePaint(
              'west',
              getPixelIntegerPos(localPos.x),
              getPixelIntegerPos(localPos.y),
            )
          }}
        >
          <planeGeometry args={[0.5, 0.5]} />
          <meshBasicMaterial transparent opacity={0} alphaTest={0.01} />
        </mesh>
      </group>
    </>
  )
}

export default PlayerHeadPainter
