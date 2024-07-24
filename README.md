# Timy Addons Beta 16.6
Timy Addons is a ChatTriggers module with features to assist with Hypixel Skyblock. Some key features include a mythological burrow guesser, gui tab widgets, garden plot minimap, required items list with command shortcuts, and kuudra safespots. \
This project is in early development and alot is likely to change! \
**All features are off by default!** Open the settings with `/timyaddons` to enable them.

## How To Install
This project is currently early access so it must be installed manually

1. Download [TimyAddons-Beta_16.6.zip](https://github.com/TimyAnimations/timyaddons/releases/tag/v0.16.6-beta)
2. Run `/ct files` in minecraft, this will open up your ChatTriggers directory.
3. Navigate into the `modules` folder.
4. Move the `TimyAddons` folder from `TimyAddons-Beta_16.6.zip` to the `modules` folder.
5. Run `/ct load` in minecraft.

If you are updating from a previous version allow it to replace files with the same name. If `/timyaddons` no longer works after updating, delete the `data` folder and restart your game. This will unfortunately reset your settings, but should fix any incompatibilities between versions.
## Warning
This mod is developed with consideration of the [Hypixel Allowed Modifications](https://support.hypixel.net/hc/en-us/articles/6472550754962-Hypixel-Allowed-Modifications). \
That being said, this mod is **use at your own risk**. \
\
Some features use chat macros (automatically sending one or more chat message or command with little to no user input) and may fall in a gray area with the rules. Through example of other popular skyblock mods, and not being explicitly disallowed like other types of macros, I believe these to be allowed on the Hypixel server.
### If you do not agree these are the settings to avoid:
- The general rule of thumb is avoid anything with the keyword **auto** or **announce**.
- General
    - Announce Failed Warps to Party (**ENABLED**: sends `/pc` as a response to a message in chat) 
- Mining
    - Announce Found Glacite Mineshaft (**ENABLED**: sends `/pc` as a response to a message in chat)
    - Transfer party to Glacite Mineshaft finder (**ENABLED**: sends `/party transfer` as a response to a message in chat)
- Dungeons
    - Autoshow Extra Stats (**ENABLED**: sends `/showextrastats` as a response to a message in chat)
    - Autorequeue Instance (**ENABLED**: sends `/instancerequeue` as a response to a message in chat)
    - Dungeon Sack Item List (**SET TO "List and Auto Sack"**: sends one or more `/getfromsack` as response to entering a dungeon or kuudra lobby)
- Kuudra
    - Announce When Ready to Party (**ENABLED**: sends `/pc` as a response to clicking an item in a gui)
- Mythological
    - Announce Minos Inquisitors (**NOT SET TO "Off"**: sends `/ac`, `/pc`, or `/cc` as a response to a message in chat) 
- Items (Clicking **[SACK ALL]** in chat sends multiple `/getfromsack`)
    - Crimson Isles Required Items List (**SET TO "List and Auto Sack"**: sends one or more `/getfromsack` as response to specific messages in chat or clicking items in a gui)
    - Crystal Hollows Required Items List (**SET TO "List and Auto Sack"**: sends one or more `/getfromsack` as response to specific messages in chat)
    - Garden Visitor Required Items List (**SET TO "List and Auto Sack"**: sends one or more `/getfromsack` as response to opening a gui with a specific item)
    - NPC Shops Required Items (**SET TO "List and Auto Sack"**: sends one or more `/getfromsack` as response to specific messages in chat)

## Features
- **General**
    - **Time Since Last In Lobby** \
    When rentering a lobby, indicate in chat how long it has been since you've been in that lobby
    - **Announce Failed Warps to Party** \
    Let's your party know when you fail to be warped in
- **Garden**
    - **Show Plot Borders** \
    Renders an outline around the current garden plot's borders
    - **Plot Minimap** \
    Draws a minimap showing the plots as well as pest and sprayonator information
    - **Plot Minimap Teleport Shortcut** \
    Shows the map while in your inventory, clicking on a plot will teleport you there
    - **Pest Hitbox** \
    Draws a box around the pest, making it easier to see
    - **Trace Pest Tracker Line** \
    Draws a path from the tracker's particles, making it more clear where it's pointing
    - **Lower Sensitivity Near Target Angle** \
    Lowers your mouse sensitivity as your angle gets close to a set value while holding an assigned tool
- **Slayer**
    - **Track Slayer Rates** \
    Show and keep track of the time it takes to for you to spawn and kill a slayer boss
- **Combat**
    - **Full Dominus Stack Warning** \
    Warn when the Dominus stacks are no longer full
- **Mining**
    - **Commission Waypoints** \
    Show a waypoint to area's where you can complete your current commissions
    - **Dwaven Base Campfire Waypoint** \
    Show a waypoint back to the Dwarven Base Camp when you are cold
    - **Fossil Excavator Solver** \
    Show possible solutions to uncovering hidden fossils while in the Fossil Excavator
    - **Glacite Mineshaft warning and party features** \
    Warn and announce to party when a Glacite Mineshaft spawns, auto transfer party to the announcer
    - **Glacite Mineshaft shareable waypoints**
    Add waypoints for the Mineshaft exit and found frozen corpse that can be shared with the waypoint manager
- **Fishing**
    - **Mute Sounds While Fishing** \
    Mutes all sounds except for the "note pling" sound for 30 seconds after casting a rod
    - **Blazing Aura AFK Warning** \
    When wearing `Blaze Armor` or `Frozen Blaze Armor`, warn when the Blazing Aura ability deactivates due to lack of movement
- **Bestiary**
    - **Broodmother Respawn Warning** \
    Keeps track of when the broodmother will respawn
- **Dungeons**
    - **Autorequeue Instance** \
    Automatically requeue for a new instance after a set amount of time
    - **Autoshow Extra Stats** \
    Automatically shows the Extra Stats at the end of the dungeon
- **Kuudra**
    - **Highlight Safe Spots** \
    Highlight blocks considered safe in the Kuudra fight. Blue highlights are only conditionally safe, while Green is typically always safe
    - **Announce When Ready to Party** \
    After opening a chest, automatically announce to the party that you are ready
- **Mythological**
    - **Next Burrow Guesser** \
    Uses the dug burrow arrow, and Ancestral Spade to guess the next position
    - **Nearest Warp Keybind** \
    Press a key to use the warp closest to the predicted next burrow location
    - **Found Burrow Waypoints** \
    Show a waypoint at seen burrows and indicate the type
    - **Announce Minos Inquisitor** \
    Send current coordinates to the chat when a Minos Inquisitor is dug up
- **Waypoints**
    - **Waypoint shown time** \
    The time in seconds a waypoint will be shown, set to 0 for persistant waypoints, waypoints get reset on world changes
    - **Show offscreen waypoints** \
    Displays a line or arrow pointing in the direction of a waypoint that is off the screen
    - **Show distance from waypoint** \
    Displays your distance to the waypoint in meters
    - **Waypoint from coordinates in chat** \
    Put a waypoint at coordinates seen in chat, options for party, co-op, and all chat
- **Items**
    - **NPC Shops Required Items** \
    Show an item list when you attempt to buy something without having the required items
    - **Garden Visitor Required Items List** \
    Show an item list of the required items from a garden visitor when the npc's menu is opened
    - **Crimson Isles Required Items List** \
    Show an item list of the required items for faction quest
    - **Crystal Hollows Required Items List** \
    Show an item list of the required items to get a crystal
    - **Dungeon Sack Items List** \
    Show an item list of common sack items used in dungeons
    - **Item List In Menu** \
    Show the item list as a GUI, with clickable shortcuts, while in inventory menus
    - **Sack, Bazaar, and Crafting shortcut** \
    Add clickable shortcuts to items in the item list
- **Widgets**
    - **Gui Tab Widgets** \
    Show a moveable gui display for any tab widgets found in the current area
- **Misc**
    - Running `/pt <username>` will run `/player transfer <username>`


## Changelog
### 0.16.6
- Added DIVINE rabbits to hoppity collection gui
- Added Hoppity Hunt gui, displaying timers for the next eggs, as well as your status on collecting the previous one
- Show unseen egg locations (local only)
    - egg locations are stored in the api but currently it only goes off what was marked as seen locally
- Added Crown of Avarice coin tracker
- Added WIP cooldown display
- Added WIP Fire Freeze Timer
- Added Sadan and Giant spawn timer
- Made it so each pest is now highlighted a different color based off the group they drop
- Added "Swap Attack and Jump Keybinds" for garden farming tool features
- Added speed as a value you can set on a farming tool
- Added "warp stonks" to the diana solver
- Optimizations to font rendering
- Developer option "or pvp boss"

### 0.16.5
- Updated chocolate factory features to include the two new employees
- Added some developer options for chocolate factory
    - Show the cost per value breakdown of each upgrade
    - Show cumulative upgrades for time tower and rabbit shrine
    - Show estimated shop milestone "upgrades" and values
- Added "Total Powder" to mining features, showing your total powder when in the HOTM menu
- Fixed a bug where Chocolate Factory and Hoppity Collection widgets will show up even when disabled while editing widgets

### 0.16.4
- Fixed a bug where the chocolate per second will not propely ignore the time tower multiplier when it runs out of time
- Time Tower charge count and next charge time will now be estimated when the original time runs out (currently assumes next time is 8 hours and not 7 hours)
- Adjusted some of the chocolate factory equations to better compare the value of employees vs coach jackrabbit and the time tower
- Added Hoppity Collection Tracker and GUI
- Added Warning sound for Chocolate Egg Spawns
- Removed Autowarp party into Mineshaft as it isn't as useful anymore with the new limit of 4 players total
- Added Announce Frozen Corpses to Party

### 0.16.3
- Fixed a bug with "Wish Available" low tank warning not detecting wish cooldown properly
- Re-formatted and updated the Chocolate Factory Optimizer
    - Added Header for Upgrades section
    - Modify the line for Rabbit employees to cut out the employee title, and only show level and name
    - Replaced text "BEST" with a star icon
    - Added Prestige information and estimated time to prestige
    - Added Time Tower information
    - Estimation time calculation now considers when an active Time Tower will end
    - When getting a new rabbit, your chocolate per second will be updated without needing to open the factory menu
    - In Menu, Time Tower is now framed when its more "optimal" then any of the employee upgrades, however because of it's charge cooldown it may make more sense to wait on upgrading it until you are closer to full charges, so it does not replaces the frame on the most optimal employee.
    - Coach Jackrabbit upgrade can now be the best upgrade
- Added Hoppity's Hunt Possible Egg Waypoints

### 0.16.2
- Added sound when best upgrade is available
- Added animated chocolate change text (it liek real cookie clicker kinda)
- Removed the "true cps" as it wasn't the most accurate, it was hard to calculate with inconsistent tps

### 0.16.1
- Tweaks to slayer hitboxes so that they only show if the boss if found and their hp is above 0
- Fixed a bug with pest hitboxes lagging behind the targeted armorstand, and made small adjustments to the size of the hitbox
- Changed the color of the pest tracker traced line to green
- Added several features for Chocolate Factory

### 0.16.0
- Added safegaurd to reading tablist and scoreboard information for the cases when it attempts to read it while the world is unloaded
- Frozen Corpses will now be recognized when you approach a possible corpse location
- Tweaked visuals of the fossil solver
- Added common transfer party commands to transfer to "Transfer to glacial mineshaft finder"
- "Announce glacial mineshaft" will now also say ".transfer" in party chat
- Added a auto party warp when entering a mineshaft
- Modified the equation for rendering the offscreen waypoint arrow to find a point on an ellipse rather then a circle to better fill out your monitors aspect ratio
- Added a feature to warn when the Tank in your party is low
- Fixed an issue with tab widgets not being hidden or removed when the setting is disabled
- Fixed an issue with low performance with parenting widgets to others and issue with possible parent child cycles
- Fixed an issue with commission waypoints still showing offscreen when the setting is set to "OFF"
- Fixed an issue with pest tracker due to changes with the particles used
- Added a feature to show hitboxes of slayer bosses, with your own boss being colored differently

### 0.15.9
- Fixed an issue with the Fossil Excavator solver rendering behind the gui background texture
- Fossil Excavator solver now show's remaining charges as well as highlights fossil progress red if you do not have enough charges to complete the fossil
- Removed debug message when entering a glacite mineshaft and tweaked the message when you find an unknown forzen corpse location

### 0.15.8
- Fixed a possible crash with loading image assets due to using deprecated ChatTriggers feature
- Fossil Excavator solver now shows best possible spot for a fossil before finding a fossil
- Added welcome page to the settings menu, with quick presets for disabling everything or turning on recommended settings

### 0.15.7
- Fixed a bug with garden minimap not calculating the relative mouse position correctly when using 16:9 move or alignments other then top left
- Added parenting of gui wigets to eachother, this is done by selecting the child and then shift clicking on the parent, moving the child will unparent it
    - even though I added snap to align under each element, parenting ensures that the child will stay under the parent even if it changes in size (i.e. the amount of lines of the top widget changes)
- Added Mineshaft Exit waypoint when you enter a Mineshaft
- Added Frozen Corpse waypoint when you click on a corpse (this is intended for sharing the location with the gui manager)
- Added Fossil Excavator solver

### 0.15.6
- Changes to moveable gui elements that allow them to now align to the center or right of the screen
- Added an option to keep gui elements within a 16:9 landscape aspect ratio (good for ultrawide monitors)
- Added a warning and annouce to party for glacite mineshaft spawns
- Added an option to party transfer to anyone who says the glacite mineshaft message

### 0.15.5
- Changes and fixes to commission waypoints
    - Fixed some incorrect coordinates
    - Found more areas for each gemstone type
    - Added waypoints for normal Dwarven Mines commissions
    - Fixed issue with commission in fourth slot not being detected
    - When there are multiple commission locations, the closest will be labeled and deemed important

### 0.15.4
- Added a waypoint manager menu in the inventory
    - This menu lets you show / hide detected waypoints, add, remove, clear all and share waypoints
- Added commission waypoints
    - Currently only showing gemstone locations in the Glacial Tunnels
- Added waypoint for campfire when you are cold

### 0.15.3
- Reworked the sensitivity features to work on pitch as well
- Replaced the compass with a target visualizer, align your crosshair with the red target

### 0.15.2
- Plot map garden shortcuts now scales with the map size
- Replaced the text prompt "Click a plot to teleport!" with the garden shortcuts
- Added a pixel gap between buttons on the garden map and item list menus
- Removed "Pest Plot Teleport" feature as it seems pointless with the plot minimap teleport shortcuts

### 0.15.1
- Fixed a bug with keeping worldString within 300 meters of the camera not working correctly
- Added shortcuts for "WARP", "SET", and "DESK" under garden plot minimap
- Added another digit to the angles shown in the Target Yaw Compass GUI to be consicentent with the info on the garden plot minimap
- Added setting to change the GUI scale of the offscreen waypoint arrow and label

### 0.15.0
- Huge rendering overall
    - Fixed several bugs where OpenGL matrixes where not being pushed and popped properly on the stack
    - Fixed several bugs where line width was not properly being applied or reset
- Rework of rendering text in the world
    - Made a function that allows for rendering any 2D Renderer element in 3D, and used this for text
    - Text now better handles multiple lines and will remain in the same vertail position relative to eachother even when viewed from extreme angles
- Added arrows and trace lines that can point towards offscreen waypoints
    - Arrows can also show the label of the waypoint
    - Can be toggled on for "All" waypoints or "Important Only" waypoints (both the arrow and the labels for arrows)
    - Arrows without a label will be rendered at half the size
- Added a cooldown for updating pest information from scoreboard when a pest was recently killed
- Added "Plot Info World Holograms" that shows minimap info, like pest count and spray timer, as text above each plot
- Added "Lower Sensitivity Near Target Yaw" and "Target Yaw Compass GUI" features
    - Lowers your sensitivity as you get close to a target yaw, useful when trying to get the perfect angle for farming
    - Compass GUI helps you visualize how close you are to your target angle
    - Target Angle can be set with `/farmingtoolyaw <angle>`
- Added load message that indicates that the user can run `/timyaddons` to open the settings
- Added `/timyaddons help` sub command to list all available commands

### 0.14.8
- Fixed detecting infected plots with recent changes to the pest widget
- Reworked gui menu code
    - Menus can now have rows with evenly spaced elements
    - Text can now be centered or left aligned within its given space
    - Checkboxes now have a consistent draw line width
    - Checkboxes now render a check and are fully opaque
- The item list gui can now show multiple lists, and lists can be dismissed using the X button
- The item list gui now renders when in the edit sign gui, allowing you to see the amount needed
- Item list for garden visitors will be dismissed when the offer is accepted
- Fixed a bug with Enchanted Cocoa Beans not working in item lists
- If you are in a plot with pests, the pest count will now be updated with from sidebar information
- Fixed an issue where recently globally applied widgets will ignore changes if the widget from other islands have not been loaded in memory yet
- Fixed an issue where init_scale will not take globally applied scale
- Reworked editing of multiple GUI elements to allow editing of custom widgets (like garden minimap and broodmother timer) at the same time as the Tab Widgets
    - This has some limitations, like toggling on and off can only be done through the normal settings
    - Added a "Edit Non-Tab Widgets" option to the Gui Tab Widget menu
- Clicking on the garden minimap now only works in the inventory, and not other GUI menus
    - This is mainly to stop you from clicking on it if you are editing it in the Tab Widget Settings

### 0.14.7
- Reworked the small menu code to allow for more flexibility in the future
- Reworked the tooltip to have clickable options for reset, toggle visibility, and apply globally as an alternative to keyboard shortcuts
- Added a "Tab Preview" option when editing tab widgets
- Added "Item List In Menu", allowing you to access item shortcuts from a menu
- Changed the craft shortcut so that it opens the in game recipe menu so that you can easily use the supercraft feature
- Fixed a bug with tab widgets not loading correctly when switching from an older version
- Fixed a bug where different gui scales will not have the small menu in the correct position
- Fixed a bug where widgets will always load with the globally applied location even if changed after the fact
    - Resetting a gui will now reset to the global position
- Fixed a bug related to moving other gui elements that do not have snap to align

### 0.14.6
- Added a small menu to quickly toggle on and off different GUI Tab Widgets as well as change some settings
    - By default hidden widgets are not shown when editing
    - Added a "Show Hidden" option that will show all widgets, hidden widgets will appear with a red selection border
    - Added "Snap to Align" that will help align gui elements
- Added a shortcut to apply widget settings globally, good for ensuring a specific widget is in the same location regardless of what island you are on

### 0.14.5
- Now considers pest information from the pest tab widget to display icons on the Garden Minimap
    - The widget only provides info on what plots are infected, not how many pests are on each one, so a ? amount is used when the amount is unknown
- Fixed and error where Tab Widget headers where incorrectly being indentified in cases where widget context was bolded, for example, ashfang bestiary
- Fix for detecting broodmother's status with hypixel's new tab widget system
- Changed the way widgets are internally named and stored, this may reset some configurations
- Moved tab widget settings to a "Tab" subcategory, this will reset these settings back to default
- Added appereance options for widgets, allowing you to add a colored background
    - This setting also applies to other gui elements in the addon (like slayer tracker and broodmother timer)

### 0.14.4
- Fixed not being able to find correct area when using the "Third Column" in Tab Widget settings
    - This fixes the garden minimap not showing up as the Third Column setting was default for the garden
- The Tab list Gui Elements can now be edited when in the Hypixel Menu for editing your Tab Widget Settings
    - Recommend using the hypixel command `/tablist`

### 0.14.3
- Fix for detecting visitors with hypixel's new tab widget system
- Improved Moveable Gui's
    - Added a transparent black box behind elements position, size, and other info for better readability
- Added Gui Elements for tab widgets.
    - Tab widgets are automatically detected and added to the edit menu.
    - Individual widgets can been shown and hidden using the H key while editing the Gui's location.

### 0.14.2
- Fixed a bug with setting the waypoint to your position when you warp.
- Added checks to ignore particles that cause the trajectory of the spade to deviate extremely. This improves the behavior when the particles from the spade go through the crop generators near the barn, it may still affect the accuracy of the guess but it will no longer cause the guess to spaz out.
- Spade pitch distance now adjusts for the difference between the particle location and the sound location, this helps for longer paths where the sound is no longer considered but the particles are still going. 
- Improved dug burrow detection by having the last grass block that was clicked stored in memory as a fallback for when you are no longer looking at a grass block during the burrow dug message.
- Changed "Announce Minos Inquisitors" from a switch to a selector, with the options "Off", "All Chat", "Party Chat", and "Co-op Chat".
- Announce Minos Inquisitor will now use the coordinates of the burrow that was dug.

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