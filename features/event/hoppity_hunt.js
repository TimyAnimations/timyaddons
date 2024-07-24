import Settings from "../../utils/settings/main";

import { addWaypoint, getWaypointData, getWaypointIdAt, removeWaypoint } from "../waypoints";
import { SkyblockTime, getArea, registerArea } from "../../utils/skyblock";
import { repeatSound } from "../../utils/sound";
import { MoveableDisplay } from "../../utils/moveable_display";
import { timeElapseStringShort } from "../../utils/format";

var found_eggs = {
    "Breakfast Egg": "NO_ID",
    "Lunch Egg": "NO_ID",
    "Dinner Egg": "NO_ID",
};

var found_eggs_time = {
    "Breakfast Egg": 0,
    "Lunch Egg": 0,
    "Dinner Egg": 0,
}

const EGG_SPAWN_HOUR = {
    "Breakfast Egg": 7,
    "Lunch Egg": 14,
    "Dinner Egg": 21,
}
const EGG_COLOR = {
    "Breakfast Egg": "&6",
    "Lunch Egg": "&9",
    "Dinner Egg": "&a",
}

var hunt_display = new MoveableDisplay("chocolate_facotry_hunt_timer");
export function getChocolateFactoryHuntDisplay() {
    return hunt_display;
}

register("tick", () => {
    const lines = ["&c&lHoppity's Hunt:"];
    const now = SkyblockTime.now();
    // lines.push(` ${now}`);

    ["Breakfast Egg", "Lunch Egg", "Dinner Egg"].forEach((egg) => {
        const next = SkyblockTime.nextTime(EGG_SPAWN_HOUR[egg]);
        if (next.month > 2) {
            next.year++;
            next.month = 0;
            next.day = 1;
            next.recalculateTime();
        }
        const last = SkyblockTime.lastTime(EGG_SPAWN_HOUR[egg]);
        if (last.month > 2) {
            last.month = 2;
            last.day = 31;
            last.recalculateTime();
        }
        const got_egg = found_eggs_time[egg] > last.realTime();
        lines.push(` ${EGG_COLOR[egg]}${egg}: &b${timeElapseStringShort(next.realTime() - Date.now())} ${got_egg ? "&a&l✓" : "&c&l✗"}`);
    });
    hunt_display.clearLines();
    hunt_display.addLine(...lines);
});

Settings.addAction("Hoppity's Hunt Timer GUI", (value) => {
    if (value)
        hunt_display.show();
    else
        hunt_display.hide();
})
if (Settings.event_chocolate_egg_hunt_gui)
    hunt_display.show();
else
    hunt_display.hide();

Settings.event_chocolate_egg_hunt_open_gui = () => {
    hunt_display.edit();
};

function findEgg(x = Player.getX(), y = Player.getY(), z = Player.getZ(), looted = true) {
    if (!Settings.event_chocolate_egg_waypoints)
        return;
    area = getArea();
    if (area === undefined || area === "Private Island" || area === "Garden") return; 
    if (!(area in egg_data)) {
        egg_data[area] = [];
        FileLib.write(IMPORT_NAME, EGG_DATA_FILE_NAME, JSON.stringify(egg_data));
    }
    if (!(area in local_egg_data)) {
        local_egg_data[area] = [];
        FileLib.write(LOCAL_IMPORT_NAME, LOCAL_EGG_DATA_FILE_NAME, JSON.stringify(local_egg_data));
    }

    const armor_stands = World.getAllEntitiesOfType(Java.type("net.minecraft.entity.item.EntityArmorStand"));

    armor_stands.forEach((armor_stand) => {
        const distance_sq = (x - armor_stand.getX())**2 + (y - armor_stand.getY())**2 + (z - armor_stand.getZ())**2;
        if (distance_sq > 25) return;

        const helmet = armor_stand.entity?.func_71124_b(4);
        if (!helmet) {
            return;
        }
        const helmet_item = new Item(helmet);
        const helmet_data = helmet_item.getNBT()?.toObject();
        const helmet_id = helmet_data?.tag?.SkullOwner?.Id;

        const [egg_x, egg_y, egg_z] = [Math.floor(armor_stand.getX()), Math.floor(armor_stand.getY()) + 2, Math.floor(armor_stand.getZ())];
        switch (helmet_id) {
            case "015adc61-0aba-3d4d-b3d1-ca47a68a154b": // breakfast
                addEggWaypoint("Breakfast Egg", egg_x, egg_y, egg_z, "GOLD", looted);
                break;
            case "55ae5624-c86b-359f-be54-e0ec7c175403": // lunch
                addEggWaypoint("Lunch Egg", egg_x, egg_y, egg_z, "BLUE", looted);
                break;
            case "e67f7c89-3a19-3f30-ada2-43a3856e5028": // dinner
                addEggWaypoint("Dinner Egg", egg_x, egg_y, egg_z, "GREEN", looted);
                break;
        }
    })
}

function addEggWaypoint(message, x, y, z, type = "AQUA", looted = false) {
    let seen = false;
    if (area !== "" && area in egg_data) {
        let previous = egg_data[area].find((waypoint) => waypoint.x === x && waypoint.y === y && waypoint.z === z);
        if (!previous) {
            egg_data[area].push({x: x, y: y, z: z});
            ChatLib.chat(`&6[TimyAddons]&r &aEgg location now saved for &7"${area}"`);
            FileLib.write(IMPORT_NAME, EGG_DATA_FILE_NAME, JSON.stringify(egg_data));
        }
    }
    if (area !== "" && area in local_egg_data) {
        let previous = local_egg_data[area].find((waypoint) => waypoint.x === x && waypoint.y === y && waypoint.z === z);
        if (previous)
            seen = true;
        if (!previous && looted) {
            local_egg_data[area].push({x: x, y: y, z: z});
            seen = true;
            ChatLib.chat(`&6[TimyAddons]&r &aEgg location marked as seen`);
            FileLib.write(LOCAL_IMPORT_NAME, LOCAL_EGG_DATA_FILE_NAME, JSON.stringify(local_egg_data));
        }
    }

    if (looted)
        found_eggs_time[message] = Date.now();

    const waypoint_data = getWaypointData(getWaypointIdAt(x, y, z));
    if (waypoint_data && waypoint_data.info !== "&7Possible Egg" && waypoint_data.player !== "&6&lNEW") {
        return;
    }
    
    found_eggs[message] = addWaypoint(seen ? "" : "&6&lNEW", x, y, z, type, message, true, true, 0);
    

    if (found_eggs["Breakfast Egg"] && found_eggs["Lunch Egg"] && found_eggs["Dinner Egg"]) {
        possible_eggs.forEach((egg_id) => {
            removeWaypoint(egg_id);
        });
    }
}

register("chat", () => {
    found_eggs_time["Breakfast Egg"] = Date.now();
    found_eggs_time["Lunch Egg"] = Date.now();
    found_eggs_time["Dinner Egg"] = Date.now();
}).setCriteria("&r&cThere are no hidden Chocolate Rabbit Eggs nearby! Try again later!&r");

var area = "";

const IMPORT_NAME = "TimyAddons/constant"
const EGG_DATA_FILE_NAME = "egg_data.json"
var egg_data_file = FileLib.exists(IMPORT_NAME, EGG_DATA_FILE_NAME) 
                            ? FileLib.read(IMPORT_NAME, EGG_DATA_FILE_NAME)
                            : undefined;
var egg_data = {};
if (egg_data_file)
    egg_data = JSON.parse(egg_data_file);

const LOCAL_IMPORT_NAME = "TimyAddons/data"
const LOCAL_EGG_DATA_FILE_NAME = "egg_data.json"
var local_egg_data_file = FileLib.exists(LOCAL_IMPORT_NAME, LOCAL_EGG_DATA_FILE_NAME) 
                            ? FileLib.read(LOCAL_IMPORT_NAME, LOCAL_EGG_DATA_FILE_NAME)
                            : undefined;
var local_egg_data = {};
if (local_egg_data_file)
    local_egg_data = JSON.parse(local_egg_data_file);

var possible_eggs = [];
function loadPossibleLocations() {
    area = getArea();
    if (area === undefined || area === "Private Island" || area === "Garden") return; 

    if (area in egg_data) {
        possible_eggs = egg_data[area].map((waypoint) => {
            const waypoint_data = getWaypointData(getWaypointIdAt(waypoint.x, waypoint.y, waypoint.z));
            if (waypoint_data && waypoint_data.info !== "&7Possible Egg") {
                return "NO_ID";
            }
            let seen = false;
            if (area in local_egg_data) {
                let previous = local_egg_data[area].find((local_waypoint) => local_waypoint.x === waypoint.x && local_waypoint.y === waypoint.y && local_waypoint.z === waypoint.z);
                if (previous)
                    seen = true;
            }
            return addWaypoint(seen ? "" : "&6&lNEW", waypoint.x, waypoint.y, waypoint.z, "DARK_AQUA", "&7Possible Egg", false, true, 10, 0, (x, y, z) => { findEgg(x, y, z, false); });
        });
    }
    else {
        egg_data[area] = [];
        FileLib.write(IMPORT_NAME, EGG_DATA_FILE_NAME, JSON.stringify(egg_data));
    }
}

Settings.registerSetting("Possible Chocolate Egg Waypoints", "chat", (egg) => {
    loadPossibleLocations();
    if (Settings.event_chocolate_egg_warning) {
        repeatSound("random.successful_hit", 1, 1, 15, 100);
    }
    switch (egg) {
        case "&6Chocolate Breakfast Egg ":
            removeWaypoint(found_eggs["Breakfast Egg"]);
            found_eggs["Breakfast Egg"] = undefined;
            break;
        case "&9Chocolate Lunch Egg ":
            removeWaypoint(found_eggs["Lunch Egg"]);
            found_eggs["Lunch Egg"] = undefined;
            break;
        case "&aChocolate Dinner Egg ":
            removeWaypoint(found_eggs["Dinner Egg"]);
            found_eggs["Dinner Egg"] = undefined;
            break;
        default:
    }
}).setCriteria("&r&d&lHOPPITY'S HUNT &r&dA &r${egg}&r&dhas appeared!&r");

register("command", () => {
    loadPossibleLocations();
}).setName("possibleeggs");
// registerArea("_", () => {
//     if (!Settings.event_chocolate_egg_waypoints)
//         return;
//     loadPossibleLocations();
// });

Settings.registerSetting("Possible Chocolate Egg Waypoints", "chat", () => {
    findEgg(Player.getX(), Player.getY(), Player.getZ(), false);
}).setCriteria("&r&cYou have already collected this ${*}&r&c! Try again when it respawns!&r")
Settings.registerSetting("Possible Chocolate Egg Waypoints", "chat", () => {
    findEgg();
}).setCriteria("&r&d&lHOPPITY'S HUNT &r&dYou found a &r&${*}Chocolate ${*} Egg ").setStart();

// {
//     id: "minecraft:skull",
//     Count: 1b,
//     tag: {
//         SkullOwner: {
//             Id: "794465b5-3bd2-38fc-b02f-0b51d782e201",
//             Properties: {
//                 textures: [{
//                     Value: "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvZDE3YmRjYzljYWQ1YjJhYzJkYjQwYzU3NjEzNDljMzNlNDBhYjEwOGRkYThjZmE3ODhlOGNmZWExMTNkNGE3YyJ9fX0="
//                 }]
//             }
//         },
//         display: {
//             Lore: ["§7You caught a stray §6§lGolden Rabbit§7!", "", "§7You gained §6+14,639,600 Chocolate§7!"],
//             Name: "§6§lGolden Rabbit §d§lCAUGHT!"
//         }
//     },
//     Damage: 3s
// }