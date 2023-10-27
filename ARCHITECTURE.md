# KiwiTalk architecture
This document gives you brief information about the project internals.
You may find it useful if you have interest in contributing to this project.

## Contents
- [KiwiTalk architecture](#kiwitalk-architecture)
  - [Contents](#contents)
    - [Backend](#backend)
      - [`kiwi-talk-app`](#kiwi-talk-app)
      - [`headless-talk`](#headless-talk)
      - [`talk-loco-client`](#talk-loco-client)
      - [`talk-api-internal`](#talk-api-internal)
      - [Templates](#templates)
    - [Frontend](#frontend)

### Backend
Backend uses Rust, and it's core part of this project.
Unlike many web apps, KiwiTalk extensively uses Rust if possible.
It makes the client lightweight and helps scale it better.

There are two types of crates.
- **App crate**: Located in `backend/bin/app`. Used internally and not published.
- **Libary crate**: Located in `backend/crates`. Independently usable.

#### `kiwi-talk-app`

- Main crate for KiwiTalk backend.

You'll find it in `backend/bin/app`.

The crate also contains the Tauri configuration `tauri.conf.json` and resources for application icons.

The crate does not have full code. Instead, each function is divded into crates and composed via the Tauri plugin.
You can find them in `backend/bin` directory.

Widely used dependencies are in the workspace `Cargo.toml`.

#### `headless-talk`
This crate implements headless talk on top of `talk-loco-client`.

#### `talk-loco-client`
Declares various loco protocol commands used by official client.
Provides interface to send commands, deserialize read commands.

To reduce repeated work, this crate uses a number of macros.

#### `talk-api-internal`
This crate abstracts various internal REST API calls.

#### Templates
Templates are used for creating app crates (in `backend/bin`) or library crates (in `backend/crates`) easily.

Install `cargo-generate` using command below.
```sh
cargo install cargo-generate
```

Use `cargo gen` command to create new crate using template.

### Frontend
In the frontend side, user interfaces are implemented.
It uses `Solid.js` for implementing user interface.
As well as `vanilla-extract` for styling.

Resources like fonts can be found in `frontend/public`.
