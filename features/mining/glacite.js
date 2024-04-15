import Settings from "../../utils/settings/main";
import { queueCommand } from "../../utils/command_queue";
import { repeatSound } from "../../utils/sound";

import { Waypoint } from "../../utils/waypoint";
import { playerWithoutRank } from "../../utils/format";
import { addWaypoint } from "../waypoints";
import { getSkyblockItemID, registerArea } from "../../utils/skyblock";
import { getNearEntitiesOfType } from "../../utils/entities";

Settings.registerSetting("Glacite Mineshaft Warning", "chat", () => {
    Client.showTitle("&b&lGlacite Mineshaft!", "", 0, 50, 10);
    repeatSound("random.successful_hit", 1, 1, 5, 100);
    if (Settings.mining_announce_glacite_mineshaft)
        queueCommand("pc WOW! You found a Glacite Mineshaft portal!");
}).setCriteria("&r&5&lWOW! &r&aYou found a &r&bGlacite Mineshaft &r&aportal!&r");

Settings.registerSetting("Transfer party to Glacite Mineshaft finder", "chat", (player) => {
    queueCommand(`party transfer ${playerWithoutRank(player)}`);
}).setCriteria("&r&9Party &8> ${player}&f: &rWOW! You found a Glacite Mineshaft portal!").setStart();

const base_camp_waypoint = new Waypoint("Campfire", -7, 122, 227, 1.0, 0.5, 0.0, false, false, true, true, true);

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

registerArea("Mineshaft", () => {
    if (!Settings.mining_waypoints_glacite_mineshaft) return;
    const armor_stands = World.getAllEntitiesOfType(Java.type("net.minecraft.entity.item.EntityArmorStand"));
    let [x, y, z] = [Player.getX(), Player.getY(), Player.getZ()];
    armor_stands.forEach((armor_stand) => {
        // ChatLib.chat(armor_stand.getName());
        if (armor_stand.getName() === "§e§lClick to exit!") {
            [x, y, z] = [armor_stand.getX(), armor_stand.getY(), armor_stand.getZ()];
        }
    })
    addWaypoint("", x, y, z, "CAMPFIRE", "Mineshaft Exit", true, true, 0);
});

function addFrozenCorpseWaypoint() {
    const armor_stands = World.getAllEntitiesOfType(Java.type("net.minecraft.entity.item.EntityArmorStand"));
    let [x, y, z] = [Player.getX(), Player.getY(), Player.getZ()];
    let message = "Frozen Corpse";
    armor_stands.forEach((armor_stand) => {
        const distance_sq = (Player.getX() - armor_stand.getX())**2 + (Player.getY() - armor_stand.getY())**2 + (Player.getZ() - armor_stand.getZ())**2;
        if (distance_sq > 25) return;

        const chestplate = armor_stand.entity?.func_71124_b(3);
        if (!chestplate) return;
        const chestplate_item = new Item(chestplate);
        const chestplate_id = getSkyblockItemID(chestplate_item);

        switch (chestplate_id) {
            case "LAPIS_ARMOR_CHESTPLATE":
                message = "Lapis Frozen Corpse";
                [x, y, z] = [armor_stand.getX(), armor_stand.getY() + 1, armor_stand.getZ()];
                break;
            case "ARMOR_OF_YOG_CHESTPLATE":
                message = "Umber Frozen Corpse";
                [x, y, z] = [armor_stand.getX(), armor_stand.getY() + 1, armor_stand.getZ()];
                break;
            case "MINERAL_CHESTPLATE":
                message = "Tungsten Frozen Corpse";
                [x, y, z] = [armor_stand.getX(), armor_stand.getY() + 1, armor_stand.getZ()];
                break;
            case "VANGUARD_CHESTPLATE":
                message = "Vanguard Frozen Corpse";
                [x, y, z] = [armor_stand.getX(), armor_stand.getY() + 1, armor_stand.getZ()];
                break;
        }
    })
    if (message !== "Frozen Corpse" && mineshaft_variant !== "" && mineshaft_variant in mineshaft_data) {
        let previous = mineshaft_data[mineshaft_variant].find((waypoint) => waypoint.x === x && waypoint.y === y && waypoint.z === z);
        if (!previous) {
            mineshaft_data[mineshaft_variant].push({x: x, y: y, z: z});
            ChatLib.chat(`&aCorpse location now saved for &7"${mineshaft_variant}"`);
            FileLib.write(IMPORT_NAME, MINESHAFT_DATA_FILE_NAME, JSON.stringify(mineshaft_data));
        }
    }
    addWaypoint("", x, y, z, "AQUA", message, false, true, 0);
}
Settings.registerSetting("Glacite Mineshaft shareable waypoints", "chat", addFrozenCorpseWaypoint).setCriteria("&r  &r&b&lFROZEN CORPSE LOOT! &r");
Settings.registerSetting("Glacite Mineshaft shareable waypoints", "chat", addFrozenCorpseWaypoint).setCriteria("&r&cYou need to be holding a Tungsten Key &r&cto unlock this corpse!&r");
Settings.registerSetting("Glacite Mineshaft shareable waypoints", "chat", addFrozenCorpseWaypoint).setCriteria("&r&cYou need to be holding an Umber Key &r&cto unlock this corpse!&r");
Settings.registerSetting("Glacite Mineshaft shareable waypoints", "chat", addFrozenCorpseWaypoint).setCriteria("&r&cYou need to be holding a Skeleton Key &r&cto unlock this corpse!&r");

const IMPORT_NAME = "TimyAddons/constant"
const MINESHAFT_DATA_FILE_NAME = "mineshaft_data.json"

var mineshaft_variant = "";
var mineshaft_data_file = FileLib.exists(IMPORT_NAME, MINESHAFT_DATA_FILE_NAME) 
                            ? FileLib.read(IMPORT_NAME, MINESHAFT_DATA_FILE_NAME)
                            : undefined;
var mineshaft_data = {};
if (mineshaft_data_file)
    mineshaft_data = JSON.parse(mineshaft_data_file);
var attempts = 0;
const MAX_ATTEMPTS = 5;

function findMineshaftVariant() {
    mineshaft_variant = "";
    if (!Scoreboard) return;
    let lines = Scoreboard.getLines();
    if (!lines) return;

    let i = 0;
    for (; i < lines.length && !/§7\d\d\/\d\d\/\d\d §8\S* \S*$/.test(lines[i]?.getName()); i++);
    if (i === lines.length) {
        if (attempts < MAX_ATTEMPTS) {
            attempts++;
            setTimeout(() => {findMineshaftVariant()}, 1_000);
        }
        return;
    }

    const splits = lines[i]?.getName().split(" ");
    mineshaft_variant = splits[splits.length - 1].trim();

    if (mineshaft_variant in mineshaft_data) {
        mineshaft_data[mineshaft_variant].forEach((waypoint) => {
            addWaypoint("", waypoint.x, waypoint.y, waypoint.z, "DARK_AQUA", "Possible Corpse", false, true, 5);
        });
    }
    else {
        mineshaft_data[mineshaft_variant] = [];
    }
}
registerArea("Mineshaft", () => {
    if (!Settings.mining_waypoints_glacite_mineshaft)
        return;
    attempts = 0;
    findMineshaftVariant();
});