# Windows 10/11 test plan

Windows packaging is configured but cannot be validated on the current Apple Silicon development machine. Before calling a Windows build supported, test it on clean Windows 10 and Windows 11 x64 machines.

## Installation

- Install from the NSIS `setup.exe` as a standard user.
- Install from the MSI package.
- Confirm WebView2 bootstrap behavior when WebView2 is absent or outdated.
- Confirm uninstall removes the application without deleting unrelated user files.

## Application behavior

- Verify all 78 neuropils load while offline.
- Rotate, zoom and select multiple regions.
- Toggle all six functional systems.
- Test Chinese and English text rendering.
- Test 100%, 125%, 150% and 200% display scaling.
- Test common 1920×1080 and 1366×768 displays.

## Release readiness

- Verify the installer and executable signatures.
- Check Microsoft Defender and SmartScreen behavior.
- Confirm the installed version and publisher information.
- Record the tested Windows edition, build number and hardware in the release notes.
