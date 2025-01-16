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

import { useDialogStore } from '@/stores/dialogStore'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEntityRefStore } from '@/stores/entityRefStore'
import { cn } from '@/utils'

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

type TagValidatorInputProps = {
  onChange?: (text: string) => void
}

const TagValidatorInput: FC<TagValidatorInputProps> = ({ onChange }) => {
  const [input, setInput] = useState('')
  const [hasValidationErrors, setHasValidationErrors] = useState(false)

  return (
    <div className="flex flex-row items-center gap-2">
      <span>Base Tag</span>
      <input
        className="rounded p-1 text-sm outline-none"
        value={input}
        onChange={(evt) => {
          const text = evt.target.value
          setInput(text)

          if (/^[a-z0-9_\-.+]*$/gi.test(text)) {
            setHasValidationErrors(false)
            onChange?.(text)
          } else {
            setHasValidationErrors(true)
          }
        }}
      />
      {hasValidationErrors && (
        <span className="text-sm text-red-500">
          Tag must contain only alphabets, numbers,{' '}
          <code className="rounded bg-neutral-800 p-1 font-mono">_</code>,{' '}
          <code className="rounded bg-neutral-800 p-1 font-mono">-</code>,{' '}
          <code className="rounded bg-neutral-800 p-1 font-mono">.</code>, and{' '}
          <code className="rounded bg-neutral-800 p-1 font-mono">+</code>{' '}
          characters.
        </span>
      )}
    </div>
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

  const [baseTag, setBaseTag] = useState('')
  const [nbtDataGenerated, setNbtDataGenerated] = useState(false)
  const [nbtStrings, setNbtStrings] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      setBaseTag('')
    }
  }, [isOpen])

  // 엔티티 데이터나 태그가 바뀌었다면 커맨드를 다시 생성해야 함
  useEffect(() => {
    setNbtDataGenerated(false)
  }, [entities, baseTag])

  useEffect(() => {
    if (!nbtDataGenerated && isOpen) {
      const { entityRefs } = useEntityRefStore.getState()

      const tagString = baseTag.length > 0 ? `Tags:["${baseTag}"],` : ''
      const passengersStrings = [...entities.values()]
        .map((entity) => {
          // 그룹은 커맨드 생성에 들어가지 않음
          // 그룹 안에 있는 엔티티들은 world transform으로 반영됨
          if (entity.kind === 'group') return

          const refData = entityRefs.find((e) => e.id === entity.id)
          if (refData == null || refData.objectRef.current == null) {
            console.warn(
              `entity ref of entity ${entity.id} not found, ignoring.`,
            )
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
                entity.display != null
                  ? `,item_display:"${entity.display}"`
                  : ''
              specificData = `item:{id:"${entity.type}"}${displayText}`
            }
          }

          return `{id:"${idText}",${tagString}${specificData},transformation:[${transformationString}]}`
        })
        .filter((d) => d != null)

      let le = Infinity
      const groupedPassengersStrings: string[] = []
      for (const passengersStr of passengersStrings) {
        // 32500 (max command length in command block) - 60 (length of `/summon block_display ~ ~ ~ {Tags:[""],Passengers:[]}` + alpha) - baseTag length
        if (le + passengersStr.length > 32440 - baseTag.length) {
          groupedPassengersStrings.push(passengersStr)
          le = passengersStr.length + 1
        } else {
          groupedPassengersStrings[groupedPassengersStrings.length - 1] +=
            ',' + passengersStr
          le += passengersStr.length + 1
        }
      }

      const newNbtStrings = groupedPassengersStrings.map(
        (str) => `{${tagString}Passengers:[${str}]}`,
      )
      setNbtStrings(newNbtStrings)

      setNbtDataGenerated(true)
    }
  }, [nbtDataGenerated, isOpen, baseTag, entities])

  const removeCommand = `/kill @e[${baseTag.length > 0 ? `tag=${baseTag}` : 'type=block_display'},distance=..2]`

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
          className="flex max-h-[90vh] w-full max-w-screen-md select-none flex-col rounded-xl bg-neutral-800 p-4 duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <DialogTitle className="text-2xl font-bold">
            Export to Minecraft
          </DialogTitle>

          <div className="mt-2 rounded-lg bg-neutral-700 p-2">
            <TagValidatorInput onChange={setBaseTag} />
          </div>

          <hr className="my-2 border-gray-600" />

          <div className="overflow-y-auto">
            {nbtStrings.map((nbt, idx) => {
              const summonCommand = `/summon block_display ~ ~ ~ ${nbt}`
              return (
                <div key={idx}>
                  <div className="flex flex-row items-center">
                    <span className="grow">Summon command {idx + 1}</span>
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
              )
            })}

            <div>
              <div className="flex flex-row items-center">
                <span className="grow">Remove command</span>
                <CopyButton valueToCopy={removeCommand} />
              </div>
              <textarea
                className="h-10 w-full resize-none break-all rounded-lg p-2 outline-none"
                readOnly
                value={removeCommand}
                onFocus={(evt) => {
                  evt.target.select()
                }}
              />
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export default ExportToMinecraftDialog
