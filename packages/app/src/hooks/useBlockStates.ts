import { useEffect, useState } from 'react'

import { getLogger } from '@/services/loggerService'
import { loadBlockstates } from '@/services/resources/blockstates'
import { useProjectStore } from '@/stores/projectStore'
import { BlockstatesData } from '@/types'

const logger = getLogger('useBlockStates()')

const useBlockStates = (blockString?: string) => {
  const [blockstatesData, setBlockstatesData] = useState<BlockstatesData>()

  const targetGameVersion = useProjectStore((state) => state.targetGameVersion)

  useEffect(() => {
    if (blockString == null) return

    loadBlockstates(blockString)
      .then((data) => {
        setBlockstatesData(data)
      })
      .catch(logger.error)
  }, [blockString, targetGameVersion])

  return {
    data: blockstatesData,
  }
}

export default useBlockStates
