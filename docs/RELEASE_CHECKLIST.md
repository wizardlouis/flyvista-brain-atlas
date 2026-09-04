# Release checklist

## Before tagging

- [ ] Confirm `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, `CITATION.cff` and `CHANGELOG.md` use the same version.
- [ ] Run `pnpm check`.
- [ ] Run `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`.
- [ ] Run `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`.
- [ ] Build and launch the Apple Silicon application while offline.
- [ ] Verify all 78 PLY assets are present.
- [ ] Review data attribution and third-party licenses.
- [ ] Confirm no credentials, certificates or local absolute paths are tracked.

## Alpha release

- [ ] Create a semantic version tag such as `v0.1.0-alpha.0`.
- [ ] Confirm GitHub Actions produces macOS ARM64, macOS Intel and Windows x64 artifacts.
- [ ] Mark the GitHub Release as a pre-release.
- [ ] Document that Windows and Intel macOS builds need real-device verification if not yet tested.
- [ ] Publish SHA-256 checksums for downloadable artifacts.

## Stable public release

- [ ] Replace the placeholder alpha application icon with final FlyVista artwork.
- [ ] Sign and notarize the macOS DMG with a Developer ID certificate.
- [ ] Sign Windows installers using Microsoft Artifact Signing or another trusted certificate.
- [ ] Test installers on clean physical or virtual machines.
- [ ] Enable GitHub release immutability after the release process is stable.
