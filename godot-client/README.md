# Godot Client

## Goal

This is the only game client path kept in the repository after cleanup.

Target workflow:

1. Develop gameplay in Godot on Linux
2. Keep Douyin-specific logic in a thin adaptation layer
3. Export Godot web/canvas build or custom runtime package
4. Wrap exported files with Douyin mini-game root files

## Recommended Version

- Godot `4.2+`

## Current Structure

- `project.godot`: Godot project entry
- `scenes/`: playable scene skeleton
- `scripts/`: gameplay and platform-facing scripts
- `docs/`: Douyin adaptation plan and migration notes
- `minigame-template/`: Douyin root file templates for packaging

## Next Work

1. Open project in Godot editor on Linux
2. Rebuild the deep-sea gameplay scene in Godot
3. Add a Douyin bridge for:
   - login
   - rewarded ads
   - request
   - storage
4. Export and package into Douyin mini-game structure
