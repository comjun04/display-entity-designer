import { Grid, PerspectiveCamera } from '@react-three/drei'
import { Canvas, invalidate } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import { FC, useEffect, useRef } from 'react'
import { Color } from 'three'

import CustomCameraControls from './CustomCameraControls'
import DisplayentitiesRootGroup from './components/DisplayEntitiesRootGroup'
import DragSelectControl from './components/DragSelectControl'
import ShortcutHandler from './components/ShortcutHandler'
import TransformControls from './components/TransformControls'
import { useDisplayEntityStore } from './stores/displayEntityStore'
import { useEditorStore } from './stores/editorStore'

const Scene: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const perfMonitorEnabled = useEditorStore(
    (state) => state.settings.debug.perfMonitorEnabled,
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const preventDefault = (e: TouchEvent) => e.preventDefault()

    canvas.addEventListener('touchmove', preventDefault, { passive: false })
    canvas.addEventListener('gesturestart', preventDefault, { passive: false }) // For Safari

    return () => {
      canvas.removeEventListener('touchmove', preventDefault)
      canvas.removeEventListener('gesturestart', preventDefault)
    }
  }, [])

  return (
    <Canvas
      ref={canvasRef}
      // r3f-perf requires frameloop 'always' to work properly
      frameloop={perfMonitorEnabled ? 'always' : 'demand'}
      scene={{
        background: new Color(0x222222),
      }}
      style={{
        touchAction: 'none',
      }}
      onPointerDown={() => {
        // frameloop="demand"일 경우 가끔 TransformControls가 작동하지 않는 경우가 발생하는데
        // 이를 방지하기 위해 클릭 시 강제로 다음 프레임 렌더링하도록 하여 다시 작동하도록 고치기
        invalidate()
      }}
      onPointerMissed={() => {
        useDisplayEntityStore.getState().setSelected([])
      }}
    >
      {/* Axis lines */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-100, 0, 0, 100, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0xff0000} />
      </line>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, -100, 0, 0, 100, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0x00ff00} />
      </line>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, -100, 0, 0, 100])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0x0000ff} />
      </line>

      <DisplayentitiesRootGroup />

      <TransformControls />
      <DragSelectControl />

      <ShortcutHandler />

      <ambientLight intensity={1.7} color={0xffffff} />
      <directionalLight position={[0, 10, 6]} />
      <directionalLight position={[0, 10, -6]} />

      <PerspectiveCamera makeDefault position={[3, 3, 3]}>
        <CustomCameraControls />
      </PerspectiveCamera>

      <Grid
        cellSize={1 / 16}
        cellColor={0x777777}
        sectionColor={0x333333}
        sectionSize={1}
        infiniteGrid
      />

      {perfMonitorEnabled && <Perf position="bottom-left" />}
    </Canvas>
  )
}

export default Scene
