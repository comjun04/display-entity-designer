import fetcher from '@/fetcher'
import { BlockStateApplyModelInfo, CDNBlockStatesResponse } from '@/types'
import { stripMinecraftPrefix } from '@/utils'
import { useMemo } from 'react'
import useSWRImmutable from 'swr/immutable'

const useBlockStates = (blockType?: string) => {
  const { data, isLoading } = useSWRImmutable<CDNBlockStatesResponse>(
    blockType != null
      ? `/assets/minecraft/blockstates/${blockType}.json`
      : null,
    fetcher,
  )

  const blockstatesData = useMemo(() => {
    const blockstateMap = new Map<string, Set<string>>()
    const models: {
      // array 안에 있는 object들은 OR조건으로 계산, object들 중 하나만 맞아도 통과
      // 각 object들은 AND조건으로 계산, object 안에 있는 key와 value들이 모두 맞아야 함
      when: Record<string, string[]>[]
      apply: BlockStateApplyModelInfo[]
    }[] = []

    if (data == null) {
      return { blockstates: blockstateMap, models }
    }

    if ('variants' in data) {
      for (const key in data.variants) {
        const blockstateDefinition = key.split(',').map((section) => {
          const [k, v] = section.split('=')
          return { key: k, value: v }
        })

        for (const blockstate of blockstateDefinition) {
          if (blockstateMap.has(blockstate.key)) {
            blockstateMap.get(blockstate.key)!.add(blockstate.value)
          } else {
            blockstateMap.set(blockstate.key, new Set([blockstate.value]))
          }
        }

        const applyInfos = Array.isArray(data.variants[key])
          ? data.variants[key]
          : [data.variants[key]]
        models.push({
          when: [
            blockstateDefinition.reduce<Record<string, string[]>>(
              (acc, cur) => ({ ...acc, [cur.key]: [cur.value] }),
              {},
            ),
          ],
          apply: applyInfos.map((info) => ({
            ...info,
            model: stripMinecraftPrefix(info.model),
          })),
        })
      }
    } else if ('multipart' in data) {
      for (const multipartItem of data.multipart) {
        if (multipartItem.when != null) {
          if (
            'AND' in multipartItem.when &&
            Array.isArray(multipartItem.when.AND)
          ) {
            const obj: Record<string, string[]> = {}

            for (const andConditions of multipartItem.when.AND) {
              for (const key in andConditions) {
                const values = andConditions[key].split('|')

                if (blockstateMap.has(key)) {
                  values.forEach((v) => blockstateMap.get(key)!.add(v))
                } else {
                  blockstateMap.set(key, new Set(values))
                }

                obj[key] = values
              }
            }

            const applyInfos = Array.isArray(multipartItem.apply)
              ? multipartItem.apply
              : [multipartItem.apply]
            models.push({
              when: [obj],
              apply: applyInfos.map((info) => ({
                ...info,
                model: stripMinecraftPrefix(info.model),
              })),
            })
          } else if (
            'OR' in multipartItem.when &&
            Array.isArray(multipartItem.when.OR)
          ) {
            const conditions: Record<string, string[]>[] = []

            for (const orConditions of multipartItem.when.OR) {
              const obj: Record<string, string[]> = {}

              for (const key in orConditions) {
                const values = orConditions[key].split('|')

                if (blockstateMap.has(key)) {
                  values.forEach((v) => blockstateMap.get(key)!.add(v))
                } else {
                  blockstateMap.set(key, new Set(values))
                }

                obj[key] = values
              }

              conditions.push(obj)
            }

            const applyInfos = Array.isArray(multipartItem.apply)
              ? multipartItem.apply
              : [multipartItem.apply]
            models.push({
              when: conditions,
              apply: applyInfos.map((info) => ({
                ...info,
                model: stripMinecraftPrefix(info.model),
              })),
            })
          } else if (
            !('AND' in multipartItem.when) &&
            !('OR' in multipartItem.when)
          ) {
            // AND와 OR key가 둘 다 없는 경우, object 안에 있는 key들을 전부 하나의 AND조건으로 계산

            const obj: Record<string, string[]> = {}

            for (const key in multipartItem.when) {
              const values = multipartItem.when[key].split('|')

              if (blockstateMap.has(key)) {
                values.forEach((v) => blockstateMap.get(key)!.add(v))
              } else {
                blockstateMap.set(key, new Set(values))
              }

              obj[key] = values
            }

            const applyInfos = Array.isArray(multipartItem.apply)
              ? multipartItem.apply
              : [multipartItem.apply]
            models.push({
              when: [obj],
              apply: applyInfos.map((info) => ({
                ...info,
                model: stripMinecraftPrefix(info.model),
              })),
            })
          }
        }
      }
    }

    // blockstate가 없을 경우 empty string을 key로 사용하게 되어 map에 들어가게 됨
    // 데이터 리턴 전에 빼주기
    blockstateMap.delete('')

    return { blockstates: blockstateMap, models }
  }, [data])

  return {
    data: blockstatesData,
    isLoading,
  }
}

export default useBlockStates
