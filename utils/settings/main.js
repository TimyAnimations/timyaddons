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
            "General", "Crimson Isles", "Crystal Hollows", 
            "Garden", "Slayer", "Dungeons", "Kuudra", 
            "Bestiary", "Combat", "Fishing", "Mythological", 
            "Waypoint", "Widgets", "Items"
        ];

        return categories.indexOf(a.name) - categories.indexOf(b.name);
    }
})
class Settings {
    constructor() {
        this.initialize(this);
        
        this.addDependency("Plot Minimap Teleport Shortcut", "Plot Minimap");
        this.addDependency("Plot Minimap Extra Info", "Plot Minimap");
        this.addDependency("Plot Minimap Tile Size", "Plot Minimap");
        this.addDependency("Plot Minimap GUI Location", "Plot Minimap");
        
        this.addDependency("Keep Previous Tracked Line", "Trace Pest Tracker Line");
        
        this.addDependency("Master Volume While Fishing", "Mute Sounds While Fishing");
        
        this.addDependency("Autorequeue Instance Time", "Autorequeue Instance &8- &7&o/downtime, /dt&r");
        this.addDependency("Autorequeue Instance Party Chat Announcement", "Autorequeue Instance &8- &7&o/downtime, /dt&r");
        this.addDependency("Instantly Autorequeue On Fail", "Autorequeue Instance &8- &7&o/downtime, /dt&r");
        
        this.addDependency("Next Burrow Guess Smoothness", "Next Burrow Guesser");
        this.addDependency("Warp Hub", "Nearest Warp Keybind");
        this.addDependency("Warp Castle", "Nearest Warp Keybind");
        this.addDependency("Warp Dark Auction", "Nearest Warp Keybind");
        this.addDependency("Warp Museum", "Nearest Warp Keybind");
        this.addDependency("Warp Crypt", "Nearest Warp Keybind");
        this.addDependency("Warp Wizard", "Nearest Warp Keybind");
        
        this.addDependency("Broodmother Respawn Timer GUI", "Broodmother Respawn Warning");
        this.addDependency("Broodmother Respawn Timer GUI Location", "Broodmother Respawn Warning");
    }

    // General
    @SwitchProperty({
        name: "Time Since Last In Lobby",
        description: "When entering a lobby, show the time since you where last in that lobby",
        category: "General"
    })
    general_time_since_lobby = false;
    
    @SwitchProperty({
        name: "Announce Failed Warps to Party",
        description: "Let's your party know when you fail to be warped in",
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
        description: "Draws a minimap showing the plots as well as pest and sprayonator information\n&cOpen the \"Configure Plots\" option at the desk to update plot names",
        category: "Garden",
        subcategory: "Minimap"
    })
    garden_plot_minimap = false;
    
    @SwitchProperty({
        name: "Plot Minimap Teleport Shortcut",
        description: "Show the map while in an inventory menu, when clicked it will teleport you to that plot",
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
        name: "Pest Plot Teleport",
        description: "Adds a quick teleport to the plot the last pest spawned on\n&e/pestwarp",
        category: "Garden",
        subcategory: "Pests",
    })
    garden_pest_plot_teleport = false;

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

    // Slayer
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
        description: "Automatically requeue for a new instance after a set amount of time\n&e/downtime&r to toggle, &e/downtime <seconds>&r to enable with a set time",
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
        description: "Announce the time before requeuing to the party if it is more than 5 seconds",
        category: "Dungeons",
        subcategory: "Downtime",
    })
    dungeon_downtime_party_announcement = false;
    @SwitchProperty({
        name: "Instantly Autorequeue On Fail",
        description: "If the dungeon was a fail, don't wait to requeue",
        category: "Dungeons",
        subcategory: "Downtime",
    })
    dungeon_downtime_fail_instant_requeue = false;

    // Dungeons
    @SwitchProperty({
        name: "Autoshow Extra Stats",
        description: "Automatically shows the Extra Stats at the end of the dungeon",
        category: "Dungeons",
    })
    dungeon_auto_extra_stats = false;
    // Kuudra
    @SwitchProperty({
        name: "Highlight Safe Spots",
        description: "Highlight blocks considered safe in the Kuudra fight. Blue highlights are only conditionally safe, while Green is typically always safe",
        category: "Kuudra",
    })
    kuudra_safe_spots = false;
    @SwitchProperty({
        name: "Announce When Ready to Party",
        description: "After opening a chest, automatically announce to the party that you are ready",
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
        description: "Send current coordinates to the chat when a Minos Inquisitor is dug up",
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
        name: "Show distance from waypoint",
        description: "Displays your distance to the waypoint in meters",
        category: "Waypoint",
        subcategory: "Visuals"
    })
    waypoint_show_distance = false;
    @SwitchProperty({
        name: "Show box behind text",
        description: "Render the transparent black box behind the waypoint's text",
        category: "Waypoint",
        subcategory: "Visuals"
    })
    waypoint_show_box = false;
    @SwitchProperty({
        name: "Show beacon beam",
        description: "Render a vanilla beacon beam at the waypoint",
        category: "Waypoint",
        subcategory: "Visuals"
    })
    waypoint_show_beacon = true;
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

    @SwitchProperty({
        name: "Enable Gui Tab Widgets",
        description: "Show a moveable gui for any tab widgets found in the current area",
        category: "Widgets",
    })
    widgets_enabled = false;
    @SwitchProperty({
        name: "Enable New Widgets By Default",
        description: "Turn on new widgets by default",
        category: "Widgets",
    })
    widgets_enable_default = false;
    @ButtonProperty({
        name: "Edit Current Widgets",
        description: "Edit the widgets in the current area",
        category: "Widgets",
        placeholder: "Edit"
    })
    widgets_open_gui = () => {};
}

export default new Settings();