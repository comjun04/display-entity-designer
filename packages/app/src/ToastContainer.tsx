import type { FC } from 'react'
import { createPortal } from 'react-dom'

import { Toaster } from './components/ui/Sonner'

const ToastContainer: FC = () => {
  // headless ui uses portal to render dialogs and such
  // which prevents toast elements from receiving pointer events without using portal itself
  return createPortal(
    <div id="ToastContainer">
      <Toaster />
    </div>,
    document.body,
  )
}

export default ToastContainer
