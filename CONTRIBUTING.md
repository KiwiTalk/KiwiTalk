# Contributing to KiwiTalk
Thank you for your interest in contributing KiwiTalk!
This documentation contains
- project summary and design goals of KiwiTalk
- how to setup development environment
- how to add new feature or fix bugs

Before you start, checkout community's [Code of Conduct](./CODE_OF_CONDUCT.md)
and if you'd like, join [Discord](https://discord.gg/vVs8WVY3y6) server.

For detailed project strcuture, checkout [ARCHITECTURE.md](./ARCHITECTURE.md).

## About KiwiTalk
KiwiTalk is open-source alternative `KakaoTalk` client.
The project is currently focusing on supporting OS where official client does not run.

## Design goals
KiwiTalk currently has following design goals:
- **Lightweight**: Uses only necessary resources, unload when it is not used
- **Portable**: Easily move user data between devices
- **Fast**: App runs performant, responsive and parallel
- **Modular**: Split large codes into replacable modules

**Note**: Official client & server is proprietary and undocumented, so
A lot of experiments need to be done.
This means a lot of code can be changed quickly over time.

## Development environment
KiwiTalk is `tauri` project. Please follow [Tauri development prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites/).

`pnpm` is being used to run various commands and frontend package management.
If you don't have pnpm installed, please follow [pnpm installation guide](https://pnpm.io/installation).

Install frontend dependencies using command:
```sh
pnpm install
```

### Launch
To launch KiwiTalk uses command below:
```sh
pnpm run dev
```

If you are running on Windows Subsystem for Linux, follow [Microsoft official document](https://learn.microsoft.com/en-US/windows/wsl/tutorials/gui-apps).

### Storybook
Storybook is used for designing gui components.
To run storybook uses command below:
```sh
pnpm run storybook
```

Also checkout [KiwiTalk UI Mockup](https://www.figma.com/file/JYO6jyz0Kji2KiPCW5cH5o/KiwiTalk-UI-Mockup-2?node-id=0%3A1).

## Add new feature or fix bugs
Navigate to [issues](https://github.com/KiwiTalk/KiwiTalk/issues) page and finds issues tagged with `Status: Available`.
If you are first, it is good to starts with issues tagged with `good first issue`.

1. Login to Github and fork KiwiTalk repository.
Clone forked repository using
```sh
git clone https://github.com/<username>/KiwiTalk.git
```
**Note**: Change `<username>` to your Github username.

2. Enter to repository directory
```sh
cd KiwiTalk
```

3. Make changes, commit and push. For example:
```sh
git add *
git commit -m "feat: implement new feature"
git push
```
**Note**: Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

4. Create pull request to dev branch. [Pull requests](https://github.com/KiwiTalk/KiwiTalk/pulls) 
