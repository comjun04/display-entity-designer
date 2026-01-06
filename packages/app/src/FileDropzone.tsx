import { type FC, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { LuUpload } from 'react-icons/lu'

import { openFromFile } from './services/fileService'
import { cn } from './utils'

const FileDropzone: FC = () => {
  const [showOverlay, setShowOverlay] = useState(false)

  const { getRootProps, getInputProps } = useDropzone({
    noClick: true,
    onDrop: (acceptedFiles) => {
      openFromFile(acceptedFiles[0]).catch(console.error)
      setShowOverlay(false)
    },
    onDragEnter: () => {
      setShowOverlay(true)
    },
    onDragOver: () => {
      setShowOverlay(true)
    },
    onDragLeave: () => {
      setShowOverlay(false)
    },
  })

  useEffect(() => {
    const enableShowingOverlay = () => {
      setShowOverlay(true)
    }

    document.addEventListener('dragenter', enableShowingOverlay)

    return () => {
      document.removeEventListener('dragenter', enableShowingOverlay)
    }
  }, [])

  return (
    <div
      {...getRootProps()}
      className={cn(
        'absolute z-100 flex h-full w-full items-center justify-center',
        !showOverlay && 'pointer-events-none',
      )}
      // onDrop={(evt) => {
      //   evt.preventDefault()
      //   console.log(evt)
      // }}
    >
      <input
        {...getInputProps()}
        onChange={(evt) => console.log('onChange', evt)}
        onSelect={(evt) => console.log('onSelect', evt)}
      />
      <div
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-4 bg-black/50 transition',
          !showOverlay && 'opacity-0',
        )}
      >
        <LuUpload className="text-7xl" />
        <div className="text-3xl">Drop project file to open</div>
      </div>
    </div>
  )
}

export default FileDropzone
