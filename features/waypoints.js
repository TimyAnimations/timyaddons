import Settings from "../utils/settings/main";
import { Waypoint } from "../utils/waypoint";
import { queueCommand } from "../utils/command_queue";
import { Button, Checkbox, GuiMenu, Label, Line, Row, Textbox } from "../utils/menu_gui";
var waypoints = {};

const COLORS = {
    "PARTY": {r: 0.33, g: 0.33, b: 1.0},
    "ALL": {r: 1.0, g: 0.33, b: 1.0},
    "COOP": {r: 0.33, g: 1.0, b: 1.0},
    "CAMPFIRE": {r: 1.0, g: 0.5, b: 0.0},
    "SYSTEM": {r: 1.0, g: 1.0, b: 1.0},
    "BLACK": {r: 0.1, g: 0.1, b: 0.1},
    "DARK_BLUE": {r: 0.0, g: 0.0, b: 0.66},
    "DARK_GREEN": {r: 0.0, g: 0.66, b: 0.0},
    "DARK_AQUA": {r: 0.0, g: 0.66, b: 0.66},
    "DARK_RED": {r: 0.66, g: 0.0, b: 0.0},
    "DARK_PURPLE": {r: 0.66, g: 0.0, b: 0.66},
    "GOLD": {r: 1.0, g: 0.66, b: 0.0},
    "GRAY": {r: 0.66, g: 0.66, b: 0.66},
    "DARK_GRAY": {r: 0.33, g: 0.33, b: 0.33},
    "BLUE": {r: 0.33, g: 0.33, b: 1.0},
    "GREEN": {r: 0.33, g: 1.0, b: 0.33},
    "AQUA": {r: 0.33, g: 1.0, b: 1.0},
    "RED": {r: 1.0, g: 0.33, b: 0.33},
    "LIGHT_PURPLE": {r: 1.0, g: 0.33, b: 1.0},
    "YELLOW": {r: 1.0, g: 1.0, b: 0.33},
    "WHITE": {r: 1.0, g: 1.0, b: 1.0}
}

const COLOR_ORDER = [
    "BLACK",
    "DARK_BLUE",
    "DARK_GREEN",
    "DARK_AQUA",
    "DARK_RED",
    "DARK_PURPLE",
    "GOLD",
    "GRAY",
    "DARK_GRAY",
    "BLUE",
    "GREEN",
    "AQUA",
    "RED",
    "LIGHT_PURPLE",
    "YELLOW",
    "WHITE",
];

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

var count = 0;
export function addWaypoint(player, x, y, z, type, info = "", replace = true, persistant = false, hide_distance = 5) {
    if (isNaN(x) || isNaN(y) || isNaN(z))
        return undefined;

    let overlap_id = getWaypointIdAt(x, y, z);
    if (overlap_id) {
        if (persistant || !waypoints[overlap_id].persistant)
            removeWaypoint(overlap_id);
        else return undefined;
    }
    
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

    

    const id = replace ? `${title}${type}` : `${title}${type}${Date.now()}${count++}`;
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
        type: type,
        persistant: persistant,
        color: 0
    };

    setTimeout(() => {
        waypoints[id]?.waypoint?.setHideDistance(hide_distance);
    }, 3_000);


    // Object.entries(waypoints[id].waypoint).forEach(([key, value]) => { ChatLib.chat(`key: ${key}\n     value: ${value}`)});
    updateManagerMenu();

    if (Settings.waypoint_cooldown_seconds === 0 || persistant) return id;
    setTimeout(() => {
        if (!waypoints[id]?.time || waypoints[id]?.time + (Settings.waypoint_cooldown_seconds * 1000) - 100 > Date.now()) 
            return;
        waypoints[id]?.waypoint?.hide();
    }, Settings.waypoint_cooldown_seconds * 1_000);

    return id;
}

function setWaypointType(id, type = "SYSTEM") {
    if (!(id in waypoints) || !(type in COLORS)) return;
    waypoints[id].type = type;
    waypoints[id].waypoint.r = COLORS[type].r;
    waypoints[id].waypoint.g = COLORS[type].g;
    waypoints[id].waypoint.b = COLORS[type].b;
}

function changeWaypointColor(id) {
    if (!(id in waypoints)) return;
    waypoints[id].color = (waypoints[id].color + 1) % COLOR_ORDER.length;
    setWaypointType(id, COLOR_ORDER[waypoints[id].color]);
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
}).setName("partysendcoords").setAliases("psc");
register("command", (...args) => {
    queueCommand(`cc x: ${Math.floor(Player.getX())}, y: ${Math.floor(Player.getY())}, z: ${Math.floor(Player.getZ())} ${args.join(" ")}`);
}).setName("coopsendcoords").setAliases("csc");
register("command", (...args) => {
    queueCommand(`ac x: ${Math.floor(Player.getX())}, y: ${Math.floor(Player.getY())}, z: ${Math.floor(Player.getZ())} ${args.join(" ")}`);
}).setName("allsendcoords").setAliases("asc");
register("command", (...args) => {
    if (args.length < 3) {
        addWaypoint("", Math.floor(Player.getX()), Math.floor(Player.getY()), Math.floor(Player.getZ()), "SYSTEM", args.join(" "), false, true, 0);
    }
    else {
        addWaypoint("", parseInt(args[0]), parseInt(args[1]), parseInt(args[2]), "SYSTEM", args.slice(3).join(" "), false, true, 0);
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
    new Label("&6&lEdit Waypoint\n").alignCenter().setBackgroundColor(Renderer.color(85, 85, 85, 85)),
    new Line(2),
    new Button("§0Remove\n", () => { removeWaypoint(selected_waypoint); selected_waypoint = undefined; updateManagerMenu(); }).setBackgroundColor(Renderer.RED),
    // new Label("\n"),
    new Line(2),
    new Label("Name: "),
    new Textbox("waypoint name\n", (string) => {
        if (!waypoints[selected_waypoint]) return;
        let waypoint = waypoints[selected_waypoint]?.waypoint;
        openSubMenu(addWaypoint("", Math.floor(waypoint.x), Math.floor(waypoint.y), Math.floor(waypoint.z), waypoints[selected_waypoint]?.type ?? "SYSTEM", string, true, true, 0));
    }),
    new Line(2),
    new Button("Change Color\n", () => { changeWaypointColor(selected_waypoint); updateManagerMenu(); openSubMenu(); }),
    new Line(2),
    new Label("Share: "),
    new Row(
        new Button(" §0ALL ", () => {
            if (!waypoints[selected_waypoint]) return;
            let waypoint = waypoints[selected_waypoint]?.waypoint;
            let info = waypoints[selected_waypoint]?.info ?? "";
            queueCommand(`ac x: ${Math.floor(waypoint.x)}, y: ${Math.floor(waypoint.y)}, z: ${Math.floor(waypoint.z)} ${info}`);
        }).alignCenter().setBackgroundColor(Renderer.LIGHT_PURPLE).setGap(1),
        
        new Button(" §0PARTY ", () => {
            if (!waypoints[selected_waypoint]) return;
            let waypoint = waypoints[selected_waypoint]?.waypoint;
            let info = waypoints[selected_waypoint]?.info ?? "";
            queueCommand(`pc x: ${Math.floor(waypoint.x)}, y: ${Math.floor(waypoint.y)}, z: ${Math.floor(waypoint.z)} ${info}`);
        }).alignCenter().setBackgroundColor(Renderer.BLUE).setGap(1),
        
        new Button(" §0CO-OP ", () => {
            if (!waypoints[selected_waypoint]) return;
            let waypoint = waypoints[selected_waypoint]?.waypoint;
            let info = waypoints[selected_waypoint]?.info ?? "";
            queueCommand(`cc x: ${Math.floor(waypoint.x)}, y: ${Math.floor(waypoint.y)}, z: ${Math.floor(waypoint.z)} ${info}`);
        }).alignCenter().setBackgroundColor(Renderer.AQUA).setGap(1),
    ).setGap(1),
    
]).setBackgroundColor(Renderer.color(0, 0, 0, 225));
function openSubMenu(id = undefined, mouse_x = undefined, mouse_y = undefined) {
    if (mouse_x !== undefined && mouse_y !== undefined)
    sub_menu.setPosition(mouse_x, mouse_y);
    if (id !== undefined)
        selected_waypoint = id;

    if (selected_waypoint === undefined || !(selected_waypoint in waypoints)) {
        selected_waypoint = undefined;
        return;
    }
    
    sub_menu.content[5].setInput(waypoints[selected_waypoint].info);
    sub_menu.content[7].setBackgroundColor(Renderer.color(
        Math.floor(COLORS[waypoints[selected_waypoint]?.type ?? "SYSTEM"].r * 255), 
        Math.floor(COLORS[waypoints[selected_waypoint]?.type ?? "SYSTEM"].g * 255), 
        Math.floor(COLORS[waypoints[selected_waypoint]?.type ?? "SYSTEM"].b * 255), 85
    ));
}

function updateManagerMenu() {
    let content = [
        new Label("§6§lWaypoint Manager§r\n").alignCenter().setBackgroundColor(Renderer.color(85, 85, 85, 85)),
        new Line(2)
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
        new Line(2),
        new Row(
            new Button("§0ADD", () => { addWaypoint("", Math.floor(Player.getX()), Math.floor(Player.getY()), Math.floor(Player.getZ()), "SYSTEM", "", false, true, 0); }).alignCenter().setBackgroundColor(Renderer.AQUA),
            new Button("§0CLEAR", () => { clearWaypoints(); }).alignCenter().setBackgroundColor(Renderer.RED),
        ),
    );
    manager.setContent(content);
    // selected_waypoint = undefined;
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