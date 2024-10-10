import { Canvas } from '@react-three/fiber'

function App() {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{
          position: [0.5, 0.5, 0.5],
          // rotation: [0.0, Math.PI / 4, 0],
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
      </Canvas>
    </div>
  )
}

export default App
