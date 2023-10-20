# 🪅 Fake Pinata

Drips uses [Pinata](https://www.pinata.cloud/) to pin & read metadata to and from IPFS. Within our E2E tests, we needed a way to "simulate" the very basic functions of the Pinata API & Gateway — pinning and retrieving IPFS docs —, so we wrote this tiny little server. It simply allows "pinning" JSON, and then retrieving it later.

There's no DB, it just uses a global variable. Which is fine, because this server is only inteded to be ran in the context of a single E2E test.

The server is based on express, and uses Typescript for some reason.

## Build & RUN

```sh
# Install deps
npm install

# Build the server into /dist
npm run build

# Run the previously-built server
npm run start
```
