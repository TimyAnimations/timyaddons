import Settings from "../../utils/settings/main";
import { queueCommand } from "../../utils/command_queue";
import { repeatSound } from "../../utils/sound";

import { Waypoint } from "../../utils/waypoint";
import { playerWithoutRank } from "../../utils/format";

Settings.registerSetting("Glacite Mineshaft Warning", "chat", () => {
    Client.showTitle("&b&lGlacite Mineshaft!", "", 0, 50, 10);
    repeatSound("random.successful_hit", 1, 1, 5, 100);
    if (Settings.mining_announce_glacite_mineshaft)
        queueCommand("pc WOW! You found a Glacite Mineshaft portal!");
}).setCriteria("&r&5&lWOW! &r&aYou found a &r&bGlacite Mineshaft &r&aportal!&r");

Settings.registerSetting("Transfer party to Glacite Mineshaft finder", "chat", (player) => {
    queueCommand(`party transfer ${playerWithoutRank(player)}`);
}).setCriteria("&r&9Party &8> ${player}&f: &rWOW! You found a Glacite Mineshaft portal!").setStart();

const base_camp_waypoint = new Waypoint("Campfire", -7, 122, 227, 1.0, 0.5, 0, false, false, true, true, true);

Settings.registerSetting("Dwarven Base Campfire Waypoint", "step", () => {

    if (!Scoreboard) return;
    let lines = Scoreboard.getLines();
    if (!lines) return;

    let i = 0;
    for (; i < lines.length && !lines[i]?.getName().startsWith("Cold: "); i++);
    if (i === lines.length) {
        base_camp_waypoint.hide();
        return;
    }

    base_camp_waypoint.show();

}).requireArea("Dwarven Mines")
  .setFps(1);

Settings.addAction("Dwarven Base Campfire Waypoint", () => {base_camp_waypoint.hide();});

register("worldUnload", () => {
    base_camp_waypoint.hide();
});