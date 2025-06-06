import { FC, useEffect, useState } from 'react'
import useSWRImmutable from 'swr/immutable'
import { useShallow } from 'zustand/shallow'

import fetcher from '@/fetcher'
import { useDialogStore } from '@/stores/dialogStore'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { CDNItemsListResponse } from '@/types'

import Dialog from './Dialog'

const ItemDisplaySelectDialog: FC = () => {
  const [firstOpened, setFirstOpened] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { createNewEntity } = useDisplayEntityStore(
    useShallow((state) => ({
      createNewEntity: state.createNew,
    })),
  )
  const { isOpen, setOpenedDialog } = useDialogStore(
    useShallow((state) => ({
      isOpen: state.openedDialog === 'itemDisplaySelect',
      setOpenedDialog: state.setOpenedDialog,
    })),
  )

  const closeDialog = () => setOpenedDialog(null)

  const { data } = useSWRImmutable<CDNItemsListResponse>(
    firstOpened ? '/assets/minecraft/items.json' : null,
    fetcher,
  )

  const items = data?.items ?? []

  useEffect(() => {
    if (isOpen) {
      setFirstOpened(true)
    }
  }, [isOpen])

  // search filtering
  const searchResult = items.filter((item) => item.includes(searchQuery))

  return (
    <Dialog
      title="Add Item Display"
      open={isOpen}
      onClose={closeDialog}
      className="relative z-50"
    >
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
        {searchResult.map((item) => (
          <button
            key={item}
            className="rounded-lg bg-neutral-700 p-1 text-center text-xs transition duration-150 hover:bg-neutral-700/50"
            onClick={() => {
              createNewEntity('item', item)
              setOpenedDialog(null)
            }}
          >
            {item}
          </button>
        ))}
      </div>
    </Dialog>
  )
}

export default ItemDisplaySelectDialog
