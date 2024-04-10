import Settings from "../utils/settings/main";
import { Waypoint } from "../utils/waypoint";
import { queueCommand } from "../utils/command_queue";
import { Button, Checkbox, GuiMenu, Label, Row, Textbox } from "../utils/menu_gui";
var waypoints = {};

const COLORS = {
    "PARTY": {r: 0.0, g: 0.25, b: 1.0},
    "ALL": {r: 1.0, g: 0.0, b: 0.5},
    "COOP": {r: 0.0, g: 1.0, b: 1.0},
    "SYSTEM": {r: 0.5, g: 0.5, b: 0.5}
}

Settings.registerSetting("Waypoint from coordinates in party chat", "chat", (player, x, y, z) => {
    addWaypoint(player, parseInt(x), parseInt(y), parseInt(z), "PARTY", z.trim().split(" ")?.slice(1)?.join(" "));
}).setCriteria("&r&9Party &8> ${player}&f: &rx: ${x}, y: ${y}, z: ${z}").setAction(clearWaypoints);
Settings.registerSetting("Waypoint from coordinates in co-op chat", "chat", (player, x, y, z) => {
    addWaypoint(player, parseInt(x), parseInt(y), parseInt(z), "COOP", z.trim().split(" ")?.slice(1)?.join(" "));
}).setCriteria("&r&bCo-op > ${player}&f: &rx: ${x}, y: ${y}, z: ${z}").setAction(clearWaypoints);
Settings.registerSetting("Waypoint from coordinates in all chat", "chat", (prefix, player, x, y, z) => {
    if (prefix.includes(">")) return;
    addWaypoint(player, parseInt(x), parseInt(y), parseInt(z), "ALL", z.trim().split(" ")?.slice(1)?.join(" "));
}).setCriteria("&r${prefix}&r${player}&f: x: ${x}, y: ${y}, z: ${z}").setAction(clearWaypoints);

export function addWaypoint(player, x, y, z, type, info = "", replace = true, persistant = false) {
    if (isNaN(x) || isNaN(y) || isNaN(z))
        return;

    let overlap_id = getWaypointIdAt(x, y, z);
    removeWaypoint(overlap_id);
    
    let title = "";

    if (player === "")
        player = "Waypoint";
    
    title = player;
    if (info !== "" && info !== "&r") {
        if (player === "Waypoint") {
            player = info.slice(0, 32);
            title = player + "&r";
        }
        else
            title = player + "\n&r&7" + info.slice(0, 32) + "&r";
    }

    

    const id = replace ? `${title}${type}` : `${title}${type}${Date.now()}`;
    if (id in waypoints) {
        waypoints[id].waypoint.setPosition(x, y, z);
        waypoints[id].waypoint.show();
        waypoints[id].time = persistant ? undefined : Date.now();
    }
    else 
    waypoints[id] = {
        waypoint: new Waypoint( title.replace(/&/g, "§"), 
            x, y, z, COLORS[type].r, COLORS[type].g, COLORS[type].b ).show(),
        time: persistant ? undefined : Date.now(),
        player: player,
        info: info.replace(/&r$/, ""),
        type: type
    };

    // Object.entries(waypoints[id].waypoint).forEach(([key, value]) => { ChatLib.chat(`key: ${key}\n     value: ${value}`)});
    updateManagerMenu();

    if (Settings.waypoint_cooldown_seconds === 0 || persistant) return;
    setTimeout(() => {
        if (!waypoints[id]?.time || waypoints[id]?.time + (Settings.waypoint_cooldown_seconds * 1000) - 100 > Date.now()) 
            return;
        waypoints[id]?.waypoint?.hide();
    }, Settings.waypoint_cooldown_seconds * 1000);
}

function clearWaypoints() {
    for (let id in waypoints) {
        removeWaypoint(id);
    }

    updateManagerMenu();
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
register("command", (...args) => {
    if (args.length < 3) {
        addWaypoint("", Math.floor(Player.getX()), Math.floor(Player.getY()), Math.floor(Player.getZ()), "SYSTEM", args.join(" "), false);
    }
    else {
        addWaypoint("", parseInt(args[0]), parseInt(args[1]), parseInt(args[2]), "SYSTEM", args.slice(3).join(" "), false);
    }
}).setName("addwaypoint");

function toggleWaypoint(id) {
    if (!(id in waypoints)) return;
    if (waypoints[id]?.waypoint.visible) {
        waypoints[id]?.waypoint?.hide();
    }
    else {
        waypoints[id]?.waypoint?.show();
    }
    waypoints[id]?.time = undefined;
}

function removeWaypoint(id) {
    if (!(id in waypoints)) return;
    waypoints[id]?.waypoint?.hide();
    waypoints[id]?.waypoint?.destructor();
    delete waypoints[id];
}

function getWaypointIdAt(x, y, z) {
    for (let id in waypoints) {
        if (waypoints[id]?.waypoint?.atPosition(x, y, z))
            return id;
    }
    return undefined;
}

const manager = new GuiMenu(110, -110);
manager.setAnchor(0.5, 0.5);
updateManagerMenu();

var selected_waypoint = undefined;
const sub_menu = new GuiMenu(0, 0, [
    new Button("§0Remove\n", () => { removeWaypoint(selected_waypoint); selected_waypoint = undefined; updateManagerMenu(); }).setBackgroundColor(Renderer.RED),
    // new Label("\n"),
    new Label("Rename: "),
    new Textbox("\n", (string) => {
        if (!waypoints[selected_waypoint]) return;
        let waypoint = waypoints[selected_waypoint]?.waypoint;
        addWaypoint("", Math.floor(waypoint.x), Math.floor(waypoint.y), Math.floor(waypoint.z), waypoints[selected_waypoint]?.type ?? "SYSTEM", string, true, true);
    }),
    new Label("Share: "),
    new Row(
        new Button("§0ALL", () => {
            if (!waypoints[selected_waypoint]) return;
            let waypoint = waypoints[selected_waypoint]?.waypoint;
            let info = waypoints[selected_waypoint]?.info ?? "";
            queueCommand(`ac x: ${Math.floor(waypoint.x)}, y: ${Math.floor(waypoint.y)}, z: ${Math.floor(waypoint.z)} ${info}`);
        }).alignCenter().setBackgroundColor(Renderer.LIGHT_PURPLE).setGap(1),
        
        new Button("§0PARTY", () => {
            if (!waypoints[selected_waypoint]) return;
            let waypoint = waypoints[selected_waypoint]?.waypoint;
            let info = waypoints[selected_waypoint]?.info ?? "";
            queueCommand(`pc x: ${Math.floor(waypoint.x)}, y: ${Math.floor(waypoint.y)}, z: ${Math.floor(waypoint.z)} ${info}`);
        }).alignCenter().setBackgroundColor(Renderer.BLUE).setGap(1),
        
        new Button("§0CO-OP", () => {
            if (!waypoints[selected_waypoint]) return;
            let waypoint = waypoints[selected_waypoint]?.waypoint;
            let info = waypoints[selected_waypoint]?.info ?? "";
            queueCommand(`cc x: ${Math.floor(waypoint.x)}, y: ${Math.floor(waypoint.y)}, z: ${Math.floor(waypoint.z)} ${info}`);
        }).alignCenter().setBackgroundColor(Renderer.AQUA).setGap(1),
    ),
    
]);
function openSubMenu(id, mouse_x, mouse_y) {
    sub_menu.setPosition(mouse_x, mouse_y);
    sub_menu.content[2].setInput("");
    selected_waypoint = id;
}

function updateManagerMenu() {
    let content = [
        new Label("§6§lWaypoint Manager§r\n").alignCenter().setBackgroundColor(Renderer.color(85, 85, 85, 85)),    
    ]
    if (Object.keys(waypoints).length > 0) {
        for (let id in waypoints) {
            const this_id = id;
            const name = waypoints[this_id]?.player !== waypoints[this_id]?.info.slice(0, 32)
                            ? `${waypoints[this_id]?.player}§r§7 ${waypoints[this_id]?.info}`
                            : `${waypoints[this_id]?.player}`
            content.push(
                new Checkbox(`${name}\n`, (mouse_x, mouse_y, mouse_button) => {
                    if (mouse_button === 0.0) {
                        toggleWaypoint(this_id);
                        return;
                    }

                    openSubMenu(this_id, mouse_x, mouse_y);
                }, () => { return waypoints[this_id]?.waypoint?.visible; })
                    .setBackgroundColor(Renderer.color(
                        Math.floor(COLORS[waypoints[this_id]?.type ?? "SYSTEM"].r * 255), 
                        Math.floor(COLORS[waypoints[this_id]?.type ?? "SYSTEM"].g * 255), 
                        Math.floor(COLORS[waypoints[this_id]?.type ?? "SYSTEM"].b * 255), 85
                    ))
            );
        }
    }
    else {
        content.push(new Label("§7no recent waypoints\n"));
    }
    content.push(
        new Label("\n"),
        new Row(
            new Button("§0ADD", () => { addWaypoint("", Math.floor(Player.getX()), Math.floor(Player.getY()), Math.floor(Player.getZ()), "SYSTEM", "", false, true); }).alignCenter().setBackgroundColor(Renderer.AQUA),
            new Button("§0CLEAR", () => { clearWaypoints(); }).alignCenter().setBackgroundColor(Renderer.RED),
        ),
    );
    manager.setContent(content);
    selected_waypoint = undefined;
}

Settings.registerSetting("Waypoint manager menu", "guiRender", (mouse_x, mouse_y, gui) => {
    if (!gui || !(gui instanceof Java.type("net.minecraft.client.gui.inventory.GuiInventory"))) 
        return;

    GlStateManager.func_179140_f();
    if (selected_waypoint && sub_menu.inArea(mouse_x, mouse_y)) {
        manager.draw(0, 0);
    }
    else {
        manager.draw(mouse_x, mouse_y);
    }
    if (selected_waypoint)
        sub_menu.draw(mouse_x, mouse_y);
});

Settings.registerSetting("Waypoint manager menu", "guiMouseClick", (mouse_x, mouse_y, button, gui) => {
    if (!gui || !(gui instanceof Java.type("net.minecraft.client.gui.inventory.GuiInventory"))) 
        return;

    if (selected_waypoint && sub_menu.inArea(mouse_x, mouse_y)) {
        sub_menu.clicked(mouse_x, mouse_y, button);
    }
    else {
        selected_waypoint = undefined;
        manager.clicked(mouse_x, mouse_y, button);
    }
});

Settings.registerSetting("Waypoint manager menu", "guiKey", (char, key, gui, event) => {
    if (!gui || !(gui instanceof Java.type("net.minecraft.client.gui.inventory.GuiInventory"))) 
        return;

    if (selected_waypoint && sub_menu.key(char, key))
        cancel(event);
});

Settings.registerSetting("Waypoint manager menu", "guiClosed", () => { selected_waypoint = undefined; });