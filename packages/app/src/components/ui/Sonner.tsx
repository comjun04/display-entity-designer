import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:text-white group-[.toaster]:border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-gray-400',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
