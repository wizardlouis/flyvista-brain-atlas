# Changelog

All notable changes to FlyVista are documented here.

## [Unreleased]

## [0.1.0-alpha.1] - 2026-09-09

### Added

- Separate macOS Intel (`x86_64`) DMG builds alongside Apple Silicon (`arm64`) builds.
- Automated release checksums covering both macOS architectures.

### Known limitations

- The Intel package has passed cross-architecture build validation but still requires testing on a physical Intel Mac.
- macOS packages use ad-hoc signatures and are not notarized, so Gatekeeper may display a warning.

## [0.1.0-alpha.0] - 2026-09-03

### Added

- Offline visualization of 78 adult Drosophila neuropil meshes.
- Six functional-system visibility controls.
- Region selection with Chinese and English descriptions.
- Front, top and side camera presets.
- Tauri 2 desktop packaging for macOS and Windows.
- GitHub CI and tag-driven release workflows.

### Known limitations

- The Windows packages are configured but have not yet been tested on a physical Windows 10 or Windows 11 computer.
- Public release builds are initially unsigned; operating systems may display security warnings.
