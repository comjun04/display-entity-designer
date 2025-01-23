import { useEffect, useState } from 'react'

import { loadBlockstates } from '@/services/resources/blockstates'
import { BlockstatesData } from '@/types'

const useBlockStates = (blockString?: string) => {
  const [blockstatesData, setBlockstatesData] = useState<BlockstatesData>()

  useEffect(() => {
    if (blockString == null) return

    loadBlockstates(blockString)
      .then((data) => {
        setBlockstatesData(data)
      })
      .catch(console.error)
  }, [blockString])

  return {
    data: blockstatesData,
  }
}

export default useBlockStates
