import Settings from "../../utils/settings/main";

import { addWaypoint, getWaypointData, getWaypointIdAt, removeWaypoint } from "../waypoints";
import { getArea } from "../../utils/skyblock";
import { repeatSound } from "../../utils/sound";

var found_eggs = {
    "Breakfast Egg": "NO_ID",
    "Lunch Egg": "NO_ID",
    "Dinner Egg": "NO_ID",
};
function findEgg(x = Player.getX(), y = Player.getY(), z = Player.getZ(), looted = false) {
    area = getArea();
    if (area === undefined || area === "Private Island" || area === "Garden") return; 
    if (!(area in egg_data)) {
        egg_data[area] = [];
        FileLib.write(IMPORT_NAME, EGG_DATA_FILE_NAME, JSON.stringify(egg_data));
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
                addEggWaypoint("Breakfast Egg", egg_x, egg_y, egg_z, "GOLD", true);
                break;
            case "55ae5624-c86b-359f-be54-e0ec7c175403": // lunch
                addEggWaypoint("Lunch Egg", egg_x, egg_y, egg_z, "BLUE", true);
                break;
            case "e67f7c89-3a19-3f30-ada2-43a3856e5028": // dinner
                addEggWaypoint("Dinner Egg", egg_x, egg_y, egg_z, "GREEN", true);
                break;
        }
    })
}

function addEggWaypoint(message, x, y, z, type = "AQUA", looted = false) {
    if (area !== "" && area in egg_data) {
        let previous = egg_data[area].find((waypoint) => waypoint.x === x && waypoint.y === y && waypoint.z === z);
        if (!previous) {
            egg_data[area].push({x: x, y: y, z: z});
            ChatLib.chat(`&6[TimyAddons]&r &aEgg location now saved for &7"${area}"`);
            FileLib.write(IMPORT_NAME, EGG_DATA_FILE_NAME, JSON.stringify(egg_data));
        }
    }

    const waypoint_data = getWaypointData(getWaypointIdAt(x, y, z));
    if (!looted && waypoint_data && waypoint_data.info !== "&7Possible Egg")
        return;
    
    found_eggs[message] = addWaypoint("", x, y, z, type, message, true, true, 0);

    if (found_eggs["Breakfast Egg"] && found_eggs["Lunch Egg"] && found_eggs["Dinner Egg"]) {
        possible_eggs.forEach((egg_id) => {
            removeWaypoint(egg_id);
        });
    }
}

const IMPORT_NAME = "TimyAddons/constant"
const EGG_DATA_FILE_NAME = "egg_data.json"

var area = "";
var egg_data_file = FileLib.exists(IMPORT_NAME, EGG_DATA_FILE_NAME) 
                            ? FileLib.read(IMPORT_NAME, EGG_DATA_FILE_NAME)
                            : undefined;
var egg_data = {};
if (egg_data_file)
    egg_data = JSON.parse(egg_data_file);

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
            return addWaypoint("", waypoint.x, waypoint.y, waypoint.z, "DARK_AQUA", "&7Possible Egg", false, true, 10, 0, (x, y, z) => { findEgg(x, y, z); });
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

Settings.registerSetting("Possible Chocolate Egg Waypoints", "chat", () => {
    findEgg();
}).setCriteria("&r&cYou have already collected this ${*}&r&c! Try again when it respawns!&r")
Settings.registerSetting("Possible Chocolate Egg Waypoints", "chat", () => {
    findEgg();
}).setCriteria("&r&d&lHOPPITY'S HUNT &r&dYou found a &r&${*}Chocolate ${*} Egg ").setStart();