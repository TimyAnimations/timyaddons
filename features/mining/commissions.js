import Settings from "../../utils/settings/main";
import { drawWaypoint } from "../../utils/waypoint";
import { drawOffscreenPointer } from "../../utils/render";
import { getTabListNamesSafe } from "../../utils/skyblock";

const COMMISSION_MESSAGES = {
    aquamarine_collector: "Aquamarine Gemstone Collector",
    onyx_collector: "Onyx Gemstone Collector",
    peridot_collector: "Peridot Gemstone Collector",
    citrine_collector: "Citrine Gemstone Collector",
    goblin_slayer: "Goblin Slayer",
    glacite_walker_slayer: "Glacite Walker Slayer",
    upper_mines: "Upper Mines",
    ramparts_quarry: "Rampart's Quarry",
    cliffside_veins: "Cliffside Veins",
    lava_springs: "Lava Springs",
    royal_mines: "Royal Mines",
}

const COMMISSION_DATA = {
    aquamarine_collector: {
        name: "Aquamarine",
        color: {r: 0.1, g: 0.1, b: 1.0},
        locations: [
            [51, 117, 302],
            [95, 152, 382],
            [-3, 139, 435],
        ]
    },
    onyx_collector: {
        name: "Onyx",
        color: {r: 0.1, g: 0.1, b: 0.1},
        locations: [
            [79, 119, 413],
            [-68, 130, 406],
            [2, 132, 388],
        ]
    },
    peridot_collector: {
        name: "Peridot",
        color: {r: 0.1, g: 0.5, b: 0.1},
        locations: [
            [92, 122, 398],
            [-73, 122, 458],
            [-62, 147, 303],
            [-77, 120, 281],
        ]
    },
    citrine_collector: {
        name: "Citrine",
        color: {r: 0.5, g: 0.25, b: 0.1},
        locations: [
            [32, 119, 389],
            [-93, 144, 261],
            [-59, 144, 422],
            [-47, 127, 412],
        ]
    },
    goblin_slayer: {
        name: "Goblin Slayer",
        color: {r: 0.7, g: 0.1, b: 0.1},
        locations: [[-138, 143, 138]]
    },
    glacite_walker_slayer: {
        name: "Glacite Walker Slayer",
        color: {r: 0.7, g: 0.1, b: 0.1},
        locations: [[0, 128, 160]]
    },
    upper_mines: {
        name: "Upper Mines",
        color: {r: 0.1, g: 0.6, b: 0.5},
        locations: [[-102, 221, -66]]
    },
    ramparts_quarry: {
        name: "Rampart's Quarry",
        color: {r: 0.1, g: 0.6, b: 0.5},
        locations: [[-91, 153, -16]]
    },
    cliffside_veins: {
        name: "Cliffside Veins",
        color: {r: 0.1, g: 0.6, b: 0.5},
        locations: [[13, 128, 40]]
    },
    lava_springs: {
        name: "Lava Springs",
        color: {r: 0.1, g: 0.6, b: 0.5},
        locations: [[63, 197, -16]]
    },
    royal_mines: {
        name: "Royal Mines",
        color: {r: 0.1, g: 0.6, b: 0.5},
        locations: [[169, 150, 37]]
    },
}

var commission_waypoint_offscreen = {};
var commission_waypoint_closest = {};
Object.keys(COMMISSION_MESSAGES).forEach((key) => {
    commission_waypoint_offscreen[key] = [];
    commission_waypoint_closest[key] = 0;
});

var current_commissions = [];

function updateCommissionInfo() {
    let names = getTabListNamesSafe();
    if (!names || names.length === 0) return;
    
    let idx = 20;
    for (; !names[idx]?.startsWith("§r§9§lCommissions:") && idx < names.length; idx++);

    if (idx === names.length) return;
    if (!names[idx]?.startsWith("§r§9§lCommissions:")) return;

    current_commissions = [];
    Object.entries(COMMISSION_MESSAGES).forEach(([key, value]) => {
        for (let i = 0; i < 4; i++) {
            if (key in current_commissions) continue;
            if (names[idx + 1 + i]?.replace(/§[0-9a-fk-or]/g, "")?.trim()?.startsWith(value)) {
                current_commissions.push(key);
            }
        }
    });
}

Settings.registerSetting("Commission Waypoints", "step", () => {
    updateCommissionInfo();
}).requireArea("Dwarven Mines").setFps(1);

Settings.registerSetting("Commission Waypoints", "renderWorld", (partial_tick) => {
    current_commissions.forEach((key) => {
        let data = COMMISSION_DATA[key];
        let closest_distance_sq = Infinity;
        if (data.locations.length > 1) {
            data.locations.forEach(([x, y, z], idx) => {
                let distance_sq = (Player.getX() - x)**2 + (Player.getY() - y)**2 + (Player.getZ() - z)**2;
                if (distance_sq < closest_distance_sq) {
                    closest_distance_sq = distance_sq;
                    commission_waypoint_closest[key] = idx;
                }
            })
        }
        else {
            commission_waypoint_closest[key] = 0;
        }
        data.locations.forEach(([x, y, z], idx) => {
            let important = commission_waypoint_closest[key] === idx;
            drawWaypoint(
                commission_waypoint_offscreen[key][idx] ? "" : `${data.name}${(important && data.locations.length > 1) ? "\n§7closest" : ""}`, 
                x, y, z, data.color.r, data.color.g, data.color.b, false, false, 
                Settings.waypoint_show_arrow > 0 && (Settings.waypoint_show_arrow > 1 || important) 
                && (Settings.waypoint_arrow_style == 1 || Settings.waypoint_arrow_style == 3)
                    ? (Settings.waypoint_show_arrow_label > 0 && (important || Settings.waypoint_show_arrow_label == 2) ? 3 : 2)
                    : 0
            );
        });
    });
}).requireArea("Dwarven Mines");

Settings.registerSetting("Commission Waypoints", "renderOverlay", () => {
    if (Settings.waypoint_show_arrow == 0) return;

    current_commissions.forEach((key) => {
        let data = COMMISSION_DATA[key];
        
        data.locations.forEach(([x, y, z], idx) => {
            let important = commission_waypoint_closest[key] === idx;
            if (Settings.waypoint_show_arrow == 1 && !important)
                return;
            commission_waypoint_offscreen[key][idx] = 
                drawOffscreenPointer(
                    x + 0.5, y + 0.5, z + 0.5, data.color.r, data.color.g, data.color.b,
                    Settings.waypoint_show_arrow_label > 0 && (important || Settings.waypoint_show_arrow_label == 2) 
                        ? `${data.name}${(important && data.locations.length > 1) ? "\n§7closest" : ""}` 
                        : undefined,
                    Settings.waypoint_show_distance,
                    Settings.waypoint_arrow_style >= 2
                );
        });
    }); 
}).requireArea("Dwarven Mines");

