// TODO: app에서 선언된 타입이랑 중복되는거 같으니 common 패키지로 추출하기

export interface BlockStateApplyModelInfo {
  model: string
}

export type BlockstatesFile =
  | {
      variants:
        | Record<string, BlockStateApplyModelInfo>
        | Record<string, BlockStateApplyModelInfo[]>
    }
  | {
      multipart: {
        apply: BlockStateApplyModelInfo | BlockStateApplyModelInfo[]
        when?:
          | {
              AND: Record<string, string>[]
            }
          | {
              OR: Record<string, string>[]
            }
          | Record<string, string>
      }[]
    }

export interface ModelFile {
  parent?: string
  elements?: unknown[]
}
