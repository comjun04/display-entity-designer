/**
 * Unifont 중 특정 글자들의 width를 빈 픽셀 column 세서 계산하지 않고
 * 여기 정의된 left, right 값을 이용하여 계산합니다.
 *
 * @see https://minecraft.wiki/w/Font#Unihex_provider
 * @todo 이 파일은 1.21.4 마인크래프트 기본 리소스팩에서 추출했으며,
 * 추후 cdn에 있는 파일을 로딩하는 방식으로 변경될 예정입니다.
 */
export const UnifontSizeOverrides = [
  {
    __ranges: ['CJK Symbols and Punctuation', 'Hiragana', 'Katakana'],
    from: '\u3001',
    to: '\u30FF',
    left: 0,
    right: 15,
  },
  {
    __ranges: [
      'Enclosed CJK Letters and Months',
      'CJK Compatibility',
      'CJK Unified Ideographs Extension A',
      'Yijing Hexagram Symbols',
      'CJK Unified Ideographs',
    ],
    from: '\u3200',
    to: '\u9FFF',
    left: 0,
    right: 15,
  },
  {
    __ranges: ['Hangul Jamo'],
    from: '\u1100',
    to: '\u11FF',
    left: 0,
    right: 15,
  },
  {
    __ranges: ['Hangul Compatibility Jamo'],
    from: '\u3130',
    to: '\u318F',
    left: 0,
    right: 15,
  },
  {
    __ranges: ['Hangul Jamo Extended-A'],
    from: '\uA960',
    to: '\uA97F',
    left: 0,
    right: 15,
  },
  {
    __ranges: ['Hangul Jamo Extended-B'],
    from: '\uD7B0',
    to: '\uD7FF',
    left: 0,
    right: 15,
  },
  {
    __ranges: ['Hangul Syllables'],
    from: '\uAC00',
    to: '\uD7AF',
    left: 1,
    right: 15,
  },
  {
    __ranges: ['CJK Compatibility Ideographs'],
    from: '\uF900',
    to: '\uFAFF',
    left: 0,
    right: 15,
  },
  {
    __ranges: ['Halfwidth and Fullwidth Forms'],
    from: '\uFF01',
    to: '\uFF5E',
    left: 0,
    right: 15,
  },
]

// target minecraft version
export const MCVersion = '1.21'

export const CDNBaseUrl = import.meta.env.VITE_CDN_BASE_URL
export const CDNVersionAssetsUrl = `${CDNBaseUrl}/${MCVersion}`

export const BackendHost = import.meta.env.VITE_BACKEND_HOST
