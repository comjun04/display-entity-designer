import { useEffect, useState } from 'react'

import { useEntityRefStore } from '@/stores/entityRefStore'

// 특정 엔티티의 ref에 연결된 three.js object를 반환합니다.
// 만약 ref가 연결되지 않았을 경우 연결될 때까지 확인하여 반환합니다.
const useEntityRefObject = (entityId: string | null) => {
  const initialRefData = useEntityRefStore((state) =>
    state.entityRefs.get(entityId ?? ''),
  )
  const [refObj, setRefObj] = useState(
    initialRefData?.objectRef.current ?? null,
  )

  useEffect(() => {
    if (entityId == null || initialRefData == null) return
    if (refObj != null) return

    let check = true
    const interval = setInterval(() => {
      const refData = useEntityRefStore.getState().entityRefs.get(entityId)!
      if (refData.objectRef.current && check) {
        setRefObj(refData.objectRef.current)
        clearInterval(interval)
      }
    }, 0)
    return () => {
      check = false
      clearInterval(interval)
    }
  }, [entityId, initialRefData, refObj])

  return refObj
}

export default useEntityRefObject
