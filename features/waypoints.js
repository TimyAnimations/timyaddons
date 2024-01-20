import Settings from "../utils/settings/main";
import { Waypoint } from "../utils/waypoint";
import { queueCommand } from "../utils/command_queue";
var waypoints = {};

const COLORS = {
    "PARTY": {r: 0.0, g: 0.25, b: 1.0},
    "ALL": {r: 1.0, g: 0.0, b: 0.5},
    "COOP": {r: 0.0, g: 1.0, b: 1.0},
}

Settings.registerSetting("Waypoint from coordinates in party chat", "chat", (player, x, y, z) => {
    addWaypoint(player, x, y, z, "PARTY");
}).setCriteria("&r&9Party &8> ${player}&f: &rx: ${x}, y: ${y}, z: ${z}").setAction(clearWaypoints);
Settings.registerSetting("Waypoint from coordinates in co-op chat", "chat", (player, x, y, z) => {
    addWaypoint(player, x, y, z, "COOP");
}).setCriteria("&r&bCo-op > ${player}&f: &rx: ${x}, y: ${y}, z: ${z}").setAction(clearWaypoints);
Settings.registerSetting("Waypoint from coordinates in all chat", "chat", (prefix, player, x, y, z) => {
    if (prefix.includes(">")) return;
    addWaypoint(player, x, y, z, "ALL");
}).setCriteria("&r${prefix}&r${player}&f: x: ${x}, y: ${y}, z: ${z}").setAction(clearWaypoints);

function addWaypoint(player, x, y, z, type) {
    let z_splits = z.trim().split(" ");
    
    if (z_splits.length > 1) {
        z = z_splits[0];
        let info = z_splits.slice(1).join(" ");
        if (info !== "&r") 
            player += "\n&r&7" + info.slice(0, 32) + "&r&7";
    }
    
    const id = player + type;
    if (id in waypoints) {
        waypoints[id].waypoint.setPosition(parseInt(x), parseInt(y), parseInt(z));
        waypoints[id].waypoint.show();
        waypoints[id].time = Date.now();
    }
    else 
    waypoints[id] = {
        waypoint: new Waypoint( player.replace(/&/g, "§"), 
            parseInt(x), parseInt(y), parseInt(z), COLORS[type].r, COLORS[type].g, COLORS[type].b ).show(),
        time: Date.now()
    };

    if (Settings.waypoint_cooldown_seconds === 0) return;
    setTimeout(() => {
        if (waypoints[id]?.time + (Settings.waypoint_cooldown_seconds * 1000) - 100 > Date.now()) 
            return;
        waypoints[id]?.waypoint?.hide();
    }, Settings.waypoint_cooldown_seconds * 1000);
}

function clearWaypoints() {
    for (let name in waypoints) {
        waypoints[name].waypoint.destructor();
    }

    waypoints = {};
}
register("worldUnload", clearWaypoints); 

register("command", (...args) => {
    queueCommand(`pc x: ${Math.floor(Player.getX())}, y: ${Math.floor(Player.getY())}, z: ${Math.floor(Player.getZ())} ${args.join(" ")}`);
}).setName("partysendcoords");
register("command", (...args) => {
    queueCommand(`cc x: ${Math.floor(Player.getX())}, y: ${Math.floor(Player.getY())}, z: ${Math.floor(Player.getZ())} ${args.join(" ")}`);
}).setName("coopsendcoords");
register("command", (...args) => {
    queueCommand(`ac x: ${Math.floor(Player.getX())}, y: ${Math.floor(Player.getY())}, z: ${Math.floor(Player.getZ())} ${args.join(" ")}`);
}).setName("allsendcoords");