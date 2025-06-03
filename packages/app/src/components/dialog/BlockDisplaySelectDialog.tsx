import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { FC, useEffect, useState } from 'react'
import { LuX } from 'react-icons/lu'
import useSWRImmutable from 'swr/immutable'
import { useShallow } from 'zustand/shallow'

import fetcher from '@/fetcher'
import { useDialogStore } from '@/stores/dialogStore'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { CDNBlocksListResponse } from '@/types'

const BlockDisplaySelectDialog: FC = () => {
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
    <Dialog open={isOpen} onClose={closeDialog} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 duration-200 ease-out data-[closed]:opacity-0 xs:backdrop-blur-sm"
      />

      <div className="fixed inset-0 flex w-screen items-center justify-center xs:p-4">
        <DialogPanel
          transition
          className="flex h-full w-full max-w-screen-md select-none flex-col gap-2 bg-neutral-800 p-4 duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 xs:h-[75vh] xs:rounded-xl"
        >
          <DialogTitle className="flex flex-row items-center">
            <span className="grow text-2xl font-bold">Add Block Display</span>
            <button onClick={closeDialog}>
              <LuX size={24} />
            </button>
          </DialogTitle>

          <div className="flex flex-row items-center gap-4">
            <span>Search</span>
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
                  createNewEntity('block', block)
                  setOpenedDialog(null)
                }}
              >
                {block}
              </button>
            ))}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export default BlockDisplaySelectDialog
