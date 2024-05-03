import Settings from "../../utils/settings/main";

import { Waypoint } from "../../utils/waypoint";
import { addWaypoint, getWaypointData, getWaypointIdAt, removeWaypoint, updateWaypointManagerMenu } from "../waypoints";
import { getArea, getScoreboardLinesSafe, getSkyblockItemID, getTabListNamesSafe, registerArea } from "../../utils/skyblock";
import { showTitle } from "../../utils/render";

var found_eggs = {
    "Breakfast Egg": "NO_ID",
    "Lunch Egg": "NO_ID",
    "Dinner Egg": "NO_ID",
};
function findEgg(x = Player.getX(), y = Player.getY(), z = Player.getZ(), looted = false) {
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
        
        // switch (chestplate_id) {
        //     case "LAPIS_ARMOR_CHESTPLATE":
        //         addEggWaypoint("Lapis Corpse", egg_x, egg_y, egg_z, "BLUE", looted);
        //         found_eggs.add(`${egg_x.toFixed()}_${egg_y.toFixed()}_${egg_z.toFixed()}`);
        //         break;
        //     case "ARMOR_OF_YOG_CHESTPLATE":
        //         addEggWaypoint("Umber Corpse", egg_x, egg_y, egg_z, "GOLD", looted);
        //         found_eggs.add(`${egg_x.toFixed()}_${egg_y.toFixed()}_${egg_z.toFixed()}`);
        //         break;
        //     case "MINERAL_CHESTPLATE":
        //         addEggWaypoint("Tungsten Corpse", egg_x, egg_y, egg_z, "GRAY", looted);
        //         found_eggs.add(`${egg_x.toFixed()}_${egg_y.toFixed()}_${egg_z.toFixed()}`);
        //         break;
        //     case "VANGUARD_CHESTPLATE":
        //         addEggWaypoint("Vanguard Corpse", egg_x, egg_y, egg_z, "AQUA", looted);
        //         found_eggs.add(`${egg_x.toFixed()}_${egg_y.toFixed()}_${egg_z.toFixed()}`);
        //         break;
        // }
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
    if (!looted && waypoint_data && waypoint_data.player !== "&7Possible Egg")
        return;
    
    found_eggs[message] = addWaypoint(message, x, y, z, type, "", true, true, 0);

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

    if (area in egg_data) {
        possible_eggs = egg_data[area].map((waypoint) => {
            const waypoint_data = getWaypointData(getWaypointIdAt(waypoint.x, waypoint.y, waypoint.z));
            if (waypoint_data && waypoint_data.player !== "&7Possible Egg") {
                return "NO_ID";
            }
            return addWaypoint("&7Possible Egg", waypoint.x, waypoint.y, waypoint.z, "DARK_AQUA", "", false, true, 5, 0, (x, y, z) => { findEgg(x, y, z); });
        });
    }
    else {
        egg_data[area] = [];
        FileLib.write(IMPORT_NAME, EGG_DATA_FILE_NAME, JSON.stringify(egg_data));
    }
}

register("chat", (egg) => {
    loadPossibleLocations();
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


register("chat", () => {
    findEgg();
}).setCriteria("&r&cYou have already collected this ${*}&r&c! Try again when it respawns!&r")
register("chat", () => {
    findEgg();
}).setCriteria("&r&d&lHOPPITY'S HUNT &r&dYou found a &r&${*}Chocolate ${*} Egg ").setStart();

loadPossibleLocations();

/*
&r&d&lHOPPITY'S HUNT &r&dA &r&aChocolate Dinner Egg &r&dhas appeared!&r

Class: EntityArmorStand
NBT Data:
{
    NoGravity: 1b,
    HurtByTimestamp: 0,
    Attributes: [{
        Base: 20.0d,
        Name: "generic.maxHealth"
    }, {
        Base: 0.0d,
        Name: "generic.knockbackResistance"
    }, {
        Base: 0.10000000149011612d,
        Name: "generic.movementSpeed"
    }],
    Invulnerable: 0b,
    ShowArms: 0b,
    PortalCooldown: 0,
    AbsorptionAmount: 0.0f,
    FallDistance: 0.0f,
    DisabledSlots: 0,
    DeathTime: 0s,
    Pose: {
    },
    HealF: 20.0f,
    Invisible: 1b,
    Motion: [0.0d, 0.0d, 0.0d],
    Small: 0b,
    UUIDLeast: -8239355601107589445L,
    Health: 20s,
    Silent: 1b,
    Air: 300s,
    OnGround: 0b,
    Dimension: 0,
    Rotation: [-70.3125f, 0.0f],
    UUIDMost: -2473208554589108820L,
    Equipment: [{
    }, {
    }, {
    }, {
    }, {
        id: "minecraft:skull",
        Count: 1b,
        tag: {
            SkullOwner: {
                Id: "015adc61-0aba-3d4d-b3d1-ca47a68a154b",
                Properties: {
                    textures: [{
                        Value: "ewogICJ0aW1lc3RhbXAiIDogMTcxMTQ2MjY3MzE0OSwKICAicHJvZmlsZUlkIiA6ICJiN2I4ZTlhZjEwZGE0NjFmOTY2YTQxM2RmOWJiM2U4OCIsCiAgInByb2ZpbGVOYW1lIiA6ICJBbmFiYW5hbmFZZzciLAogICJzaWduYXR1cmVSZXF1aXJlZCIgOiB0cnVlLAogICJ0ZXh0dXJlcyIgOiB7CiAgICAiU0tJTiIgOiB7CiAgICAgICJ1cmwiIDogImh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvYTQ5MzMzZDg1YjhhMzE1ZDAzMzZlYjJkZjM3ZDhhNzE0Y2EyNGM1MWI4YzYwNzRmMWI1YjkyN2RlYjUxNmMyNCIKICAgIH0KICB9Cn0"
                    }]
                }
            }
        },
        Damage: 3s
    }],
    Pos: [160.5d, 95.53125d, -70.5d],
    Fire: 0s,
    NoBasePlate: 1b,
    HurtTime: 0s
}

Class: EntityArmorStand
NBT Data:
{
    NoGravity: 1b,
    HurtByTimestamp: 0,
    Attributes: [{
        Base: 20.0d,
        Name: "generic.maxHealth"
    }, {
        Base: 0.0d,
        Name: "generic.knockbackResistance"
    }, {
        Base: 0.10000000149011612d,
        Name: "generic.movementSpeed"
    }],
    Invulnerable: 0b,
    ShowArms: 1b,
    PortalCooldown: 0,
    AbsorptionAmount: 0.0f,
    FallDistance: 0.0f,
    DisabledSlots: 0,
    DeathTime: 0s,
    Pose: {
        RightArm: [0.0f, 0.0f, 0.0f]
    },
    HealF: 20.0f,
    Invisible: 1b,
    Motion: [0.0d, 0.0d, -0.03504999007999999d],
    Small: 0b,
    UUIDLeast: -4882567339559074028L,
    Health: 20s,
    Silent: 1b,
    Air: 300s,
    OnGround: 0b,
    Dimension: 0,
    Marker: 1b,
    Rotation: [-146.25f, 0.0f],
    UUIDMost: 2300700075627727266L,
    Equipment: [{
        id: "minecraft:skull",
        Count: 1b,
        tag: {
            SkullOwner: {
                Id: "bb63afb7-5e94-4cfd-a355-78a27121e38c",
                hypixelPopulated: 1b,
                Properties: {
                    textures: [{
                        Value: "ewogICJ0aW1lc3RhbXAiIDogMTYyMDM1MDA5ODgyNiwKICAicHJvZmlsZUlkIiA6ICJiNWRkZTVmODJlYjM0OTkzYmMwN2Q0MGFiNWY2ODYyMyIsCiAgInByb2ZpbGVOYW1lIiA6ICJsdXhlbWFuIiwKICAic2lnbmF0dXJlUmVxdWlyZWQiIDogdHJ1ZSwKICAidGV4dHVyZXMiIDogewogICAgIlNLSU4iIDogewogICAgICAidXJsIiA6ICJodHRwOi8vdGV4dHVyZXMubWluZWNyYWZ0Lm5ldC90ZXh0dXJlLzJlOWY5YjFmYzAxNDE2NmNiNDZhMDkzZTUzNDliMmJmNmVkZDIwMWI2ODBkNjJlNDhkYmYzYWY5YjA0NTkxMTYiLAogICAgICAibWV0YWRhdGEiIDogewogICAgICAgICJtb2RlbCIgOiAic2xpbSIKICAgICAgfQogICAgfQogIH0KfQ=="
                    }]
                },
                Name: "§bb63afb7-5e94-4cfd-a355-78a27121e38c"
            },
            display: {
                Name: "§abb63afb7-5e94-4cfd-a355-78a27121e38c"
            }
        },
        Damage: 3s
    }, {
    }, {
    }, {
    }, {
    }],
    Pos: [169.875d, 71.8125d, 37.875d],
    Fire: 0s,
    NoBasePlate: 0b,
    HurtTime: 0s
}
*/