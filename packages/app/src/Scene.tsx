import { Grid, PerspectiveCamera } from '@react-three/drei'
import { Canvas, invalidate } from '@react-three/fiber'
import { FC, useEffect, useRef } from 'react'
import { Color } from 'three'

import CustomCameraControls from './CustomCameraControls'
import DisplayentitiesRootGroup from './components/DisplayEntitiesRootGroup'
import DragSelectControl from './components/DragSelectControl'
import Perf from './components/Perf'
import ShortcutHandler from './components/ShortcutHandler'
import TransformControls from './components/TransformControls'
import { useDisplayEntityStore } from './stores/displayEntityStore'
import { useEditorStore } from './stores/editorStore'

const Scene: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const perfMonitorEnabled = useEditorStore(
    (state) => state.settings.debug.perfMonitorEnabled,
  )
  const reducePixelRatio = useEditorStore(
    (state) => state.settings.performance.reducePixelRatio,
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const preventDefault = (e: Event) => e.preventDefault()

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
      frameloop="demand"
      scene={{
        background: new Color(0x222222),
      }}
      style={{
        touchAction: 'none',
      }}
      dpr={reducePixelRatio ? Math.min(window.devicePixelRatio, 1) : undefined}
      onPointerDown={() => {
        // frameloop="demand"일 경우 가끔 TransformControls가 작동하지 않는 경우가 발생하는데
        // 이를 방지하기 위해 클릭 시 강제로 다음 프레임 렌더링하도록 하여 다시 작동하도록 고치기
        invalidate()
      }}
      onPointerMissed={(evt) => {
        // 모바일환경에서 TransformControls 잡은 상태로 꾹 누르고 있으면 contextmenu(우클릭) pointer event가 여기로 호출되는데
        // 이때 TransformControls는 아직 잡혀 있는데 선택이 풀리면서 상태가 꼬여버리므로 이를 방지
        if (evt.type !== 'contextmenu') {
          useDisplayEntityStore.getState().setSelected([])
        }
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
        <lineBasicMaterial color={0xdc2626 /* tailwind v3 red-600 */} />
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
        <lineBasicMaterial color={0x16a34a /* tailwind v3 green-600 */} />
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
        <lineBasicMaterial color={0x2563eb /* tailwind v3 blue-600 */} />
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

      {perfMonitorEnabled && <Perf />}
    </Canvas>
  )
}

export default Scene
