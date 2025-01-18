import { Grid, PerspectiveCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { FC } from 'react'
import { Color } from 'three'

import CustomCameraControls from './CustomCameraControls'
import DisplayentitiesRootGroup from './components/DisplayEntitiesRootGroup'
import DragSelectControl from './components/DragSelectControl'
import ShortcutHandler from './components/ShortcutHandler'
import TransformControls from './components/TransformControls'
import { useDisplayEntityStore } from './stores/displayEntityStore'

const Scene: FC = () => {
  return (
    <Canvas
      frameloop="demand"
      scene={{
        background: new Color(0x222222),
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
    </Canvas>
  )
}

export default Scene
