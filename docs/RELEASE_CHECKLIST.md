# Release checklist

## Before tagging

- [ ] Confirm `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, `CITATION.cff` and `CHANGELOG.md` use the same version.
- [ ] Run `pnpm check`.
- [ ] Run `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`.
- [ ] Run `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`.
- [ ] Build and launch the Apple Silicon application while offline.
- [ ] Build the Intel application and verify its executable reports the `x86_64` architecture.
- [ ] Verify all 78 PLY assets are present.
- [ ] Review data attribution and third-party licenses.
- [ ] Confirm no credentials, certificates or local absolute paths are tracked.

## Alpha release

- [ ] Create a semantic version tag such as `v0.1.0-alpha.1`.
- [ ] Confirm GitHub Actions produces macOS ARM64 and macOS Intel DMG artifacts.
- [ ] Mark the GitHub Release as a pre-release.
- [ ] Document that the Intel macOS build needs real-device verification if not yet tested.
- [ ] Publish SHA-256 checksums for downloadable artifacts.

## Stable public release

- [ ] Replace the placeholder alpha application icon with final FlyVista artwork.
- [ ] Sign and notarize the macOS DMG with a Developer ID certificate.
- [ ] Sign Windows installers using Microsoft Artifact Signing or another trusted certificate.
- [ ] Test installers on clean physical or virtual machines.
- [ ] Enable GitHub release immutability after the release process is stable.
