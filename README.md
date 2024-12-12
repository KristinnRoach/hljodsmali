# Hljóð Smali

A browser-based audio sampling and playback application that lets you quickly record sounds and play them back polyphonically using your computer keyboard.

## [Live Demo](https://hljod-smali.vercel.app/)

> **Note:** Currently optimized for Chrome browser with Icelandic keyboard layout. Support for additional browsers and keyboard layouts coming soon.

## Features

- Real-time audio recording and playback
- Keyboard-based sample triggering with piano-style layout
- Loop functionality with adjustable start/end points
- Sustain mode for extended sample playback
- Sample management system
- Core sample parameters adjustable

## Quick Start Guide

### Recording

1. Click the 'Record' button to toggle audio recording
2. Begin making sound slightly before clicking record to capture the full audio
   (or trim the start point afterwards)
3. Click 'Record' again to stop

### Playback

- Use your computer keyboard as a virtual piano
- Base pitch is mapped to 'q' key
- Lower octave starts at 'z'
- View the keyboard layout using the 'Switch Visualizer' button

### Playback Modes

- **Loop Mode**: Toggle with Capslock or 'Loop' button
  - Experiment with loop points (e.g. short loops and high-cut for synthesizer-like effects)
- **Sustain Mode**: Toggle with Tab or 'Hold' button
  - Plays sample to completion regardless of when key is released

### Sample Management

Access your recorded samples through the 'Samples' menu, where you can:

- View all recorded samples
- Select active sample for playback
- Access sample-specific settings

### Audio Sample Settings

Each sample has the following adjustable parameters:

| Setting    | Description                                 |
| ---------- | ------------------------------------------- |
| Start      | Playback start point (trim initial silence) |
| End        | Playback end point (trim trailing sounds)   |
| Loop Start | Loop section beginning                      |
| Loop End   | Loop section end                            |
| Attack     | Volume fade-in duration                     |
| Release    | Volume fade-out duration                    |
| Low Cut    | High-pass filter (leftmost = disabled)      |
| High Cut   | Low-pass filter (rightmost = disabled)      |

## Upcoming Features

- User authentication
- Persistent data storage for logged in users
- Enhanced UI
- Cross-browser compatibility improvements
- Additional feature implementations
