import { CameraControls, Grid } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useRef } from 'react'
import { Camera, Color } from 'three'

function App() {
  const cameraRef = useRef<Camera>(null)

  return (
    <div className="h-full w-full">
      <Canvas
        scene={{
          background: new Color(0x333333),
        }}
        camera={{
          position: [3, 3, 3],
          // rotation: [0.0, Math.PI / 4, 0],
          ref: cameraRef as any,
        }}
      >
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

        <mesh>
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>

        <ambientLight intensity={0.1} />
        <directionalLight position={[3, 3, 3]} color="red" />

        <Grid
          cellSize={1}
          cellColor={0xffffff}
          sectionColor={0x0}
          sectionSize={5}
          infiniteGrid
        />

        <CameraControls
          makeDefault
          smoothTime={0}
          draggingSmoothTime={0}
          maxZoom={1}
        />
      </Canvas>
    </div>
  )
}

export default App
