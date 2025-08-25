import { useEffect, useState } from 'react'

import { useEntityRefStore } from '@/stores/entityRefStore'

// 특정 엔티티의 ref에 연결된 three.js object를 반환합니다.
// 만약 ref가 연결되지 않았을 경우 연결될 때까지 확인하여 반환합니다.
const useEntityRefObject = (entityId: string | null) => {
  const firstFoundRefData = useEntityRefStore((state) =>
    state.entityRefs.get(entityId ?? ''),
  )
  const firstFoundRefObj = firstFoundRefData?.objectRef.current
  const [laterFoundRefObj, setLaterFoundRefObj] = useState(
    firstFoundRefObj ?? null,
  )

  useEffect(() => {
    if (entityId == null) {
      setLaterFoundRefObj(null)
      return
    } else if (firstFoundRefData == null) return
    else if (firstFoundRefData.objectRef.current != null) {
      // render가 끝나고 effect가 실행되기 전에 ref가 attached됐다면
      // 타이머를 돌리지 않고 바로 set state
      setLaterFoundRefObj(firstFoundRefData.objectRef.current)
      return
    }

    let check = true
    const interval = setInterval(() => {
      const refData = useEntityRefStore.getState().entityRefs.get(entityId)!
      if (refData.objectRef.current && check) {
        setLaterFoundRefObj(refData.objectRef.current)
        clearInterval(interval)
      }
    }, 0)
    return () => {
      check = false
      clearInterval(interval)
    }
  }, [entityId, firstFoundRefData])

  // entityId가 null이라면 저장된 값을 무시하고 바로 null 리턴
  // 이렇게 해야 ungroup할 때 parent object ref가 없어진 걸 바로 인식해서
  // children이 reparenting하기 전에 parent group이 displayEntityStore 데이터만 보고 (자식 object까지 같이) 삭제되는 것을 막을 수 있음
  if (entityId == null) return null
  return firstFoundRefObj ?? laterFoundRefObj
}

export default useEntityRefObject
