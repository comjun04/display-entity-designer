import { type FC } from 'react'
import { useShallow } from 'zustand/shallow'

import { useDialogStore } from '@/stores/dialogStore'

import Dialog from './Dialog'

const PlayerHeadBakingDialog: FC = () => {
  const { isOpen, setOpenedDialog } = useDialogStore(
    useShallow((state) => ({
      isOpen: state.openedDialog === 'bakingPlayerHeads',
      setOpenedDialog: state.setOpenedDialog,
    })),
  )

  return (
    <Dialog
      title="Baking Player Heads..."
      useLargeStaticSize={false}
      open={isOpen}
      onClose={() => setOpenedDialog(null)}
    ></Dialog>
  )
}

export default PlayerHeadBakingDialog
