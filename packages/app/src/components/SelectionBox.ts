// Base source from three-stdlib `SelectionBox.js`
// https://github.com/pmndrs/three-stdlib/blob/6b51b6dfaa4af721616945c0b0f9787afdd0a3f8/src/interactive/SelectionBox.js
import {
  Box3,
  Frustum,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  Vector3,
} from 'three'

import { useEntityRefStore } from '@/stores/entityRefStore'

const frustum = new Frustum()
const center = new Vector3()
const tmpPoint = new Vector3()
const vecNear = new Vector3()
const vecTopLeft = new Vector3()
const vecTopRight = new Vector3()
const vecDownRight = new Vector3()
const vecDownLeft = new Vector3()
const vecFarTopLeft = new Vector3()
const vecFarTopRight = new Vector3()
const vecFarDownRight = new Vector3()
const vecFarDownLeft = new Vector3()
const vectemp1 = new Vector3()
const vectemp2 = new Vector3()
const vectemp3 = new Vector3()

class SelectionBox {
  camera: PerspectiveCamera | OrthographicCamera
  scene: Scene
  startPoint: Vector3
  endPoint: Vector3
  collection: Object3D[]
  deep: number

  constructor(
    camera: PerspectiveCamera | OrthographicCamera,
    scene: Scene,
    deep?: number,
  ) {
    this.camera = camera
    this.scene = scene
    this.startPoint = new Vector3()
    this.endPoint = new Vector3()
    this.collection = []
    this.deep = deep || Number.MAX_SAFE_INTEGER // Number.MAX_VALUE (+Infinity) 사용 시 frustum의 planes[5] 값이 NaN으로 채워지는 문제가 발생함
  }
  select(startPoint?: Vector3, endPoint?: Vector3) {
    this.startPoint = startPoint || this.startPoint
    this.endPoint = endPoint || this.endPoint
    this.collection = []
    this.updateFrustum(this.startPoint, this.endPoint)
    this.searchChildInFrustum(frustum, this.scene)
    return this.collection
  }
  updateFrustum(startPoint: Vector3, endPoint: Vector3) {
    startPoint = startPoint || this.startPoint
    endPoint = endPoint || this.endPoint
    if (startPoint.x === endPoint.x) {
      endPoint.x += Number.EPSILON
    }
    if (startPoint.y === endPoint.y) {
      endPoint.y += Number.EPSILON
    }
    this.camera.updateProjectionMatrix()
    this.camera.updateMatrixWorld()
    if (this.camera instanceof PerspectiveCamera) {
      tmpPoint.copy(startPoint)
      tmpPoint.x = Math.min(startPoint.x, endPoint.x)
      tmpPoint.y = Math.max(startPoint.y, endPoint.y)
      endPoint.x = Math.max(startPoint.x, endPoint.x)
      endPoint.y = Math.min(startPoint.y, endPoint.y)
      vecNear.setFromMatrixPosition(this.camera.matrixWorld)
      vecTopLeft.copy(tmpPoint)
      vecTopRight.set(endPoint.x, tmpPoint.y, 0)
      vecDownRight.copy(endPoint)
      vecDownLeft.set(tmpPoint.x, endPoint.y, 0)
      vecTopLeft.unproject(this.camera)
      vecTopRight.unproject(this.camera)
      vecDownRight.unproject(this.camera)
      vecDownLeft.unproject(this.camera)

      // console.log('before plane apply 1', vectemp3, vectemp2, vectemp1)

      vectemp1.copy(vecTopLeft).sub(vecNear)
      vectemp2.copy(vecTopRight).sub(vecNear)
      vectemp3.copy(vecDownRight).sub(vecNear)

      // console.log('before plane apply 2', vectemp3, vectemp2, vectemp1)

      vectemp1.normalize()
      vectemp2.normalize()
      vectemp3.normalize()

      // console.log('before plane apply 3', vectemp3, vectemp2, vectemp1)

      vectemp1.multiplyScalar(this.deep)
      vectemp2.multiplyScalar(this.deep)
      vectemp3.multiplyScalar(this.deep)

      // console.log('before plane apply 4', vectemp3, vectemp2, vectemp1)

      vectemp1.add(vecNear)
      vectemp2.add(vecNear)
      vectemp3.add(vecNear)
      const planes = frustum.planes

      // console.log('planes', ...planes)

      planes[0].setFromCoplanarPoints(vecNear, vecTopLeft, vecTopRight)
      planes[1].setFromCoplanarPoints(vecNear, vecTopRight, vecDownRight)
      planes[2].setFromCoplanarPoints(vecDownRight, vecDownLeft, vecNear)
      planes[3].setFromCoplanarPoints(vecDownLeft, vecTopLeft, vecNear)
      planes[4].setFromCoplanarPoints(vecTopRight, vecDownRight, vecDownLeft)
      planes[5].setFromCoplanarPoints(vectemp3, vectemp2, vectemp1)

      // console.log('plane5', planes[5], vectemp3, vectemp2, vectemp1)

      planes[5].normal.multiplyScalar(-1)
    } else if (this.camera instanceof OrthographicCamera) {
      const left = Math.min(startPoint.x, endPoint.x)
      const top = Math.max(startPoint.y, endPoint.y)
      const right = Math.max(startPoint.x, endPoint.x)
      const down = Math.min(startPoint.y, endPoint.y)
      vecTopLeft.set(left, top, -1)
      vecTopRight.set(right, top, -1)
      vecDownRight.set(right, down, -1)
      vecDownLeft.set(left, down, -1)
      vecFarTopLeft.set(left, top, 1)
      vecFarTopRight.set(right, top, 1)
      vecFarDownRight.set(right, down, 1)
      vecFarDownLeft.set(left, down, 1)
      vecTopLeft.unproject(this.camera)
      vecTopRight.unproject(this.camera)
      vecDownRight.unproject(this.camera)
      vecDownLeft.unproject(this.camera)
      vecFarTopLeft.unproject(this.camera)
      vecFarTopRight.unproject(this.camera)
      vecFarDownRight.unproject(this.camera)
      vecFarDownLeft.unproject(this.camera)

      const planes = frustum.planes
      planes[0].setFromCoplanarPoints(vecTopLeft, vecFarTopLeft, vecFarTopRight)
      planes[1].setFromCoplanarPoints(
        vecTopRight,
        vecFarTopRight,
        vecFarDownRight,
      )
      planes[2].setFromCoplanarPoints(
        vecFarDownRight,
        vecFarDownLeft,
        vecDownLeft,
      )
      planes[3].setFromCoplanarPoints(vecFarDownLeft, vecFarTopLeft, vecTopLeft)
      planes[4].setFromCoplanarPoints(vecTopRight, vecDownRight, vecDownLeft)
      planes[5].setFromCoplanarPoints(
        vecFarDownRight,
        vecFarTopRight,
        vecFarTopLeft,
      )
      planes[5].normal.multiplyScalar(-1)
    } else {
      console.error('THREE.SelectionBox: Unsupported camera type.')
    }
  }

  searchChildInFrustum(frustum2: Frustum, object: Object3D) {
    const entityRefs = useEntityRefStore.getState().entityRefs
    const isDisplayEntity =
      entityRefs.find((d) => d.objectRef.current.id === object.id) != null

    if (object instanceof Object3D && isDisplayEntity) {
      // console.log(object)

      const box3 = new Box3().setFromObject(object)
      box3.getCenter(center)

      if (frustum2.containsPoint(center)) {
        this.collection.push(object)
      }
    }
    if (!isDisplayEntity && object.children.length > 0) {
      for (let x = 0; x < object.children.length; x++) {
        this.searchChildInFrustum(frustum2, object.children[x])
      }
    }
  }
}

export { SelectionBox }
