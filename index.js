import Settings from "./utils/settings/main";
import MythologicalWaypointColorsSettings from "./utils/settings/mythological_waypoint_colors";
import DeveloperSettings from "./utils/settings/developer";
import "./features/waypoints";

import "./features/bestiary/broodmother";
import "./features/slayer/rates";
import "./features/garden/controls";
import "./features/garden/borders";
import "./features/garden/minimap";
import "./features/garden/pest";
import "./features/instance/kuudra";
import "./features/instance/dungeon";
import "./features/instance/downtime";
import "./features/event/mythological";
import "./features/combat";
import "./features/mining/commissions";
import "./features/mining/glacite";
import "./features/mining/fossil";
import "./features/fishing";
import "./features/lobby";
import "./features/sacks";
import "./features/widgets";

// import "./developer";

import { version } from "./constant/version";
register("command", (arg1) => {
    switch ( arg1?.toLowerCase() ) {
        case "dev": case "developer":
            DeveloperSettings.openGUI(); break;
        case "help":
            ChatLib.chat(
                `&6Timy Addons &e(${version}) &6commands:\n` +
                " &e/timyaddons &7 - &rOpens main settings for Timy Addons\n" +
                "  &7- aliases: &o/timy\n" +
                " &e/timyaddons developer&7 - &rOpens developer settings for Timy Addons\n" +
                "  &7- aliases: &o/timyaddons dev, /timy dev, /timy developer\n" +
                " &e/timyaddons help&7 - &rLists of all commands\n" +
                "  &7- aliases: &o/timy help\n" +
                " &e/pt <username>&7 - &rRuns /party transfer <username>\n" +
                " &e/downtime&7 - &rToggles autorequeue instance\n" +
                "  &7- aliases: &o/dt\n" +
                " &e/downtime <seconds>&7 - &rEnables autorequeue instance with a set time\n" +
                "  &7- aliases: &o/dt <seconds>\n" +
                " &e/farmingtool&7 - &rGet the current target yaw and pitch of the held tool\n" +
                "  &7- aliases: &o/ft\n" +
                " &e/farmingtool reset [yaw|pitch]&7 - &rRemove the current target yaw and/or pitch from the held tool\n" +
                "  &7- aliases: &o/ft reset [yaw|pitch]\n" +
                " &e/farmingtool [yaw|pitch] <angle>&7 - &rSet the target yaw or pitch of the held tool\n" +
                "  &7- aliases: &o/ft [yaw|pitch] <angle>\n" +
                " &e/slayerratereset&7 - &rReset the current slayer rates tracker\n" +
                " &e/dungeonsack&7 - &rBrings up the Dungeon Sack Item List\n" +
                "  &7- aliases: &o/ds\n" +
                " &e/partysendcoords <?info>&7 - &rSends your current coordinates into party chat\n" +
                "  &7- aliases: &o/psc <?info>\n" +
                " &e/coopsendcoords <?info>&7 - &rSends your current coordinates into coop chat\n" +
                "  &7- aliases: &o/csc <?info>\n" +
                " &e/allsendcoords <?info>&7 - &rSends your current coordinates into all chat\n" +
                "  &7- aliases: &o/asc <?info>\n" +
                " &e/addwaypoint <?info>&7 - &rAdds a temporary waypoint at your current position"
            );
            break;
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

let opening_message_trigger = register("worldLoad", () => {
    ChatLib.chat(`&6&lTimy Addons &e(${version})\n&7 run &e/timyaddons&7 to open the settings\n&7 run &e/timyaddons help&7 to view all commands`);
    opening_message_trigger.unregister();
});
