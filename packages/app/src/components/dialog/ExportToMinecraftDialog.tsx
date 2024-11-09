import {
  useDialogStore,
  useDisplayEntityStore,
  useEntityRefStore,
} from '@/store'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { FC } from 'react'
import { useShallow } from 'zustand/shallow'

const ExportToMinecraftDialog: FC = () => {
  const { isOpen, setOpenedDialog } = useDialogStore(
    useShallow((state) => ({
      isOpen: state.openedDialog === 'exportToMinecraft',
      setOpenedDialog: state.setOpenedDialog,
    })),
  )
  const { entities } = useDisplayEntityStore(
    useShallow((state) => ({
      entities: state.entities,
    })),
  )
  const { entityRefs } = useEntityRefStore(
    useShallow((state) => ({
      entityRefs: state.entityRefs,
    })),
  )

  const passengersString = entities
    .map((entity) => {
      const refData = entityRefs.find((e) => e.id === entity.id)
      if (refData == null || refData.objectRef.current == null) {
        console.warn(`entity ref of entity ${entity.id} not found, ignoring.`)
        return
      }

      const worldMatrix = refData.objectRef.current.matrixWorld

      const idText = entity.kind + '_display' // block_display, item_display
      const transformationString = worldMatrix
        .clone()
        .transpose()
        .toArray()
        .map((num) => Math.round(num * 1_0000_0000) / 1_0000_0000 + 'f')
        .join(',')

      let specificData = ''
      if (entity.kind === 'block') {
        const propertiesText = Object.entries(entity.blockstates)
          .map(([k, v]) => `${k}:"${v}"`)
          .join(',')

        specificData = `block_state:{Name:"${entity.type}",Properties:{${propertiesText}}}`
      } else if (entity.kind === 'item') {
        {
          const displayText =
            entity.display != null ? `,item_display:"${entity.display}"` : ''
          specificData = `item:{id:"${entity.type}"}${displayText}`
        }
      }

      return `{id:"${idText}",${specificData},transformation:[${transformationString}]}`
    })
    .filter((d) => d != null)

  const nbt = `{Passengers:[${passengersString.join(',')}]}`

  return (
    <Dialog
      open={isOpen}
      onClose={() => setOpenedDialog(null)}
      className="relative z-50"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 backdrop-blur-sm duration-200 ease-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          transition
          className="flex w-full max-w-screen-md select-none flex-col gap-2 rounded-xl bg-neutral-800 p-4 duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <DialogTitle className="text-2xl font-bold">
            Export To Minecraft
          </DialogTitle>

          <textarea
            className="h-24 resize-none rounded-lg p-2 outline-none"
            readOnly
            value={`/summon block_display ~ ~ ~ ${nbt}`}
          />
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export default ExportToMinecraftDialog
