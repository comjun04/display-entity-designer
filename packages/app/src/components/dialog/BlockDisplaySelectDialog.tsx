import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useSWRImmutable from 'swr/immutable'
import { useShallow } from 'zustand/shallow'

import fetcher from '@/fetcher'
import { useDialogStore } from '@/stores/dialogStore'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { CDNBlocksListResponse } from '@/types'

import Dialog from './Dialog'

const BlockDisplaySelectDialog: FC = () => {
  const { t } = useTranslation()

  const [firstOpened, setFirstOpened] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { createNewEntity } = useDisplayEntityStore(
    useShallow((state) => ({
      createNewEntity: state.createNew,
    })),
  )
  const { isOpen, setOpenedDialog } = useDialogStore(
    useShallow((state) => ({
      isOpen: state.openedDialog === 'blockDisplaySelect',
      setOpenedDialog: state.setOpenedDialog,
    })),
  )

  const closeDialog = () => setOpenedDialog(null)

  const { data } = useSWRImmutable<CDNBlocksListResponse>(
    firstOpened ? '/assets/minecraft/blocks.json' : null,
    fetcher,
  )
  const blocks = (data?.blocks ?? []).map((d) => d.split('[')[0]) // 블록 이름 뒤에 붙는 `[up=true]` 등 blockstate 기본값 텍스트 제거

  useEffect(() => {
    if (isOpen) {
      setFirstOpened(true)
    }
  }, [isOpen])

  // search filtering
  const searchResult = blocks.filter((block) => block.includes(searchQuery))

  return (
    <Dialog
      title={t(($) => $.dialog.blockDisplaySelect.title)}
      open={isOpen}
      onClose={closeDialog}
      className="relative z-50"
    >
      <div className="flex flex-row items-center gap-4">
        <span>{t(($) => $.dialog.blockDisplaySelect.search.label)}</span>
        <input
          type="text"
          className="grow rounded px-2 py-1 text-sm outline-none"
          value={searchQuery}
          onChange={(evt) => setSearchQuery(evt.target.value)}
        />
      </div>

      <div className="flex h-full flex-col gap-1 overflow-auto rounded-lg p-1">
        {searchResult.map((block) => (
          <button
            key={block}
            className="rounded-lg bg-neutral-700 p-1 text-center text-xs transition duration-150 hover:bg-neutral-700/50"
            onClick={() => {
              createNewEntity([{ kind: 'block', type: block }])
              setOpenedDialog(null)
            }}
          >
            {block}
          </button>
        ))}
      </div>
    </Dialog>
  )
}

export default BlockDisplaySelectDialog
