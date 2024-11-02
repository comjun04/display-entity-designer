# asset-utils

마인크래프트 리소스 데이터 추출을 자동화하고 로컬 cdn 서버를 실행할 수 있는 내부 패키지입니다.

디스플레이 엔티티는 마인크래프트에 있는 블록과 아이템 모델 및 텍스쳐를 사용하기 때문에, 에디터에서도 해당 모델 정의 파일과 텍스쳐 이미지 파일이 필요합니다. 수많은 모델 .json 파일들과 텍스쳐 이미지 파일들을 이 레포에 담기에는 여러 문제가 있어, 직접 추출하는 방식을 사용합니다.

로컬 CDN 서버는 메인 에디터에 필요한 리소스 파일들을 로컬에서 호스팅하기 위한 서버입니다. 글로벌 CDN 서버에 올리지 않고도 리소스가 잘 불러와지는지 빠르게 확인할 수 있습니다.

## 리소스 추출하기

### 준비물

- Node.js 20 이상
- 리소스 추출을 진행할 마인크래프트 버전에 맞는 Java
  - 버전에 따라 Java 17 또는 Java 21이 필요합니다.
- 리소스를 추출할 버전의 마인크래프트 클라이언트 jar 파일, 서버 jar 파일
  - 클라이언트 jar 파일은 `<마인크래프트 설치 경로>/versions/<버전>/<버전>.jar`에서 구할 수 있습니다. 예시로 Windows 환경에서 1.21.1 클라이언트 jar 파일은 `C:\Users\<유저 이름>\AppData\Roaming\.minecraft\versions\1.21.1\1.21.1.jar`에 위치해 있습니다.
  - 서버 jar 파일은 마인크래프트 공식 홈페이지 > 커뮤니티 > 최신 소식 에 있는 버전 출시 글에서 찾을 수 있습니다. 예시로 1.21.1 버전 출시 글은 [여기](https://www.minecraft.net/en-us/article/minecraft-java-edition-1-21-1)서 볼 수 있고, 해당 글의 하단 부분에서 [바닐라 서버 jar 파일](https://piston-data.mojang.com/v1/objects/59353fb40c36d304f2035d51e7d6e6baa98dc05c/server.jar)을 다운받을 수 있습니다.

### 방법

1. 다운받은 클라이언트 jar 파일과 서버 jar 파일을 `workdir` 폴더 안에 넣습니다.
2. 프로젝트 루트 폴더에서 아래 명령어를 실행합니다.

```bash
pnpm asset-utils generate <클라이언트 jar 파일 경로> <서버 jar 파일 경로> <추출한 리소스를 저장할 폴더 경로>
```

- 클라이언트 jar 파일과 서버 jar 파일 경로는 `asset-utils` 폴더를 기준으로 탐색합니다. 예를 들어, workdir 폴더 안에 `minecraft-1.21.1-client.jar` 파일을 넣었을 경우 경로를 `workdir/minecraft-1.21.1-client.jar`와 같이 입력하면 됩니다.
- 추출한 리소스를 저장할 폴더 경로는 `output` 폴더를 기준으로 탐색합니다. 예를 들어, 경로로 `1.21.1`을 입력할 경우 `output/1.21.1` 경로에 폴더가 생성되고 그 안에 추출한 리소스를 저장하게 됩니다.
- 예시로 workdir 폴더 안에 `minecraft-1.21.1-client.jar` 파일과 `minecraft-1.21.1-server.jar` 파일이 있고 추출된 리소스를 `output/1.21.1` 폴더에 저장하고 싶을 경우, 아래와 같이 전체 명령어를 입력하게 됩니다:

```bash
pnpm asset-utils generate workdir/minecraft-1.21.1-client.jar minecraft-1.21.1-server.jar 1.21.1
```

3. 리소스 추출 및 저장이 완료될 때까지 기다립니다. 추출된 리소스 데이터는 `output/<지정한 경로>`에 저장됩니다.

## 로컬 CDN 서버 실행

로컬 CDN 서버는 [`serve`](https://npmjs.com/package/serve)를 사용하여 가동합니다. 아래 명령어를 입력하여 서버를 실행할 수 있습니다:

```bash
pnpm asset-utils serve
```

실행 후 http://localhost:3000 으로 접속하면 파일을 확인할 수 있습니다. 루트 폴더는 `output`입니다.
serve 서버의 옵션을 변경하고 싶다면 명령어 뒤에 argument로 지정하거나, `output/serve.json` 파일을 수정하면 됩니다.
