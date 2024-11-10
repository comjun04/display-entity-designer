import {
  useDialogStore,
  useDisplayEntityStore,
  useEntityRefStore,
} from '@/store'
import { cn } from '@/utils'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { useDebouncedEffect } from '@react-hookz/web'
import { FC, JSX, useEffect, useState } from 'react'
import { LuCopy, LuCopyCheck } from 'react-icons/lu'
import { useShallow } from 'zustand/shallow'

type CopyButtonProps = JSX.IntrinsicElements['button'] & {
  valueToCopy: string
}

const CopyButton: FC<CopyButtonProps> = ({
  className,
  valueToCopy,
  onClick,
  ...props
}) => {
  const [clicked, setClicked] = useState(false)
  const [showCopiedState, setShowCopiedState] = useState(false)

  useDebouncedEffect(
    () => {
      setShowCopiedState(false)
    },
    [clicked, showCopiedState],
    1500,
  )

  useEffect(() => {
    if (clicked) {
      setShowCopiedState(true)
      setClicked(false)
    }
  }, [clicked])

  return (
    <button
      className={cn(
        'flex flex-row items-center gap-2 rounded-lg bg-white/10 px-3 py-1 transition hover:bg-white/5',
        className,
      )}
      onClick={(evt) => {
        onClick?.(evt)
        void navigator.clipboard.writeText(valueToCopy)
        setClicked(true)
      }}
      {...props}
    >
      {showCopiedState ? (
        <>
          <LuCopyCheck />
          Copied!
        </>
      ) : (
        <>
          <LuCopy />
          Copy
        </>
      )}
    </button>
  )
}

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
  const summonCommand = `/summon block_display ~ ~ ~ ${nbt}`

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
            Export to Minecraft
          </DialogTitle>

          <div>
            <div className="flex flex-row items-center">
              <span className="grow">Summon command</span>
              <CopyButton valueToCopy={summonCommand} />
            </div>
            <textarea
              className="h-24 w-full resize-none break-all rounded-lg p-2 outline-none"
              readOnly
              value={summonCommand}
              onFocus={(evt) => {
                evt.target.select()
              }}
            />
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export default ExportToMinecraftDialog
