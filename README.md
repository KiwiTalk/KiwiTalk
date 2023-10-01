[discord-invite]: https://discord.gg/vVs8WVY3y6
[discord-shield]: https://discord.com/api/guilds/1024212069349855232/widget.png

# _KiwiTalk_ [![CodeFactor](https://www.codefactor.io/repository/github/kiwitalk/kiwitalk/badge?s=c3981bac3a87fe9d0f0c5fdb854efd203b389649)](https://www.codefactor.io/repository/github/kiwitalk/kiwitalk) [![DeepScan grade](https://deepscan.io/api/teams/13288/projects/16289/branches/346077/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=13288&pid=16289&bid=346077) [ ![discord-shield][] ][discord-invite]

![banner](./img/banner.gif)

**카카오톡 재구현 프로젝트 (SolidJS & Tauri & Rust)**

## 주의사항

```
KiwiTalk은 카카오톡이 제공되지 않는 기기 및 OS (예: Ubuntu, Arch Linux)를 위해 연구 목적으로 만들어졌습니다.
이 소스코드는 Kakao Corp.이 만들거나 인가하지 않았으며, 언제든지 이용이 제한될 수 있습니다.
즉, KiwiTalk을 통해 이루어지는 모든 활동에 대한 모든 책임은 전적으로 사용자에게 있습니다.
```

## 개발

[프로젝트 간략 구조도](./img/big-picture.svg)

프로젝트 기여를 생각하고 계시다면 [CONTRIBUTING.md](./CONTRIBUTING.md)를 우선 읽어 주세요.
- [Discord](https://discord.gg/vVs8WVY3y6): 공식 디스코드 서버
- [KiwiTalk UI Mockup](https://www.figma.com/file/JYO6jyz0Kji2KiPCW5cH5o/KiwiTalk-UI-Mockup-2?node-id=0%3A1): 프론트엔드 디자인 목업

프로젝트 구조에 대한 더 자세한 문서는 [ARCHITECTURE.md](./ARCHITECTURE.md)에서 확인 하실 수 있습니다.

## 실행 (개발 환경)

### 사전 요구 사항

개발 환경에서 프로젝트를 실행하기 위해 다음 요구 사항을 충족시켜야 합니다.

- 본 프로젝트가 Tauri를 사용하기 때문에 [Tauri 개발을 위한 사전 요구 사항](https://tauri.app/ko/v1/guides/getting-started/prerequisites/)을 충족시켜야 합니다.
  해당 글에서 지시하는 대로, Tauri 개발 환경을 구축시켜주시기 바랍니다.
- 이 프로젝트는 프론트엔드 패키지 관리에 pnpm을 사용하고 있습니다.
  [설치 안내서](https://pnpm.io/installation)를 따라, pnpm 설치를 완료시켜주시기 바랍니다.

### 의존성 설치

아래 명령어를 실행해 npm 의존성을 설치합니다.

```sh
pnpm install
```

### KiwiTalk 실행

아래 명령어를 실행해 KiwiTalk을 실행합니다. GUI 창을 띄워야 하므로, 적절한 GUI 설정이 존재하는지 확인하시기 바랍니다.
예를 들어, Linux용 Windows 하위시스템(WSL)을 사용하시는 경우, [Microsoft 공식 문서](https://learn.microsoft.com/ko-kr/windows/wsl/tutorials/gui-apps)를 참조해 설정하시기 바랍니다.

```sh
pnpm run dev
```

### Storybook 실행

본 프로젝트는 디자인 시스템 구축을 위해 Storybook을 사용하고 있습니다.
Storybook을 실행하려면 아래 명령어를 실행하시기 바랍니다.

```sh
pnpm run storybook
```
