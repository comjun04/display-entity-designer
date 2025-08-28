import { FC } from 'react'

import { Disclaimer, Title } from '@/components/brandings'

const ProgramInfoPage: FC = () => {
  return (
    <>
      <Title />
      <div className="mt-4 flex flex-row items-center gap-2">
        <span>v{__VERSION__}</span>
        <span className="font-mono">{__COMMIT_HASH__}</span>
        {__IS_DEV__ && <span>(Development Build)</span>}
      </div>

      <Disclaimer />
    </>
  )
}

export default ProgramInfoPage
