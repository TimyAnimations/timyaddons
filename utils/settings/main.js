import { 
    @Vigilant, 
    @ButtonProperty 
    @SwitchProperty, 
    @SelectorProperty, 
    @SliderProperty, 
    @TextProperty, 
    @CheckboxProperty, 
    @ColorProperty, 
    @PercentSliderProperty,
    Color 
} from "Vigilance";
import { version } from "../../constant/version";
import { @Triggable } from "./triggerable_settings";
import MythologicalWaypointColorsSettings from "./mythological_waypoint_colors";
import DungeonItemSettings from "./dungeon_item";

@Triggable()
@Vigilant("TimyAddons/data/main", `Timy Addons (${version})`, {
    getCategoryComparator: () => (a, b) => {
        const categories = [
            "Welcome",
            "General", "Crimson Isles", "Crystal Hollows", 
            "Garden", "Slayer", "Dungeons", "Kuudra", 
            "Bestiary", "Combat", "Mining", "Fishing", "Mythological", 
            "Events", "Waypoint", "Widgets", "Items"
        ];

        return categories.indexOf(a.name) - categories.indexOf(b.name);
    }
})
class Settings {
    constructor() {
        this.initialize(this);

        this.setCategoryDescription(
            "Welcome", `&6Timy Addons &e(${version})\n`+
            "&r&oAll features are disabled by default!\n"+
            "&r&oSelect a preset below or go through the categories on the left.\n\n"+
            "This mod is developed with consideration of the Hypixel Allowed Modifications\nThat being said, this mod is &cuse at your own risk!&r\n"+
            "&cWARNING: Some features use chat macros and may fall in a gray area with the rules\n\n"+
            "Get pre-release updates at &9https://github.com/TimyAnimations/timyaddons&r\n"+
            "Support development at &9https://ko-fi.com/timys&r"
        );
        
        this.addDependency("Plot Minimap Teleport Shortcut", "Plot Minimap");
        this.addDependency("Plot Minimap Extra Info", "Plot Minimap");
        this.addDependency("Plot Minimap Tile Size", "Plot Minimap");
        this.addDependency("Plot Minimap GUI Location", "Plot Minimap");
        this.addDependency("Plot Info World Holograms", "Plot Minimap");

        this.addDependency("Target Angle Visualizer GUI", "Lower Sensitivity Near Target Angle");
        
        this.addDependency("Keep Previous Tracked Line", "Trace Pest Tracker Line");

        this.addDependency("Announce Found Glacite Mineshaft", "Glacite Mineshaft Warning");
        this.addDependency("Announce Frozen Corpses to Party", "Glacite Mineshaft Warning");
        
        this.addDependency("Master Volume While Fishing", "Mute Sounds While Fishing");

        this.addDependency("Chocolate Factory Upgrade Optimizer GUI", "Chocolate Factory Upgrade Optimizer");
        this.addDependency("Chocolate Factory Upgrade Optimizer GUI Compact", "Chocolate Factory Upgrade Optimizer");
        this.addDependency("Chocolate Factory Upgrade Optimizer GUI Location", "Chocolate Factory Upgrade Optimizer");
        this.addDependency("Hoppity's Collection Tracker GUI", "Hoppity's Collection Tracker");
        this.addDependency("Hoppity's Collection Tracker GUI Location", "Hoppity's Collection Tracker");
        
        this.addDependency("Autorequeue Instance Time", "Autorequeue Instance &8- &7&o/downtime, /dt&r");
        this.addDependency("Autorequeue Instance Party Chat Announcement", "Autorequeue Instance &8- &7&o/downtime, /dt&r");
        
        this.addDependency("Next Burrow Guess Smoothness", "Next Burrow Guesser");
        this.addDependency("Warp Hub", "Nearest Warp Keybind");
        this.addDependency("Warp Castle", "Nearest Warp Keybind");
        this.addDependency("Warp Dark Auction", "Nearest Warp Keybind");
        this.addDependency("Warp Museum", "Nearest Warp Keybind");
        this.addDependency("Warp Crypt", "Nearest Warp Keybind");
        this.addDependency("Warp Wizard", "Nearest Warp Keybind");
        
        this.addDependency("Broodmother Respawn Timer GUI", "Broodmother Respawn Warning");
        this.addDependency("Broodmother Respawn Timer GUI Location", "Broodmother Respawn Warning");

        this.addDependency("Widget background color", "Show background behind widget");
    }

    @ButtonProperty({
        name: "Disable All Settings Preset",
        description: "Click to disable all features",
        category: "Welcome",
        placeholder: "Apply"
    })
    apply_disable_all_preset = () => {
        this.applyPreset(PRESET.disabled);
    };
    @ButtonProperty({
        name: "Recommended Settings Preset",
        description: "Click to enable all recommended features",
        category: "Welcome",
        placeholder: "Apply"
    })
    apply_recommended_preset = () => {
        this.applyPreset(PRESET.recommended);
    };

    // General
    @SwitchProperty({
        name: "Time Since Last In Lobby",
        description: "When rentering a lobby, indicate in chat how long it has been since you've been in that lobby.",
        category: "General"
    })
    general_time_since_lobby = false;
    
    @SwitchProperty({
        name: "Announce Failed Warps to Party",
        description: "Let's your party know when you fail to be warped in\n&cWhen enabled, it will run \"/pc\" as a response to a message in chat",
        category: "General"
    })
    general_announce_failed_warps = false;
    
    // Garden
    @SwitchProperty({
        name: "Show Plot Borders",
        description: "Renders an outline around the current garden plot's borders",
        category: "Garden"
    })
    garden_plot_borders = false;
    
    @SwitchProperty({
        name: "Plot Minimap",
        description: "Draws a minimap showing the plots as well as pest and sprayonator information\n&eOpen the \"Configure Plots\" option at the desk to update plot names",
        category: "Garden",
        subcategory: "Minimap"
    })
    garden_plot_minimap = false;
    
    @SwitchProperty({
        name: "Plot Minimap Teleport Shortcut",
        description: "Shows the map while in your inventory, clicking on a plot will teleport you there",
        category: "Garden",
        subcategory: "Minimap"
    })
    garden_plot_minimap_teleport_shortcut = true;

    @SwitchProperty({
        name: "Plot Minimap Extra Info",
        description: "Show extra infromation like Yaw and Pitch under the minimap",
        category: "Garden",
        subcategory: "Minimap"
    })
    garden_plot_minimap_extra_info = false;
    
    @SwitchProperty({
        name: "Plot Info World Holograms",
        description: "Shows information like pest count, visitor count, and sprayanator timer above each plot",
        category: "Garden",
        subcategory: "Minimap"
    })
    garden_plot_hologram_info = false;

    @SliderProperty({
        name: "Plot Minimap Tile Size",
        description: "The size of individual plots",
        category: "Garden",
        subcategory: "Minimap",
        min: 30,
        max: 90
    })
    garden_plot_minimap_tile_size = 30;

    @ButtonProperty({
        name: "Plot Minimap GUI Location",
        description: "Edit the location of the GUI",
        category: "Garden",
        subcategory: "Minimap",
        placeholder: "Edit"
    })
    garden_plot_minimap_open_gui = () => {};

    @SwitchProperty({
        name: "Pest Hitbox",
        description: "Draws a box around the pest, making it easier to see",
        category: "Garden",
        subcategory: "Pests",
    })
    garden_pest_hitbox = false;

    @SwitchProperty({
        name: "Trace Pest Tracker Line",
        description: "Draws a path from the tracker's particles, making it more clear where it's pointing",
        category: "Garden",
        subcategory: "Pests",
    })
    garden_pest_tracker_line = false;
    
    @SwitchProperty({
        name: "Keep Previous Tracked Line",
        description: "Keep the previous line rendered, useful when trying to triangulate the pest's location",
        category: "Garden",
        subcategory: "Pests",
    })
    garden_pest_keep_previous_line = false;
    
    @SwitchProperty({
        name: "Lower Sensitivity Near Target Angle",
        description: "Lowers your mouse sensitivity as your angle gets close to a set value while holding an assigned tool.\nUse &e/farmingtool [yaw|pitch] <angle>&r to assign an angle value to the tool you are holding",
        category: "Garden",
        subcategory: "Controls",
    })
    garden_controls_target_angle_sensitivity = false;
    @SwitchProperty({
        name: "Target Angle Visualizer GUI",
        description: "Show a red target that helps you visualize how close you are to the set target angle.\nIt will only shows when your angle is off and the tool is being held.\nThe arrow indicates what direction to move your mouse.",
        category: "Garden",
        subcategory: "Controls",
    })
    garden_controls_target_angle_gui = false;

    // Slayer
    @SwitchProperty({
        name: "Boss Hitbox",
        description: "Show a red hitbox on your slayer boss, and green hitbox on other player's slayer boss",
        category: "Slayer"
    })
    slayer_boss_hitbox = false;
    @SwitchProperty({
        name: "Track Slayer Rates",
        description: "Show and keep track of the time it takes to for you to spawn and kill a slayer boss. Use &e/slayerratereset&r to reset the session.",
        category: "Slayer"
    })
    slayer_track_rates = false;

    @ButtonProperty({
        name: "Slayer Rates GUI Location",
        description: "Edit the location of the GUI",
        category: "Slayer",
        placeholder: "Edit"
    })
    slayer_rates_open_gui = () => {};

    // Combat
    @SwitchProperty({
        name: "Full Dominus Stack Warning",
        description: "Warn when the Dominus stacks are no longer full",
        category: "Combat"
    })
    combat_dominus_warning = false;

    // Mining
    @SwitchProperty({
        name: "Commission Waypoints",
        description: "Show a waypoint to area's where you can complete your current commissions\n&7&orequires commission tab widget to be enabled",
        category: "Mining"
    })
    mining_commission_waypoints = false;
    
    @SwitchProperty({
        name: "Dwarven Base Campfire Waypoint",
        description: "Show a waypoint back to the Dwarven Base Camp when you are cold",
        category: "Mining",
        subcategory: "Glacite Tunnels"
    })
    mining_dwarven_base_camp_waypoint = false;
    @SwitchProperty({
        name: "Fossil Excavator Solver",
        description: "Show possible solutions to uncovering hidden fossils while in the Fossil Excavator",
        category: "Mining",
        subcategory: "Glacite Tunnels"
    })
    mining_fossil_excavator_solver = false;
    @SwitchProperty({
        name: "Glacite Mineshaft Warning",
        description: "Warn when a Glacite Mineshaft spawns",
        category: "Mining",
        subcategory: "Glacite Tunnels"
    })
    mining_warn_glacite_mineshaft = false;
    @SwitchProperty({
        name: "Announce Found Glacite Mineshaft",
        description: "Send this message to your party when you find a Glacite Mineshaft and say the party command \".transfer\"\n&cWhen enabled, it will run \"/pc\" as a response to a message in chat",
        category: "Mining",
        subcategory: "Glacite Tunnels"
    })
    mining_announce_glacite_mineshaft = false;
    @SwitchProperty({
        name: "Transfer party to Glacite Mineshaft finder",
        description: "Transfer the party to whoever found the mineshaft\nAlso enabled transfer for command . and ! party commands\n&cWhen enabled, it will run \"/party transfer\" as a response to a message in chat",
        category: "Mining",
        subcategory: "Glacite Tunnels"
    })
    mining_transfer_glacite_mineshaft = false;
    @SwitchProperty({
        name: "Announce Frozen Corpses to Party",
        description: "When you enter a mineshaft, announce to the party which frozen corpses are in the mineshaft\n&cWhen enabled, it will run \"/pc\" as a response to new information in the tab list",
        category: "Mining",
        subcategory: "Glacite Tunnels"
    })
    mining_announce_glacite_mineshaft_corpse = false;
    @SwitchProperty({
        name: "Glacite Mineshaft shareable waypoints",
        description: "Add waypoints for the Mineshaft exit and found frozen corpse that can be shared with the waypoint manager",
        category: "Mining",
        subcategory: "Glacite Tunnels"
    })
    mining_waypoints_glacite_mineshaft = false;


    // Fishing
    @SwitchProperty({
        name: "Mute Sounds While Fishing",
        description: "Mutes all sounds except for the \"note pling\" sound for 30 seconds after casting a rod\n&8&oAutomatically disabled in Kuudra",
        category: "Fishing",
        subcategory: "Sounds"
    })
    fishing_mute_sounds = false;
    
    @PercentSliderProperty({
        name: "Master Volume While Fishing",
        description: "Changes the Master Volume to this for 30 seconds after casting a rod, the original volume will be restored\n&cWhen set to 0, the volume will not be changed at all",
        category: "Fishing",
        subcategory: "Sounds",
    })
    fishing_master_volume = 0;

    @SwitchProperty({
        name: "Blazing Aura AFK Warning",
        description: "When wearing &5Blaze Armor&r or &6Frozen Blaze Armor&r, warn when the Blazing Aura ability deactivates due to lack of movement",
        category: "Fishing"
    })
    fishing_blazing_aura_warning = false;
    
    // Bestiary
    @SwitchProperty({
        name: "Broodmother Respawn Warning",
        description: "Keeps track of when the broodmother will respawn",
        category: "Bestiary",
        subcategory: "Spider's Den"
    })
    bestiary_broodmother_warning = false;
    @SwitchProperty({
        name: "Broodmother Respawn Timer GUI",
        description: "Shows a timer on the screen for when the Broodmother should respawn",
        category: "Bestiary",
        subcategory: "Spider's Den"
    })
    bestiary_broodmother_timer = false;
    @ButtonProperty({
        name: "Broodmother Respawn Timer GUI Location",
        description: "Edit the location of the GUI",
        category: "Bestiary",
        subcategory: "Spider's Den",
        placeholder: "Edit"
    })
    bestiary_broodmother_open_gui = () => {};


    // Dungeons Downtime
    @SwitchProperty({
        name: "Autorequeue Instance &8- &7&o/downtime, /dt&r",
        description: "Automatically requeue for a new instance after a set amount of time\n&e/downtime&r to toggle, &e/downtime <seconds>&r to enable with a set time\n&cWhen enabled, it will run \"/instancerequeue\" as a response to a message in chat",
        category: "Dungeons",
        subcategory: "Downtime",
    })
    dungeon_downtime_enabled = false;
    @SliderProperty({
        name: "Autorequeue Instance Time",
        description: "The time in seconds before the instance will automatically requeue, 0 will instantly requeue",
        category: "Dungeons",
        subcategory: "Downtime",
        min: 0,
        max: 90
    })
    dungeon_downtime_seconds = 10;
    @SwitchProperty({
        name: "Autorequeue Instance Party Chat Announcement",
        description: "Announce the time before requeuing to the party if it is more than 5 seconds\n&cWhen enabled, it will run \"/pc\" as a response to a message in chat",
        category: "Dungeons",
        subcategory: "Downtime",
    })
    dungeon_downtime_party_announcement = false;

    // Dungeons
    @SwitchProperty({
        name: "Autoshow Extra Stats",
        description: "Automatically shows the Extra Stats at the end of the dungeon\n&cWhen enabled, it will run \"/showextrastats\" as a response to a message in chat",
        category: "Dungeons",
    })
    dungeon_auto_extra_stats = false;
    @SelectorProperty({
        name: "Tank Low Health Warning",
        description: "Shows a warning when the Tank in your party is low and makes a noise when they are critically low",
        category: "Dungeons",
        options: ["Off", "Wish Available", "Always"]
    })
    dungeon_warn_tank_low_health = 0;

    // Kuudra
    @SwitchProperty({
        name: "Highlight Safe Spots",
        description: "Highlight blocks considered safe in the Kuudra fight. Blue highlights are only conditionally safe, while Green is typically always safe",
        category: "Kuudra",
    })
    kuudra_safe_spots = false;
    @SwitchProperty({
        name: "Announce When Ready to Party",
        description: "After opening a chest, automatically announce to the party that you are ready\n&cWhen enabled, it will run \"/pc\" as a response to clicking an item in a gui",
        category: "Kuudra",
    })
    kuudra_auto_say_ready = false;

    // Mythological
    @SwitchProperty({
        name: "Next Burrow Guesser",
        description: "Uses the dug burrow arrow, and Ancestral Spade to guess the next position",
        category: "Mythological",
    })
    mythological_next_burrow_guess = false;
    @PercentSliderProperty({
        name: "Next Burrow Guess Smoothness",
        description: "How smooth the burrow guess waypoint will move, this helps you follow the changing guess with your eyes",
        category: "Mythological",
    })
    mythological_next_burrow_guess_smoothness = 0.5;
    @SwitchProperty({
        name: "Nearest Warp Keybind",
        description: "Press a key to use the warp closest to the predicted next burrow location. The key can be assigned in the Minecraft settings.",
        category: "Mythological",
        subcategory: "Warp"
    })
    mythological_warp = false;
    @SwitchProperty({
        name: "Found Burrow Waypoints",
        description: "Show a waypoint at seen burrows and indicate the type",
        category: "Mythological",
    })
    mythological_burrow_waypoints = false;
    @SelectorProperty({
        name: "Announce Minos Inquisitor",
        description: "Send current coordinates to the chat when a Minos Inquisitor is dug up\n&cWhen enabled, it will run a command as a response to a message in chat",
        category: "Mythological",
        options: ["Off", "All Chat", "Party Chat", "Co-op Chat"]
    })
    mythological_announce_minos_inquisitor = 0;

    @CheckboxProperty({
        name: "Warp Hub",
        description: "",
        category: "Mythological",
        subcategory: "Warp"
    })
    mythological_warp_hub = true;
    @CheckboxProperty({
        name: "Warp Castle",
        description: "",
        category: "Mythological",
        subcategory: "Warp"
    })
    mythological_warp_castle = true;
    @CheckboxProperty({
        name: "Warp Dark Auction",
        description: "",
        category: "Mythological",
        subcategory: "Warp"
    })
    mythological_warp_da = true;
    @CheckboxProperty({
        name: "Warp Museum",
        description: "",
        category: "Mythological",
        subcategory: "Warp"
    })
    mythological_warp_museum = true;
    @CheckboxProperty({
        name: "Warp Crypt",
        description: "",
        category: "Mythological",
        subcategory: "Warp"
    })
    mythological_warp_crypt = false;
    @CheckboxProperty({
        name: "Warp Wizard",
        description: "",
        category: "Mythological",
        subcategory: "Warp"
    })
    mythological_warp_wizard = true;

    @ButtonProperty({
        name: "Waypoint Colors",
        description: "Edit the colors of the different waypoint types",
        category: "Mythological",
        placeholder: "Edit"
    })
    mythological_color_edit = () => { MythologicalWaypointColorsSettings.openGUI(); };

    // Chocolate Factory
    @SwitchProperty({
        name: "Possible Chocolate Egg Waypoints",
        description: "Show waypoints for possible egg locations whenever a new one spawns",
        category: "Events",
        subcategory: "Hoppity's Hunt"
    })
    event_chocolate_egg_waypoints = false;
    @SwitchProperty({
        name: "Egg Spawns Warning Sound",
        description: "Warns for when an egg spawns",
        category: "Events",
        subcategory: "Hoppity's Hunt"
    })
    event_chocolate_egg_warning = false;
    @SwitchProperty({
        name: "Hoppity's Collection Tracker",
        description: "Track and show information about your rabbit collection, including each rarity and how many dupes you've gotten",
        category: "Events",
        subcategory: "Hoppity's Hunt"
    })
    event_chocolate_egg_collection = false;
    @SwitchProperty({
        name: "Hoppity's Collection Tracker GUI",
        description: "Show the Hoppity's collection information as a GUI element",
        category: "Events",
        subcategory: "Hoppity's Hunt"
    })
    event_chocolate_egg_collection_gui = false;
    @ButtonProperty({
        name: "Hoppity's Collection Tracker GUI Location",
        description: "Edit the location of the GUI",
        category: "Events",
        subcategory: "Hoppity's Hunt",
        placeholder: "Edit"
    })
    event_chocolate_egg_collection_open_gui = () => {};
    @SwitchProperty({
        name: "Chocolate Factory Hide Tooltip",
        description: "Hides the tooltip on the item you click to make cookies, making it easier to see spawned rabbits",
        category: "Events",
        subcategory: "Chocolate Factory"
    })
    event_chocolate_hide_tooltip = false;
    @SwitchProperty({
        name: "Chocolate Factory Rabbit Warning",
        description: "Spams a noise when a rabbit spawns",
        category: "Events",
        subcategory: "Chocolate Factory"
    })
    event_chocolate_rabbit_warning = false;
    @SwitchProperty({
        name: "Chocolate Factory Mute Eat Sound",
        description: "Mutes the eating sound when clicking on the chocolate",
        category: "Events",
        subcategory: "Chocolate Factory"
    })
    event_chocolate_mute_eat = false;
    @SwitchProperty({
        name: "Chocolate Factory Upgrade Optimizer",
        description: "Shows current info, the most optimal upgrade to pick, highlights available upgrades to purchase, and gives estimates times before you can purchase upgrades.",
        category: "Events",
        subcategory: "Chocolate Factory"
    })
    event_chocolate_timer = false;
    @SwitchProperty({
        name: "Chocolate Factory Upgrade Optimizer GUI",
        description: "Shows the upgrade optimizer information as a GUI element",
        category: "Events",
        subcategory: "Chocolate Factory"
    })
    event_chocolate_timer_gui = false;
    @SwitchProperty({
        name: "Chocolate Factory Upgrade Optimizer GUI Compact",
        description: "Compacts the information on the gui",
        category: "Events",
        subcategory: "Chocolate Factory"
    })
    event_chocolate_timer_gui_compact = false;
    @ButtonProperty({
        name: "Chocolate Factory Upgrade Optimizer GUI Location",
        description: "Edit the location of the GUI",
        category: "Events",
        subcategory: "Chocolate Factory",
        placeholder: "Edit"
    })
    event_chocolate_open_gui = () => {};

    // Waypoint
    @SliderProperty({
        name: "Waypoint shown time",
        description: "The time in seconds a waypoint will be shown, set to 0 for persistant waypoints, waypoints get reset on world changes",
        category: "Waypoint",
        min: 0,
        max: 120
    })
    waypoint_cooldown_seconds = 60;
    @SwitchProperty({
        name: "Waypoint manager menu",
        description: "Show a waypoint manager menu in the inventory, toggle visibility of recent waypoints, right click waypoint for more options",
        category: "Waypoint"
    })
    waypoint_manager_menu = false;

    
    @SelectorProperty({
        name: "Show offscreen waypoints",
        description: "Displays a line or arrow pointing in the direction of a waypoint that is off the screen",
        category: "Waypoint",
        subcategory: "Offscreen",
        options: ["Off", "Important Only", "All"]
    })
    waypoint_show_arrow = 2;
    @SelectorProperty({
        name: "Show label for offscreen waypoints",
        description: "Displays the waypoint's text even when it's offscreen",
        category: "Waypoint",
        subcategory: "Offscreen",
        options: ["Off", "Important Only", "All"]
    })
    waypoint_show_arrow_label = 1;
    @SelectorProperty({
        name: "Offscreen waypoints style",
        description: "The visual style and method to showing the offscreen waypoint\n"
                    +"Trace Line draws a line from your crosshair to the waypoints and is visual even when on screen\n"
                    +"Arrow draws an arrow around your screen pointing in the direction of the offscreen waypoint",
        category: "Waypoint",
        subcategory: "Offscreen",
        options: ["Only Label", "Trace Line", "Arrow", "Arrow and Trace Line"]
    })
    waypoint_arrow_style = 2;
    @SliderProperty({
        name: "Offscreen waypoints GUI scale",
        description: "Scale of the Label and Arrow from the offscreen waypoints\n&cValue of 0 will use your minecraft GUI scale",
        category: "Waypoint",
        subcategory: "Offscreen",
        min: 0,
        max: 5
    })
    waypoint_arrow_gui_scale = 3;

    @SwitchProperty({
        name: "Show distance from waypoint",
        description: "Displays your distance to the waypoint in meters",
        category: "Waypoint",
        subcategory: "Visuals"
    })
    waypoint_show_distance = true;
    @SwitchProperty({
        name: "Show box behind text",
        description: "Render the transparent black box behind the waypoint's text",
        category: "Waypoint",
        subcategory: "Visuals"
    })
    waypoint_show_box = false;
    @SelectorProperty({
        name: "Show beacon beam",
        description: "Render a vanilla beacon beam at the waypoint",
        category: "Waypoint",
        subcategory: "Visuals",
        options: ["Never", "Hide on Mining Islands", "Always"]
    })
    waypoint_show_beacon = 1;
    @SwitchProperty({
        name: "Show infront of world",
        description: "Render the waypoint infront of the world, allowing it to be seen even when obstructed\n&8&othe waypoint's text will always be shown through the world",
        category: "Waypoint",
        subcategory: "Visuals"
    })
    waypoint_infront = true;
    @SwitchProperty({
        name: "Waypoint from coordinates in party chat",
        description: "Put a waypoint at coordinates seen in party chat",
        category: "Waypoint",
        subcategory: "Coordinates"
    })
    waypoint_party_coords = false;
    @SwitchProperty({
        name: "Waypoint from coordinates in co-op chat",
        description: "Put a waypoint at coordinates seen in co-op chat",
        category: "Waypoint",
        subcategory: "Coordinates"
    })
    waypoint_coop_coords = false;
    @SwitchProperty({
        name: "Waypoint from coordinates in all chat",
        description: "Put a waypoint at coordinates seen in all chat",
        category: "Waypoint",
        subcategory: "Coordinates"
    })
    waypoint_all_coords = false;

    // Items
    @SwitchProperty({
        name: "Item List In Menu",
        description: "Show the item list as a GUI, with clickable shortcuts, while in inventory menus",
        category: "Items"
    })
    item_list_show_gui = false;

    @SwitchProperty({
        name: "Sack shortcut",
        description: "Add &b&l[sack]&r message to items in the item list.\nWhen clicked it will run the \"getfromsack\" command.\nThis command will attempt to pull the item from your sack",
        category: "Items"
    })
    item_list_show_sack_shortcut = true;
   
    @SwitchProperty({
        name: "Bazaar shortcut",
        description: "Add &a&l[bazaar]&r message to items in the item list.\nWhen clicked it will run the \"bazaar\" command.\nThis open the bazaar with the search query for the item.",
        category: "Items"
    })
    item_list_show_bazaar_shortcut = true;

    @SwitchProperty({
        name: "Crafting shortcut",
        description: "Add &6&l[craft]&r message to items in the item list.\nWhen clicked it will run the custom \"craftlist\" command.\nThis command shows a new item list of the materials needed to craft the item.",
        category: "Items"
    })
    item_list_show_craft_shortcut = true;

    @SwitchProperty({
        name: "Compact item shortcut labels",
        description: "Some of the items names get long",
        category: "Items"
    })
    item_list_compact_shortcuts = false;

    @SelectorProperty({
        name: "NPC Shops Required Items",
        description: "Show an item list when you attempt to buy something without having the required items.",
        category: "Items",
        subcategory: "NPC",
        options: ["Off", "List Only", "List and Auto Sack"]
    })
    shop_item_message = 0;
    // Garden : Items
    @SelectorProperty({
        name: "Garden Visitor Required Items List",
        description: "Show an item list of the required items from a garden visitor when the npc's menu is opened.",
        category: "Items",
        subcategory: "Garden",
        options: ["Off", "List Only", "List and Auto Sack"]
    })
    garden_visitor_item_message = 0;
    // Crimson Isles : Items
    @SelectorProperty({
        name: "Crimson Isles Required Items List",
        description: "Show an item list of the required items for faction quest.",
        category: "Items",
        subcategory: "Crimson Isles",
        options: ["Off", "List Only", "List and Auto Sack"]
    })
    crimson_isle_item_message = 0;
    // Crystal Hollows : Items
    @SelectorProperty({
        name: "Crystal Hollows Required Items List",
        description: "Show an item list of the required items to get a crystal.",
        category: "Items",
        subcategory: "Crystal Hollows",
        options: ["Off", "List Only", "List and Auto Sack"]
    })
    crystal_hollows_item_message = 0;
    @SelectorProperty({
        name: "Crystal Hollows Preferred Goblin Egg",
        description: "King Yolkar accepts any of the egg variants.",
        category: "Items",
        subcategory: "Crystal Hollows",
        options: ["§9Goblin Egg", "§aGreen Goblin Egg", "§cRed Goblin Egg", "§3Blue Goblin Egg", "§eYellow Goblin Egg"]
    })
    crystal_hollows_prefered_goblin_egg = 0;
    // Dungeons : Items
    @SelectorProperty({
        name: "Dungeon Sack Items List &8- &7&o/dungeonsack, /ds&r",
        description: "Show an item list of common sack items used in dungeons. Change the amount of each item below, set to 0 to disable.",
        category: "Dungeons",
        subcategory: "Item Lists",
        options: ["Off", "List Only", "List and Auto Sack"]
    })
    dungeon_item_message = 0;
    @ButtonProperty({
        name: "Dungeon Sack Item Counts",
        description: "Change the amount of each item, set to 0 to disable.",
        category: "Dungeons",
        subcategory: "Item Lists",
        placeholder: "Edit"
    })
    dungeon_item_edit = () => { DungeonItemSettings.openGUI(); };

    // Widgets
    @SwitchProperty({
        name: "Enable Gui Tab Widgets",
        description: "Show a moveable gui display for any tab widgets found in the current area",
        category: "Widgets",
        subcategory: "Tab"
    })
    widgets_enabled = false;
    @SwitchProperty({
        name: "Enable New Widgets By Default",
        description: "Turn on new widgets by default",
        category: "Widgets",
        subcategory: "Tab"
    })
    widgets_enable_default = false;
    @SwitchProperty({
        name: "Keep widgets in 16:9",
        description: "Keeps the location of widgets within a 16 by 9 aspect ratio, even if you resize the screen",
        category: "Widgets",
        subcategory: "Appearence"
    })
    widget_aspect_ratio = false;
    @SwitchProperty({
        name: "Show background behind widget",
        description: "Enable a box behind moveable gui displays",
        category: "Widgets",
        subcategory: "Appearence"
    })
    widgets_background = true;
    @ColorProperty({
        name: "Widget background color",
        description: "",
        category: "Widgets",
        subcategory: "Appearence"
    })
    widgets_background_color = new Color(0.0, 0.0, 0.0, 0.5);
    @ButtonProperty({
        name: "Edit Current Widgets",
        description: "Edit the widgets in the current area, this can also be done in the hypixel Tab Widget settings",
        category: "Widgets",
        subcategory: "Tab",
        placeholder: "Edit"
    })
    widgets_open_gui = () => {};
}

const PRESET = {
    disabled: {
        "Time Since Last In Lobby": false,
        "Announce Failed Warps to Party": false,
        "Show Plot Borders": false,
        "Plot Minimap": false,
        "Plot Minimap Teleport Shortcut": true,
        "Plot Minimap Extra Info": false,
        "Plot Info World Holograms": false,
        "Pest Hitbox": false,
        "Trace Pest Tracker Line": false,
        "Keep Previous Tracked Line": false,
        "Lower Sensitivity Near Target Angle": false,
        "Target Angle Visualizer GUI": false,
        "Boss Hitbox": false,
        "Track Slayer Rates": false,
        "Full Dominus Stack Warning": false,
        "Commission Waypoints": false,
        "Dwarven Base Campfire Waypoint": false,
        "Glacite Mineshaft Warning": false,
        "Announce Found Glacite Mineshaft": false,
        "Transfer party to Glacite Mineshaft finder": false,
        "Announce Frozen Corpses to Party": false,
        "Glacite Mineshaft shareable waypoints": false,
        "Mute Sounds While Fishing": false,
        "Master Volume While Fishing": 0,
        "Blazing Aura AFK Warning": false,
        "Broodmother Respawn Warning": false,
        "Broodmother Respawn Timer GUI": false,
        "Autorequeue Instance Party Chat Announcement": false,
        "Autoshow Extra Stats": false,
        "Tank Low Health Warning": 0,
        "Highlight Safe Spots": false,
        "Announce When Ready to Party": false,
        "Next Burrow Guesser": false,
        "Nearest Warp Keybind": false,
        "Found Burrow Waypoints": false,
        "Announce Minos Inquisitor": 0,
        "Possible Chocolate Egg Waypoints": false,
        "Egg Spawns Warning Sound": false,
        "Hoppity's Collection Tracker": false,
        "Hoppity's Collection Tracker GUI": false,
        "Chocolate Factory Hide Tooltip": false,
        "Chocolate Factory Rabbit Warning": false,
        "Chocolate Factory Mute Eat Sound": false,
        "Chocolate Factory Upgrade Optimizer": false,
        "Chocolate Factory Upgrade Optimizer GUI": false,
        "Waypoint manager menu": false,
        "Waypoint from coordinates in party chat": false,
        "Waypoint from coordinates in co-op chat": false,
        "Waypoint from coordinates in all chat": false,
        "Item List In Menu": false,
        "NPC Shops Required Items": 0,
        "Crimson Isles Required Items List": 0,
        "Crystal Hollows Required Items List": 0,
        "Dungeon Sack Items List &8- &7&o/dungeonsack, /ds&r": 0,
        "Enable Gui Tab Widgets": false,
        "Enable New Widgets By Default": false,
    },
    recommended: {
        "Time Since Last In Lobby": true,
        "Announce Failed Warps to Party": true,
        // "Show Plot Borders": false,
        "Plot Minimap": true,
        "Plot Minimap Teleport Shortcut": true,
        "Plot Minimap Extra Info": true,
        // "Plot Info World Holograms": false,
        "Pest Hitbox": true,
        "Trace Pest Tracker Line": true,
        // "Keep Previous Tracked Line": false,
        "Lower Sensitivity Near Target Angle": true,
        "Target Angle Visualizer GUI": true,
        "Boss Hitbox": true,
        // "Track Slayer Rates": false,
        "Full Dominus Stack Warning": true,
        "Commission Waypoints": true,
        "Dwarven Base Campfire Waypoint": true,
        "Fossil Excavator Solver": true,
        "Glacite Mineshaft Warning": true,
        "Announce Found Glacite Mineshaft": true,
        "Transfer party to Glacite Mineshaft finder": true,
        "Announce Frozen Corpses to Party": true,
        "Glacite Mineshaft shareable waypoints": true,
        "Mute Sounds While Fishing": true,
        // "Master Volume While Fishing": 0,
        "Blazing Aura AFK Warning": true,
        "Broodmother Respawn Warning": true,
        "Broodmother Respawn Timer GUI": true,
        "Autorequeue Instance Party Chat Announcement": true,
        "Tank Low Health Warning": 1,
        "Highlight Safe Spots": true,
        "Announce When Ready to Party": true,
        "Next Burrow Guesser": true,
        "Nearest Warp Keybind": true,
        "Found Burrow Waypoints": true,
        "Announce Minos Inquisitor": 2,
        "Possible Chocolate Egg Waypoints": true,
        // "Egg Spawns Warning Sound": true,
        "Hoppity's Collection Tracker": true,
        "Hoppity's Collection Tracker GUI": true,
        "Chocolate Factory Hide Tooltip": true,
        "Chocolate Factory Rabbit Warning": true,
        "Chocolate Factory Mute Eat Sound": true,
        "Chocolate Factory Upgrade Optimizer": true,
        "Chocolate Factory Upgrade Optimizer GUI": true,
        "Waypoint manager menu": true,
        "Waypoint from coordinates in party chat": true,
        "Waypoint from coordinates in co-op chat": true,
        "Waypoint from coordinates in all chat": true,
        "Item List In Menu": true,
        "NPC Shops Required Items": 1,
        "Crimson Isles Required Items List": 1,
        "Crystal Hollows Required Items List": 1,
        "Dungeon Sack Items List &8- &7&o/dungeonsack, /ds&r": 1,
        "Enable Gui Tab Widgets": true,
        "Enable New Widgets By Default": false,
    }
}

export default new Settings();