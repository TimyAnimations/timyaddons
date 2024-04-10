import Settings from "../../utils/settings/main";
import { Waypoint, drawWaypoint } from "../../utils/waypoint";
import { drawOffscreenPointer } from "../../utils/render";

const COMMISSION_MESSAGES = {
    aquamarine_collector: "§r §r§fAquamarine Gemstone Collector:",
    onyx_collector: "§r §r§fOnyx Gemstone Collector:",
    peridot_collector: "§r §r§fPeridot Gemstone Collector:",
    citrine_collector: "§r §r§fCitrine Gemstone Collector:",
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
        ]
    },
    peridot_collector: {
        name: "Peridot",
        color: {r: 0.1, g: 0.5, b: 0.1},
        locations: [
            [92, 122, 398],
            [-73, 122, 458],
        ]
    },
    citrine_collector: {
        name: "Citrine",
        color: {r: 0.5, g: 0.25, b: 0.1},
        locations: [
            [32, 119, 389],
            [-93, 114, 261],
            [-59, 144, 422],
        ]
    },
}

var commission_waypoint_offscreen = {
    aquamarine_collector: [],
    onyx_collector: [],
    peridot_collector: [],
    citrine_collector: [],
};

var current_commissions = [];

function updateCommissionInfo() {
    if (!TabList) return;
    let names = TabList?.getNames();
    if (!names) return;
    
    let idx = 20;
    for (; !names[idx]?.startsWith("§r§9§lCommissions:") && idx < names.length; idx++);

    if (idx === names.length) return;
    if (!names[idx]?.startsWith("§r§9§lCommissions:")) return;

    current_commissions = [];
    Object.entries(COMMISSION_MESSAGES).forEach(([key, value]) => {
        for (let i = 0; i < 4; i++) {
            if (names[idx + i]?.startsWith(value)) {
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
        data.locations.forEach(([x, y, z], idx) => {
            drawWaypoint(
                commission_waypoint_offscreen[key][idx] ? "" : data.name, 
                x, y, z, data.color.r, data.color.g, data.color.b, false, false, false);
        });
    });
}).requireArea("Dwarven Mines");

Settings.registerSetting("Commission Waypoints", "renderOverlay", () => {
    current_commissions.forEach((key) => {
        let data = COMMISSION_DATA[key];
        data.locations.forEach(([x, y, z], idx) => {
            commission_waypoint_offscreen[key][idx] = 
                drawOffscreenPointer(
                    x + 0.5, y + 0.5, z + 0.5, data.color.r, data.color.g, data.color.b,
                    Settings.waypoint_show_arrow_label == 2 ? data.name : undefined,
                    Settings.waypoint_show_distance,
                    Settings.waypoint_arrow_style >= 2
                );
        });
    }); 
}).requireArea("Dwarven Mines");

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

Settings.registerSetting("Dwarven Base Campfire Waypoint", "worldUnload", () => {
    base_camp_waypoint.hide();
}).requireArea("Dwarven Mines");