# backend

Display Entity Platform 앱 자체에서 처리할 수 없는 작업을 처리하기 위해 제작된 백엔드 서버입니다.
아래 작업을 처리하는 데 이 서버가 사용됩니다:
- 플레이어의 현재 스킨 조회
  - Mojang에서 제공하는 API에 [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) 설정이 되어 있지 않아 브라우저 환경에서 호출할 시 데이터를 받아올 수 없어, CORS를 무시할 수 있는 자체 서버를 활용합니다.

## 사용법
이 서버는 [Hono](https://hono.dev)를 사용하여 이론적으로는 Cloudflare Workers 등의 서버리스 환경에서도 구동할 수 있지만, 현재로서는 Node.js를 사용한 자체 구동만 정식으로 지원합니다. 다른 방식의 구동은 준비 중에 있습니다.

Node.js 20 이상이 필요합니다.

1. `.env.example` 파일을 `.env`로 복사하고, 해당 파일을 편집하여 설정값을 수정합니다.
2. `pnpm start`로 서버를 시작합니다.
