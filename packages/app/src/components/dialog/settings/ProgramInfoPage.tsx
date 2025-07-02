import { FC } from 'react'

const ProgramInfoPage: FC = () => {
  return (
    <>
      <h3 className="text-xl font-bold">Display Entity Platform</h3>
      <div>Graphical editor for Minecraft display entities</div>
      <div className="mt-4 flex flex-row items-center gap-2">
        <span>v{__VERSION__}</span>
        <span className="font-mono">{__COMMIT_HASH__}</span>
        {__IS_DEV__ && <span>(Development Build)</span>}
      </div>

      {/* Disclaimer */}
      <div className="mt-4 text-sm text-neutral-500">
        This website or tool is not an official Minecraft product. Minecraft is
        a trademark of Mojang AB. All rights related to Minecraft and its
        intellectual property are owned by Mojang AB.
      </div>
    </>
  )
}

export default ProgramInfoPage
