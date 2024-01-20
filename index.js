import Settings from "./utils/settings/main";
import MythologicalWaypointColorsSettings from "./utils/settings/mythological_waypoint_colors";
import DeveloperSettings from "./utils/settings/developer";
import "./features/waypoints";

import "./features/bestiary/broodmother";
import "./features/slayer/rates";
import "./features/garden/borders";
import "./features/garden/minimap";
import "./features/garden/pest";
import "./features/instance/kuudra";
import "./features/instance/dungeon";
import "./features/instance/downtime";
import "./features/event/mythological";
import "./features/combat";
import "./features/fishing";
import "./features/lobby";
import "./features/sacks";
// import "./features/items";

// import "./developer";

register("command", (arg1) => {
    switch ( arg1?.toLowerCase() ) {
        case "dev": case "developer": case "debug":
            DeveloperSettings.openGUI(); break;
        default: Settings.openGUI();
    }
}).setName("timyaddons").setAliases("timy");

import { queueCommand } from "./utils/command_queue";
register("command", (arg1) => {
    if (!arg1) 
        queueCommand("playtime");
    else
        queueCommand(`party transfer ${arg1}`);
}).setName("pt");