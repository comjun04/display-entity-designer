import { Grid } from '@react-three/drei'
import { type ThreeEvent } from '@react-three/fiber'
import { type FC } from 'react'
import { MathUtils } from 'three'

import { loadTextureImage } from '@/services/resources/material'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEditorStore } from '@/stores/editorStore'
import type { ModelFaceKey, PlayerHeadProperties } from '@/types'

function getPixelIntegerPos(pos: number) {
  return Math.floor((pos + 0.25) * 16)
}

type PlayerHeadPainterProps = {
  entityId: string
  playerHeadProperties: PlayerHeadProperties
}

const PlayerHeadPainter: FC<PlayerHeadPainterProps> = ({
  entityId,
  playerHeadProperties,
}) => {
  const handlePaint = (side: ModelFaceKey, x: number, y: number) => {
    // console.log(side, x, y)

    const f = async () => {
      const canvas = document.createElement('canvas')
      canvas.width = 64
      canvas.height = 64
      const ctx = canvas.getContext('2d')!

      const textureData = playerHeadProperties.texture

      if (textureData?.baked === false) {
        // load texture dataurl from properties obj, load it to canvas
        const imageData = new ImageData(64, 64)
        imageData.data.set(textureData.paintTexturePixels, 0)
        ctx.putImageData(imageData, 0, 0)
      } else {
        let image: HTMLImageElement
        if (textureData?.baked === true) {
          // load texture from cdn, and just load it to canvas
          ;({ image } = await loadTextureImage({
            type: 'player_head',
            playerHead: {
              baked: true,
              url: textureData.url,
            },
          })) // no resource fromVersion required on player_head
        } else {
          // load default steve texture to canvas
          ;({ image } = await loadTextureImage({
            type: 'vanilla',
            resourceLocation: 'entity/player/slim/steve',
          }))
        }

        // load it to canvas
        ctx.drawImage(image, 0, 0, 64, 16, 0, 0, 64, 16)
      }

      // draw
      let baseX: number
      let baseY: number
      switch (side) {
        case 'up':
          baseX = 8
          baseY = 0
          break

        case 'down':
          baseX = 16
          baseY = 0
          break

        case 'east':
          baseX = 0
          baseY = 8
          break

        case 'south':
          baseX = 8
          baseY = 8
          break

        case 'west':
          baseX = 16
          baseY = 8
          break

        case 'north':
          baseX = 24
          baseY = 8
          break
      }

      const shouldFlipY = side !== 'down'
      const pixelX = baseX + x
      const pixelY = baseY + (shouldFlipY ? 7 - y : y)

      const {
        headPainter: { brushColor },
      } = useEditorStore.getState()
      const brushColor_R = (brushColor >>> 16) & 0xff
      const brushColor_G = (brushColor >>> 8) & 0xff
      const brushColor_B = brushColor & 0xff
      const existingPixel = ctx.getImageData(pixelX, pixelY, 1, 1)
      if (
        existingPixel.data[0] === brushColor_R &&
        existingPixel.data[1] === brushColor_G &&
        existingPixel.data[2] === brushColor_B &&
        existingPixel.data[3] === 255
      ) {
        // console.log('no change needed')
        return
      }

      if (textureData?.baked === false) {
        useDisplayEntityStore
          .getState()
          .paintItemDisplayPlayerHeadTexture(
            entityId,
            brushColor,
            pixelX,
            pixelY,
          )
      } else {
        const imgData = ctx.createImageData(1, 1)
        imgData.data[0] = brushColor_R
        imgData.data[1] = brushColor_G
        imgData.data[2] = brushColor_B
        imgData.data[3] = 255

        ctx.putImageData(imgData, pixelX, pixelY)

        const finalImageData = ctx.getImageData(0, 0, 64, 64)

        useDisplayEntityStore
          .getState()
          .setItemDisplayPlayerHeadProperties(entityId, {
            texture: {
              baked: false,
              paintTexturePixels: Array.from(finalImageData.data),
            },
          })
      }
    }
    f().catch(console.error)
  }

  const handlePointerDown = (
    evt: ThreeEvent<PointerEvent>,
    face: ModelFaceKey,
  ) => {
    useEditorStore.getState().headPainter.setNowPainting(true)

    const localPos = evt.object.worldToLocal(evt.point.clone())
    handlePaint(
      face,
      getPixelIntegerPos(localPos.x),
      getPixelIntegerPos(localPos.y),
    )
  }
  const handlePointerMove = (face: ModelFaceKey, x: number, y: number) => {
    // handlePaint() loads texture as image and processes it when not unbaked state
    // which lags if we call multiple times
    // since pointermove event can be called multiple times when mouse/touchpoint moves, so just block it
    if (playerHeadProperties.texture?.baked !== false) return

    const {
      headPainter: { nowPainting: headPainting },
    } = useEditorStore.getState()
    if (headPainting) {
      handlePaint(face, x, y)
    }
  }

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
          rotation={[MathUtils.degToRad(-90), 0, MathUtils.degToRad(180)]}
          onClick={(evt) => {
            const localPos = evt.object.worldToLocal(evt.point.clone())
            handlePaint(
              'up',
              getPixelIntegerPos(localPos.x),
              getPixelIntegerPos(localPos.y),
            )
          }}
          onPointerDown={(evt) => handlePointerDown(evt, 'up')}
          onPointerMove={(evt) => {
            const localPos = evt.object.worldToLocal(evt.point.clone())
            handlePointerMove(
              'up',
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
          rotation={[MathUtils.degToRad(-90), 0, MathUtils.degToRad(180)]}
          onClick={(evt) => {
            const localPos = evt.object.worldToLocal(evt.point.clone())
            handlePaint(
              'down',
              getPixelIntegerPos(localPos.x),
              getPixelIntegerPos(localPos.y),
            )
          }}
          onPointerDown={(evt) => handlePointerDown(evt, 'down')}
          onPointerMove={(evt) => {
            const localPos = evt.object.worldToLocal(evt.point.clone())
            handlePointerMove(
              'down',
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
          rotation={[MathUtils.degToRad(-90), 0, MathUtils.degToRad(180)]}
          onClick={(evt) => {
            const localPos = evt.object.worldToLocal(evt.point.clone())
            handlePaint(
              'south',
              getPixelIntegerPos(localPos.x),
              getPixelIntegerPos(localPos.y),
            )
          }}
          onPointerDown={(evt) => handlePointerDown(evt, 'south')}
          onPointerMove={(evt) => {
            const localPos = evt.object.worldToLocal(evt.point.clone())
            handlePointerMove(
              'south',
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
          rotation={[MathUtils.degToRad(-90), 0, MathUtils.degToRad(0)]}
          onClick={(evt) => {
            const localPos = evt.object.worldToLocal(evt.point.clone())
            handlePaint(
              'north',
              getPixelIntegerPos(localPos.x),
              getPixelIntegerPos(localPos.y),
            )
          }}
          onPointerDown={(evt) => handlePointerDown(evt, 'north')}
          onPointerMove={(evt) => {
            const localPos = evt.object.worldToLocal(evt.point.clone())
            handlePointerMove(
              'north',
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
          rotation={[MathUtils.degToRad(-90), 0, MathUtils.degToRad(90)]}
          onClick={(evt) => {
            const localPos = evt.object.worldToLocal(evt.point.clone())
            handlePaint(
              'east',
              getPixelIntegerPos(localPos.x),
              getPixelIntegerPos(localPos.y),
            )
          }}
          onPointerDown={(evt) => handlePointerDown(evt, 'east')}
          onPointerMove={(evt) => {
            const localPos = evt.object.worldToLocal(evt.point.clone())
            handlePointerMove(
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
          rotation={[MathUtils.degToRad(-90), 0, MathUtils.degToRad(-90)]}
          onClick={(evt) => {
            const localPos = evt.object.worldToLocal(evt.point.clone())
            handlePaint(
              'west',
              getPixelIntegerPos(localPos.x),
              getPixelIntegerPos(localPos.y),
            )
          }}
          onPointerDown={(evt) => handlePointerDown(evt, 'west')}
          onPointerMove={(evt) => {
            const localPos = evt.object.worldToLocal(evt.point.clone())
            handlePointerMove(
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
