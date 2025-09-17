import { useEffect, useState } from 'react'

import { getLogger } from '@/services/loggerService'
import { loadBlockstates } from '@/services/resources/blockstates'
import type { BlockstatesData } from '@/types'

const logger = getLogger('useBlockStates()')

const useBlockStates = (blockString?: string) => {
  const [blockstatesData, setBlockstatesData] = useState<BlockstatesData>()

  useEffect(() => {
    if (blockString == null) return

    loadBlockstates(blockString)
      .then((data) => {
        setBlockstatesData(data)
      })
      .catch(logger.error)
  }, [blockString])

  return {
    data: blockstatesData,
  }
}

export default useBlockStates
