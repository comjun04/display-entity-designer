import { FC } from 'react'

const HotkeysPage: FC = () => {
  return (
    <>
      <h3 className="text-xl font-bold">Hotkeys</h3>
      <div className="mt-2 text-sm text-neutral-500">
        *Changing hotkeys are not yet supported.
      </div>
      <div className="mt-2">
        <div className="rounded bg-neutral-800 px-3 py-1 text-gray-400">
          General
        </div>
        <div className="flex flex-col">
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">Open from file</span>
            <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
              Ctrl + O
            </div>
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">Save to file</span>
            <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
              Ctrl + S
            </div>
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">Open Settings</span>
            <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
              Ctrl + ,
            </div>
          </div>
        </div>
      </div>
      <div className="mt-1">
        <div className="rounded bg-neutral-800 px-3 py-1 text-gray-400">
          Editor
        </div>
        <div className="flex flex-col">
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">Translate mode</span>
            <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
              T
            </div>
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">Rotate mode</span>
            <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
              R
            </div>
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">Scale mode</span>
            <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
              S
            </div>
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">Group/Ungroup</span>
            <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
              G
            </div>
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">Delete Entity</span>
            <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
              Delete
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default HotkeysPage
