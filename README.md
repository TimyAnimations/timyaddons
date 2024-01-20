# Timy Addons Beta 14.1
Timy Addons is a ChatTriggers module with features to assist with Hypixel Skyblock. Some key features include a mythological burrow guesser, garden plot minimap, required items list with command shortcuts, and kuudra safespots. \
This project is in early development and alot is likely to change! \
**All features are off by default!** Open the settings with `/timyaddons` to enable them.

## How To Install
This project is currently early access so it must be installed manually

1. Download [TimyAddons-Beta_14.1.zip](https://github.com/TimyAnimations/timyaddons/releases/tag/v0.14.1-beta)
2. Run `/ct files` in minecraft, this will open up your ChatTriggers directory.
3. Navigate into the `modules` folder.
4. Move the `TimyAddons` folder from `TimyAddons-Beta_14.1.zip` to the `modules` folder.
5. Run `/ct load` in minecraft.

If you are updating from a previous version allow it to replace files with the same name. If `/timyaddons` no longer works after updating, delete the `data` folder and restart your game. This will unfortunately reset your settings, but should fix any incompatibilities between versions.
## Warning
This mod is developed with consideration of the **Hypixel Allowed Modifications**, detailed here https://support.hypixel.net/hc/en-us/articles/6472550754962-Hypixel-Allowed-Modifications. \
That being said, this mod is **use at your own risk**. \
\
Some features use chat macros (automatically sending one or more chat message or command with little to no user input) and may fall in a gray area with the rules. Through example of other popular skyblock mods, and not being explicitly disallowed like other types of macros, I believe these to be allowed on the Hypixel server.
### If you do not agree these are the settings to avoid:
- The general rule of thumb is avoid anything with the keyword **auto** or **announce**.
- General
    - Announce Failed Warps to Party (**ENABLED**: sends `/pc` as a response to a message in chat) 
- Dungeons
    - Autoshow Extra Stats (**ENABLED**: sends `/showextrastats` as a response to a message in chat)
    - Autorequeue Instance (**ENABLED**: sends `/instancerequeue` as a response to a message in chat)
    - Dungeon Sack Item List (**SET TO "List and Auto Sack"**: sends one or more `/getfromsack` as response to entering a dungeon or kuudra lobby)
- Kuudra
    - Announce When Ready to Party (**ENABLED**: sends `/pc` as a response to clicking an item in a gui)
- Mythological
    - Announce Minos Inquisitors (**ENABLED**: sends `/pc` as a response to a message in chat) 
- Items (Clicking [SACK ALL] in chat sends multiple `/getfromsack`)
    - Crimson Isles Required Items List (**SET TO "List and Auto Sack"**: sends one or more `/getfromsack` as response to specific messages in chat or clicking items in a gui)
    - Crystal Hollows Required Items List (**SET TO "List and Auto Sack"**: sends one or more `/getfromsack` as response to specific messages in chat)
    - Garden Visitor Required Items List (**SET TO "List and Auto Sack"**: sends one or more `/getfromsack` as response to opening a gui with a specific item)
    - NPC Shops Required Items (**SET TO "List and Auto Sack"**: sends one or more `/getfromsack` as response to specific messages in chat)


## Changelog
### 0.14.1
- Added version to `metadata.json`.
- Replaced the placeholder version "(1.0.0)" in the main setting's title with the actual version.
- Changed the title of the other setting "pages".

### 0.14.0
- Fixed the text for a found burrow rendering behind the beacon when the Guess and Burrow waypoint overlap.
- Fixed the game crash when searching in the settings menu!
- Added multiple line support to waypoint titles, nearest warp will now show below the Guess string rather then next to it, similarly waypoints from chat with additional information will show that information below the user's name.
- Persistent data (like gui locations, plot names, keybinds, and setting configs) are now located in the "data" folder. This does mean all settings will be re**set to default on first load.**
- Reworked the Settings menu and added different "pages" for certain settings, including mythological waypoint colors, dungeon sack item counts, and developer settings (accessed by `/timyaddons developer`).
     - Added setting to reset mythological waypoint colors to default colors.
     - developer settings currently has the mythological "nerd stuff" settings.
- Optimized the logic for when a guess burrow and found burrow overlap, this check was previously every frame, but now is only ran when the guess position is adjusted or when a found burrow is updated.
- Added logic to move a guess to a found burrow that is very close.
- Optimization where the guess calculation will stop when the guess overlaps a found burrow. There is no reason for it to keep looking and continuing to update may cause it to jump away from and back to the burrow.

### 0.13.2
- fixed a bug with the guess position calculation, happened when the backup method was used to find a grass block
- added a "exit distance" value to warps that need time to exit (wizard and crypt), meaning these warps will only be suggested if the amount of blocks it takes to "exit" from the warp + the distance from the "exit" to the guess burrow is still closer then your current position
- minor optimizations and code cleanup

### 0.13.1
- more tweaking parameters for burrow detection
- guess will consider nearby burrows, and set itself to a burrow that is on any of the guesses or within 3 blocks of it's average guess
- adding more visual options for waypoints
  - Show box behind text
  - Show beacon beam
  - Show infront of world
  - Show distance from waypoint (moved to visual options)

### 0.13.0
- fixed bug related to the burrow detection system not filtering particles correctly
- tweaked parameters for burrow detection, the goal with these tweaks is to keep the detection snappy, but minimize false positives.
- fixed rabid flickering burrows, if a burrow shows (even if it's a false positive) it will not hide for at least a second.
- made the check for the path burrow heading towards a grass block only evaluated if the path is heading significantly downwards, shallow slopes would occasionally find a grass block that is significantly off from the actual burrow.
- distance to nearest warp now considers vertical distance (helps with wizard tower warp sometimes bringing you farther then closer)
- added an option to show the distance of a waypoint
- fixed "auto show extra stats" and removed redundant info that is found in both the end message and the extra stats message, making a more seamless end message that contains the extra stats.
- added `/pt {player}` as a shortcut for party transfer, `/pt` without an argument will still run /playtime

### 0.12.1
- added another check for if the path burrow path is heading down towards a grass block
- added more checks to find a grass block from a guess

### 0.12.0
- rewrote burrow detection, should be faster to showing up a burrow and removing burrows that are no longer there
- guess waypoint now moves smoothly and is easier to follow, the smoothness can be adjusted in the settings (0 smoothness will move almost as fast as before)
- rewrote string rendering to account for the far clipping plane, the string of the waypoint will always be visible even if you get too far away now
- garden minimap will now update pest information when you open the configure plot menu at the desk
- pest information on the minimap will stay even if you leave and rejoin the garden

### 0.11.0
- improved grass heightmap

### 0.1.0 - 0.10.0 (Early builds with no documented changes)