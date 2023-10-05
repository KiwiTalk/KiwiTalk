# KiwiTalk architecture
This document gives you brief informations about project internals.
You may find it useful if you have interests in contributing to this project.

## Contents
- [KiwiTalk architecture](#kiwitalk-architecture)
  - [Contents](#contents)
    - [Backend](#backend)
      - [`kiwi-talk-app`](#kiwi-talk-app)
      - [`kiwi-talk-client`](#kiwi-talk-client)
      - [`talk-loco-client`](#talk-loco-client)
      - [`talk-api-client`](#talk-api-client)
      - [Templates](#templates)
    - [Frontend](#frontend)

### Backend
Backend is uses rust, and it's core part of this project.
Unlike many web apps, KiwiTalk extensively uses `rust` if possible.
It makes client lightweight and to scale better.

There are two types of crates.
- **App crate**: Located in `backend/bin/app`. Used internally and not published.
- **Libary crate**: Located in `backend/crates`. Independently usable.

#### `kiwi-talk-app`
Main crate for KiwiTalk backend.
You may find it in `backend/bin/app`.
The crate also contains tauri configuration `tauri.conf.json` and resources for application icons.

The crate does not have full code. Instead each functions divded to crates and composed via tauri plugin.
You can find them in `backend/bin` directory.

Widely used dependencies are in workspace `Cargo.toml`.

#### `kiwi-talk-client`
This crate implements actual usable clients on top of `talk-loco-client`.

#### `talk-loco-client`
Declares various loco protocol commands used by official client.
Provides interface to send commands, deserialize read commands.

To reduce repeated work, this crate uses amount of macro.

#### `talk-api-client`
This crate abstracts various internal REST api calls.
Provides api for login and device registration.

#### Templates
Templates are for creating app crates (in `backend/bin`) or library crates (in `backend/crates`) easily.

Install `cargo-generate` using command below.
```sh
cargo install cargo-generate
```

Use `cargo gen` command to create new crate using template.

### Frontend
In frontend side user interfaces are implemented.
It uses `Solid.js` for implementing user interface.
As well as `vanilla-extract` for styling.

Resources like fonts can be found in `frontend/public`.
