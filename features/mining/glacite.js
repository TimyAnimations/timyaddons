import Settings from "../../utils/settings/main";
import { queueCommand } from "../../utils/command_queue";
import { repeatSound } from "../../utils/sound";

import { Waypoint } from "../../utils/waypoint";
import { playerWithoutRank } from "../../utils/format";
import { addWaypoint, getWaypointData, getWaypointIdAt, removeWaypoint, updateWaypointManagerMenu } from "../waypoints";
import { getLobbyPlayerCount, getScoreboardLinesSafe, getSkyblockItemID, getTabListNamesSafe, registerArea } from "../../utils/skyblock";
import { showTitle } from "../../utils/render";

Settings.registerSetting("Glacite Mineshaft Warning", "chat", () => {
    showTitle("&b&lGlacite Mineshaft!", "", 0, 50, 10);
    repeatSound("random.successful_hit", 1, 1, 5, 100);
    if (Settings.mining_announce_glacite_mineshaft) {
        queueCommand(`pc WOW! You found a Glacite Mineshaft portal!`);
        queueCommand(`pc .transfer`);
    }
    if (Settings.mining_announce_glacite_mineshaft_corpse) {
        announced_corpses = false;
    }
}).setCriteria("&r&5&lWOW! &r&aYou found a &r&bGlacite Mineshaft &r&aportal!&r");

[
    "WOW! You found a Glacite Mineshaft portal!",
    ".pt", ".transfer", ".ptme", "!pt", "!transfer", "!ptme"
].forEach((transfer_command) => {
    Settings.registerSetting("Transfer party to Glacite Mineshaft finder", "chat", (player) => {
        player = playerWithoutRank(player);
        if (player === Player.getName()) return;
        queueCommand(`party transfer ${player}`);
    }).setCriteria("&r&9Party &8> ${player}&f: &r" + transfer_command).setStart();
 });

const base_camp_waypoint = new Waypoint("Campfire", -7, 122, 227, 1.0, 0.5, 0.0, false, false, true, true, true);

Settings.registerSetting("Dwarven Base Campfire Waypoint", "step", () => {
    let lines = getScoreboardLinesSafe();
    if (!lines || lines.length === 0) return;

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

function findExit() {
    const armor_stands = World.getAllEntitiesOfType(Java.type("net.minecraft.entity.item.EntityArmorStand"));
    let ret = undefined;
    armor_stands.forEach((armor_stand) => {
        if (armor_stand.getName() === "§e§lClick to exit!") {
            ret = {x: Math.floor(armor_stand.getX()), y: Math.floor(armor_stand.getY()), z: Math.floor(armor_stand.getZ())};
        }
    })
    return ret;
}

var found_corpse = new Set();
function findFrozenCorpse(x = Player.getX(), y = Player.getY(), z = Player.getZ(), looted = false) {
    const armor_stands = World.getAllEntitiesOfType(Java.type("net.minecraft.entity.item.EntityArmorStand"));

    armor_stands.forEach((armor_stand) => {
        const distance_sq = (x - armor_stand.getX())**2 + (y - armor_stand.getY())**2 + (z - armor_stand.getZ())**2;
        if (distance_sq > 25) return;

        const chestplate = armor_stand.entity?.func_71124_b(3);
        if (!chestplate) return;
        const chestplate_item = new Item(chestplate);
        const chestplate_id = getSkyblockItemID(chestplate_item);

        const [corpse_x, corpse_y, corpse_z] = [Math.floor(armor_stand.getX()), Math.floor(armor_stand.getY()) + 1, Math.floor(armor_stand.getZ())];
        switch (chestplate_id) {
            case "LAPIS_ARMOR_CHESTPLATE":
                addFrozenCorpseWaypoint("Lapis Corpse", corpse_x, corpse_y, corpse_z, "BLUE", looted);
                found_corpse.add(`${corpse_x.toFixed()}_${corpse_y.toFixed()}_${corpse_z.toFixed()}`);
                break;
            case "ARMOR_OF_YOG_CHESTPLATE":
                addFrozenCorpseWaypoint("Umber Corpse", corpse_x, corpse_y, corpse_z, "GOLD", looted);
                found_corpse.add(`${corpse_x.toFixed()}_${corpse_y.toFixed()}_${corpse_z.toFixed()}`);
                break;
            case "MINERAL_CHESTPLATE":
                addFrozenCorpseWaypoint("Tungsten Corpse", corpse_x, corpse_y, corpse_z, "GRAY", looted);
                found_corpse.add(`${corpse_x.toFixed()}_${corpse_y.toFixed()}_${corpse_z.toFixed()}`);
                break;
            case "VANGUARD_CHESTPLATE":
                addFrozenCorpseWaypoint("Vanguard Corpse", corpse_x, corpse_y, corpse_z, "AQUA", looted);
                found_corpse.add(`${corpse_x.toFixed()}_${corpse_y.toFixed()}_${corpse_z.toFixed()}`);
                break;
        }
    })
}

function addFrozenCorpseWaypoint(message, x, y, z, type = "AQUA", looted = false) {
    if (message !== "Frozen Corpse" && mineshaft_variant !== "" && mineshaft_variant in mineshaft_data["CORPSE"]) {
        let previous = mineshaft_data["CORPSE"][mineshaft_variant].find((waypoint) => waypoint.x === x && waypoint.y === y && waypoint.z === z);
        if (!previous) {
            mineshaft_data["CORPSE"][mineshaft_variant].push({x: x, y: y, z: z});
            ChatLib.chat(`&6[TimyAddons]&r &aCorpse location now saved for &7"${mineshaft_variant}"`);
            FileLib.write(IMPORT_NAME, MINESHAFT_DATA_FILE_NAME, JSON.stringify(mineshaft_data));
        }
    }
    const neighbor = findNeighborCorpseWaypoint(mineshaft_variant, x, y, z);
    if (neighbor) {
        x = neighbor.x;
        y = neighbor.y;
        z = neighbor.z;
    }
    const waypoint_data = getWaypointData(getWaypointIdAt(x, y, z));
    if (!looted && waypoint_data && waypoint_data.player === "&a&lLOOTED")
        return;
    addWaypoint(looted ? "&a&lLOOTED" : "&c&lNOT LOOTED", x, y, z, type, message, false, true, 0);
}
Settings.registerSetting("Glacite Mineshaft shareable waypoints", "chat", () => {
    findFrozenCorpse(Player.getX(), Player.getY(), Player.getZ(), true);
}).setCriteria("&r  &r&b&l&r${*} &r&b&lCORPSE LOOT! &r");
// &r  &r&b&l&r&6&lUMBER &r&b&lCORPSE LOOT! &r
Settings.registerSetting("Glacite Mineshaft shareable waypoints", "chat", () => {
    findFrozenCorpse(Player.getX(), Player.getY(), Player.getZ(), true);
}).setCriteria("&r&cYou've already looted this corpse!&r");
Settings.registerSetting("Glacite Mineshaft shareable waypoints", "chat", () => { findFrozenCorpse(); } ).setCriteria("&r&cYou need to be holding a Tungsten Key &r&cto unlock this corpse!&r");
Settings.registerSetting("Glacite Mineshaft shareable waypoints", "chat", () => { findFrozenCorpse(); } ).setCriteria("&r&cYou need to be holding an Umber Key &r&cto unlock this corpse!&r");
Settings.registerSetting("Glacite Mineshaft shareable waypoints", "chat", () => { findFrozenCorpse(); } ).setCriteria("&r&cYou need to be holding a Skeleton Key &r&cto unlock this corpse!&r");

// &r &r&6Umber&r&f: &r&c&lNOT LOOTED&r
var announced_corpses = true;
Settings.registerSetting("Glacite Mineshaft shareable waypoints", "step", () => {
    let corpse_count = 0;
    let corpse_list = {};
    let names = getTabListNamesSafe();
    names.forEach((name) => {
        if (/§r §r(§6Umber|§9Lapis|§7Tungsten|§bVanguard)§r§f: §r.*§r/.test(name)) {
            corpse_count++;
            const clean_name = name.replace(/(§r §r|§r§f: §r.*§r|§[697b])/g, "");
            if (clean_name in corpse_list) {
                corpse_list[clean_name]++;
            }
            else {
                corpse_list[clean_name] = 1;
            }
        }
    });

    if (!announced_corpses && Object.entries(corpse_list).length > 0) {
        let string = "";
        Object.entries(corpse_list).forEach(([corpse_name, count]) => {
            if (string !== "") string += ", "; 
            string += `${corpse_name} x${count}`;
        });
        queueCommand(`pc ${string}`);
        announced_corpses = true;
    }
    if (corpse_count === 0) return;
    if (found_corpse.size < corpse_count) return;

    possible_corpse.forEach((corpse_id) => {
        removeWaypoint(corpse_id);
    });
    possible_corpse = [];
    updateWaypointManagerMenu();
}).requireArea("Mineshaft").setFps(1);

const IMPORT_NAME = "TimyAddons/constant"
const MINESHAFT_DATA_FILE_NAME = "mineshaft_data.json"

var mineshaft_variant = "";
var mineshaft_data_file = FileLib.exists(IMPORT_NAME, MINESHAFT_DATA_FILE_NAME) 
                            ? FileLib.read(IMPORT_NAME, MINESHAFT_DATA_FILE_NAME)
                            : undefined;
var mineshaft_data = {
    "EXIT": {},
    "CORPSE": {}
};
if (mineshaft_data_file)
    mineshaft_data = JSON.parse(mineshaft_data_file);
var attempts = 0;
const MAX_ATTEMPTS = 5;

var possible_corpse = [];
function findMineshaftVariant() {
    mineshaft_variant = "";
    let lines = getScoreboardLinesSafe();
    if (!lines || lines.length === 0) return;

    let i = 0;
    for (; i < lines.length && !/§7\d\d\/\d\d\/\d\d §8\S* \S*$/.test(lines[i]?.getName()); i++);
    if (i === lines.length) {
        if (attempts < MAX_ATTEMPTS) {
            attempts++;
            setTimeout(() => { findMineshaftVariant() }, 1_000);
        }
        return;
    }

    const splits = lines[i]?.getName().split(" ");
    mineshaft_variant = splits[splits.length - 1].trim();

    if (!Settings.mining_waypoints_glacite_mineshaft)
        return;

    found_corpse.clear();

    if (mineshaft_variant in mineshaft_data["CORPSE"]) {
        possible_corpse = mineshaft_data["CORPSE"][mineshaft_variant].map((waypoint) => {
            return addWaypoint("", waypoint.x, waypoint.y, waypoint.z, "DARK_AQUA", "&7Possible Corpse", false, true, 10, 0, (x, y, z) => { findFrozenCorpse(x, y, z); });
        });
        
    }
    else {
        mineshaft_data["CORPSE"][mineshaft_variant] = [];
    }
    if (mineshaft_variant in mineshaft_data["EXIT"]) {
        const exit_waypoint = mineshaft_data["EXIT"][mineshaft_variant] 
                              ?? (findExit() ?? {x: Math.floor(Player.getX()), y: Math.floor(Player.getY()), z: Math.floor(Player.getZ())});
        addWaypoint("", exit_waypoint.x, exit_waypoint.y, exit_waypoint.z, "CAMPFIRE", "Mineshaft Exit", true, true, 0);
    }
    else {
        const found_exit_waypoint = findExit();
        if (found_exit_waypoint) {
            mineshaft_data["EXIT"][mineshaft_variant] = found_exit_waypoint;
            FileLib.write(IMPORT_NAME, MINESHAFT_DATA_FILE_NAME, JSON.stringify(mineshaft_data));
        }
        const exit_waypoint = mineshaft_data["EXIT"][mineshaft_variant] 
                              ?? (found_exit_waypoint ?? {x: Math.floor(Player.getX()), y: Math.floor(Player.getY()), z: Math.floor(Player.getZ())});

        addWaypoint("", exit_waypoint.x, exit_waypoint.y, exit_waypoint.z, "CAMPFIRE", "Mineshaft Exit", true, true, 0);
    }
}
registerArea("Mineshaft", () => {
    attempts = 0;
    findMineshaftVariant();
});
register("worldUnload", () => { mineshaft_variant = ""; });

function findNeighborCorpseWaypoint(key, x, y, z) {
    let neighbor = undefined;
    mineshaft_data["CORPSE"][key].forEach((waypoint) => {
        if ( (waypoint.x === x + 1 && waypoint.y === y && waypoint.z === z)
          || (waypoint.x === x - 1 && waypoint.y === y && waypoint.z === z)
          || (waypoint.x === x && waypoint.y === y && waypoint.z === z + 1)
          || (waypoint.x === x && waypoint.y === y && waypoint.z === z - 1) 
        ) {
            neighbor = waypoint;
        }
    });
    return neighbor;
}

