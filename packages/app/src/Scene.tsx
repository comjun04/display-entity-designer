import { Grid, PerspectiveCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { FC, useEffect } from 'react'
import { Color } from 'three'
import { useShallow } from 'zustand/shallow'

import CustomCameraControls from './CustomCameraControls'
import DisplayentitiesRootGroup from './components/DisplayEntitiesRootGroup'
import DragSelectControl from './components/DragSelectControl'
import TransformControls from './components/TransformControls'
import { useDialogStore } from './stores/dialogStore'
import { useDisplayEntityStore } from './stores/displayEntityStore'
import { useEditorStore } from './stores/editorStore'

const Scene: FC = () => {
  const { selectedEntityIds } = useDisplayEntityStore(
    useShallow((state) => ({
      selectedEntityIds: state.selectedEntityIds,
    })),
  )

  const { openedDialog } = useDialogStore(
    useShallow((state) => ({
      openedDialog: state.openedDialog,
    })),
  )

  useEffect(() => {
    const focusableElements = ['input', 'textarea']
    const handler = (evt: KeyboardEvent) => {
      // <input>이나 <textarea>에 focus가 잡혀 있다면 이벤트를 처리하지 않음
      if (
        focusableElements.includes(
          (document.activeElement?.tagName ?? '').toLowerCase(),
        )
      ) {
        return true
      }

      // dialog 창이 열려 있을 떄는 이벤트를 처리하지 않음
      if (openedDialog != null) {
        return true
      }

      const { deleteEntities } = useDisplayEntityStore.getState()
      const { setMode } = useEditorStore.getState()

      // 단축키 처리
      switch (evt.key) {
        case 't':
          setMode('translate')
          break
        case 'r':
          setMode('rotate')
          break
        case 's':
          setMode('scale')
          break
        case 'Delete':
          deleteEntities(selectedEntityIds)
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [selectedEntityIds, openedDialog])

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
