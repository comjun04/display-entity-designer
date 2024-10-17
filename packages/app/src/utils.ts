import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripMinecraftPrefix(input: string) {
  return input.startsWith('minecraft:') ? input.slice(10) : input
}
