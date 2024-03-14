import Settings from "../../utils/settings/main";
import { queueCommand } from "../../utils/command_queue";
import { registerArea, registerContainer } from "../../utils/skyblock";
import { timeElapseStringShort, timeElapseStringShortSingleUnit } from "../../utils/format";
import { MoveableGui } from "../../utils/moveable_gui";

// plot minimap
var plot_map_tile_size = Settings.garden_plot_minimap_tile_size + 1;

const PLOT_ITEM_INDEXS = [
    [ 2,  3,  4,  5,  6],
    [11, 12, 13, 14, 15],
    [20, 21, 22, 23, 24],
    [29, 30, 31, 32, 33],
    [38, 39, 40, 41, 42]
];

const PLOT_NUMBERS = [
    [21, 13, 9 , 14, 22],
    [15, 5 , 1 , 6 , 16],
    [10, 2 , 0 , 3 , 11],
    [17, 7 , 4 , 8 , 18],
    [23, 19, 12, 20, 24]
];

var plot_pest_counts = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
];
var plot_spray_time = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
];
var plots_infected = Array(24).fill(false);

var plot_map_player_size = 0.70;
var plot_map_player_image = new Image("map_icon.png", "https://i.imgur.com/mwpjgRz.png");

const IMPORT_NAME = "TimyAddons/data"
const PLOT_NAMES_FILE = "plot_names.json"
let plot_names_file = FileLib.exists(IMPORT_NAME, PLOT_NAMES_FILE) 
                        ? FileLib.read(IMPORT_NAME, PLOT_NAMES_FILE)
                        : undefined;
let saved_data = {};
if (plot_names_file)
    saved_data = JSON.parse(plot_names_file);
var plot_names = saved_data.names ?? [
    ["21", "13", "9"   , "14", "22"],
    ["15", "5" , "1"   , "6" , "16"],
    ["10", "2" , "Barn", "3" , "11"],
    ["17", "7" , "4"   , "8" , "18"],
    ["23", "19", "12"  , "20", "24"]
];
var plot_display_names = plot_names;

var visitor_count = 0;
var visitor_time = "";

function updateVisitorCount() {
    if (!TabList) return;
    let names = TabList.getNames();
    if (!names) return;

    let visitor_idx = 20;
    for (; !names[visitor_idx]?.startsWith("§r§b§lVisitors: §r§f(") && visitor_idx < names.length; visitor_idx++);

    if (visitor_idx === names.length) return;
    if (!names[visitor_idx]?.startsWith("§r§b§lVisitors: §r§f(")) return;

    const count = parseInt( names[visitor_idx].replace(/(§r§b§lVisitors: §r§f\(|\)§r)/g, "") );
    if (isNaN(count)) return;

    visitor_count = count;
    // for (i = visitor_idx + 1; i < visitor_idx + 6; i++) {
    //     if (names[i] !== "§r")  {
    //         visitor_count++;
    //     }
    // }
}

function updateVisitorTime() {
    if (!TabList) return;
    let names = TabList.getNames();
    if (!names) return;
    
    let visitor_idx = 20;
    for (; !names[visitor_idx]?.startsWith("§r Next Visitor: §r§b") && visitor_idx < names.length; visitor_idx++);
    
    if (visitor_idx === names.length) return;
    if (!names[visitor_idx]?.startsWith("§r Next Visitor: §r§b")) return;
    
    let time_remaining = names[visitor_idx].replace(/(§r Next Visitor: §r§b|§r)/g, "");
    if (time_remaining === "§r§c§lQueue Full!§r§f") return;
    visitor_time = 
        plot_map_tile_size < 40 ? time_remaining.split(" ")[0] : time_remaining
}

function updateInfectedPlots() {
    if (!TabList) return;
    let names = TabList.getNames();
    if (!names) return;
    
    plots_infected = Array(24).fill(false);
    let idx = 20;
    for (; !names[idx]?.startsWith("§r Infested Plots: ") && idx < names.length; idx++);
    
    if (idx === names.length) return;
    if (!names[idx]?.startsWith("§r Infested Plots: ")) return;

    names[idx].match(/§r§b\d*§r/g)?.map((string) => {
        let plot_idx = parseInt( string.replace(/(§r§b|§r)/g, "") );
        if (isNaN(plot_idx)) return;
        plots_infected[plot_idx] = true;
    });
}

Settings.registerSetting("Plot Minimap", "step", () => {
    updateVisitorCount();
    updateVisitorTime();
    updateInfectedPlots();
}).requireArea("Garden").setFps(1);

Settings.registerSetting("Plot Minimap", "chat", () => {
    visitor_count++;
    setTimeout(() => { updateVisitorCount(); }, 5_000);
}).setCriteria("&r${*}&r&ehas arrived on your &r&bGarden&r&e!&r");

Settings.registerSetting("Plot Minimap", "chat", () => {
    visitor_count--;
    setTimeout(() => { updateVisitorCount(); }, 5_000);
}).setCriteria("&r&6&lOFFER ACCEPTED &r&8with &r${*}&r&8(&r${*}&r&8)&r");

function trimPlotDisplayNames() {
    plot_display_names = plot_names;
    plot_display_names = plot_display_names.map((row) => row.map((name) => {
        while (Renderer.getStringWidth(name) > plot_map_tile_size - 2)
            name = name.slice(0, -1);
        return name;
    }) );
}
trimPlotDisplayNames();

Settings.addAction("Plot Minimap Tile Size", (value) => {
    plot_map_tile_size = value + 1;
    timeString = plot_map_tile_size < 40 ? timeElapseStringShortSingleUnit : timeElapseStringShort;
    trimPlotDisplayNames();
    plot_minimap_gui.setWidth( plot_map_tile_size * 5 + 1 );
    plot_minimap_gui.setHeight( plot_map_tile_size * 5 + ( Settings.garden_plot_minimap_extra_info ? 12 : 1 ) );
});

Settings.addAction("Plot Minimap Extra Info", () => {
    plot_minimap_gui.setWidth( plot_map_tile_size * 5 + 1 );
    plot_minimap_gui.setHeight( plot_map_tile_size * 5 + ( Settings.garden_plot_minimap_extra_info ? 12 : 1 ) );
})

var timeString = plot_map_tile_size < 40 ? timeElapseStringShortSingleUnit : timeElapseStringShort;

registerContainer("Configure Plots", () => {
    for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) {
        if (x === 2 && y === 2) continue;
        let item = Player.getContainer().getStackInSlot(PLOT_ITEM_INDEXS[y][x]);
        if (!item) continue;
        let name = item.getName();
        if (name.startsWith("§aPlot §7- §b")) {
            plot_names[y][x] = name.slice("§aPlot §7- §b".length).replace(/(§[0-9a-fk-or])/g, "");
        }

        plot_pest_counts[y][x] = 0;
        let lore = item.getNBT().toObject()?.tag?.display?.Lore ?? [];
        lore.forEach((line) => {
            if (line.startsWith("§4§lൠ §cThis plot has §6")) {
                plot_pest_counts[y][x] = parseInt(line.slice("§4§lൠ §cThis plot has §6".length).split(" ")[0]);
            }
        });
    }
    trimPlotDisplayNames();
    FileLib.write(IMPORT_NAME, PLOT_NAMES_FILE, JSON.stringify({names: plot_names}));
})

function plotCoordinate(x, z) {
    return {
        x: Math.floor( (x + 240) * 5 / 480 ),
        y: Math.floor( (z + 240) * 5 / 480 )
    }
}

const PEST_SPAWN_AMOUNT = {
    "GROSS": 1,
    "EWW": 2,
    "YUCK": 3
}

Settings.registerSetting("Plot Minimap", "chat", (prefix, plot) => {
    for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) {
        if (plot_names[y][x] === plot) {
            plot_pest_counts[y][x] += PEST_SPAWN_AMOUNT[prefix];
            return;
        }
    }
}).setCriteria("&r&6&l${prefix}! ${*} &7${*} in &aPlot &7- &b${plot}&7!&r")
  .requireArea("Garden");

Settings.registerSetting("Plot Minimap", "entityDeath", (entity) => {
    if (!entity) return;
    if (!(entity.entity instanceof Java.type("net.minecraft.entity.monster.EntitySilverfish") || 
          entity.entity instanceof Java.type("net.minecraft.entity.passive.EntityBat")))
    {
        return;
    }
    let plot_coords = plotCoordinate(entity.getX(), entity.getZ());
    let x = plot_coords.x;
    let y = plot_coords.y;
    if (plot_pest_counts[y][x] > 0)
        plot_pest_counts[y][x]--;
    if (plot_pest_counts[y][x] == 0)
        plots_infected[PLOT_NUMBERS[y][x]] = false;

}).requireArea("Garden");

var plot_minimap_gui = new MoveableGui("plot_minimap", (x, y, size_x, size_y, buttons_only = false, plot_x = undefined, plot_y = undefined) => {
    Renderer.drawRect(Renderer.color(0, 0, 0, buttons_only ? 255 : 127), 0, 0, plot_map_tile_size * 5 + 1, 
        plot_map_tile_size * 5 + ( Settings.garden_plot_minimap_extra_info || buttons_only ? 12 : 1 ) );
    const current_time = Date.now();
    for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) {
        if (plot_x === x && plot_y === y)
            Renderer.drawRect(Renderer.color(127, 127, 127, 127), (x * plot_map_tile_size) + 1, (y * plot_map_tile_size) + 1, plot_map_tile_size - 1, plot_map_tile_size - 1);
        Renderer.drawRect(Renderer.color(127, 127, 127, 127), (x * plot_map_tile_size) + 1, (y * plot_map_tile_size) + 1, plot_map_tile_size - 1, plot_map_tile_size - 1);
        Renderer.drawString(plot_display_names[y][x], (x * plot_map_tile_size) + 2, (y * plot_map_tile_size) + 2);
        if (x === 2 && y === 2) {
            if (visitor_count > 0) {
                Renderer.drawString(`&a☻ &rx${visitor_count}`, (x * plot_map_tile_size) + 2, (y * plot_map_tile_size) + (plot_map_tile_size / 2 - 5) + 1.5);
            }
            if (visitor_count < 5) {
                Renderer.drawString(`&b${visitor_time}`, 
                    (x * plot_map_tile_size) + 2, (y * plot_map_tile_size) + (plot_map_tile_size - 10) + 1
                );
                }
            else {
                Renderer.drawString(`&c&lFULL`, 
                    (x * plot_map_tile_size) + 2, (y * plot_map_tile_size) + (plot_map_tile_size - 10) + 1
                );
            }
        }
        else {
            if (plot_pest_counts[y][x] > 0) {
                Renderer.drawString(`&cൠ &rx${plot_pest_counts[y][x]}`, (x * plot_map_tile_size) + 2, (y * plot_map_tile_size) + (plot_map_tile_size / 2 - 5) + 1.5);
            }
            else if (plots_infected[PLOT_NUMBERS[y][x]]) {
                Renderer.drawString(`&cൠ &7x?`, (x * plot_map_tile_size) + 2, (y * plot_map_tile_size) + (plot_map_tile_size / 2 - 5) + 1.5);
            }
            if (current_time - plot_spray_time[y][x] < 1_800_000) {
                Renderer.drawString(`&6${timeString(1_800_000 - (current_time - plot_spray_time[y][x]))}`, 
                    (x * plot_map_tile_size) + 2, (y * plot_map_tile_size) + (plot_map_tile_size - 10) + 1
                );
            }
        }
    }
    if (buttons_only) {
        Renderer.drawString(`Click plot to teleport!`, 1, plot_map_tile_size * 5 + 2);
        return;
    }
    let plot_coords = plotCoordinate(Player.getX(), Player.getZ());
    if (Settings.garden_plot_minimap_extra_info) {
        Renderer.drawString(`Yaw/Pitch: ${Player.getYaw().toFixed(4)} / ${Player.getPitch().toFixed(4)}`, 1, plot_map_tile_size * 5 + 2);
    }
    let player_x = (Player.getX() + 240) / 480;
    player_x = player_x < 0 ? 0 : player_x > 1 ? 1 : player_x;
    let player_y = (Player.getZ() + 240) / 480;
    player_y = player_y < 0 ? 0 : player_y > 1 ? 1 : player_y;
    Renderer.translate(
        player_x * plot_map_tile_size * 5,
        player_y * plot_map_tile_size * 5
    )
    Renderer.rotate(Player.getYaw() + 180);
    Renderer.scale(plot_map_player_size);

    plot_map_player_image.draw(-(plot_map_player_image.getTextureWidth()/2), -(plot_map_player_image.getTextureHeight()/2));
}, 100, 10, plot_map_tile_size * 5 + 1, plot_map_tile_size * 5 + ( Settings.garden_plot_minimap_extra_info ? 12 : 1 ));

Settings.registerSetting("Plot Minimap", "renderOverlay", () => {
    plot_minimap_gui.draw();
}).requireArea("Garden");

Settings.registerSetting("Plot Minimap", "guiRender", (x, y, gui) => {
    if (!Settings.garden_plot_minimap_teleport_shortcut) return;
    if (!gui || !(gui instanceof Java.type("net.minecraft.client.gui.inventory.GuiContainer"))) 
        return;
    
    GlStateManager.func_179140_f();
    
    let relative_pos = plot_minimap_gui.getRelativePos(x, y);
    let plot_x = Math.floor(relative_pos.x / plot_map_tile_size);
    let plot_y = Math.floor(relative_pos.y / plot_map_tile_size);
    plot_minimap_gui.draw(true, plot_x, plot_y);
    // if (plot_x >= 0 && plot_x < 5 && plot_y >= 0 && plot_y < 5)
    // else
    //     plot_minimap_gui.draw(true, plot_x, plot_y);

}).requireArea("Garden");

Settings.registerSetting("Plot Minimap", "guiMouseClick", (x, y, button, gui) => {
    if (!Settings.garden_plot_minimap_teleport_shortcut) return;
    if (!gui || !(gui instanceof Java.type("net.minecraft.client.gui.inventory.GuiContainer"))) 
        return;
    if (Math.abs( Renderer.screen.getWidth() / 2 - x ) < 90 && Math.abs( Renderer.screen.getHeight() / 2 - y ) < 85)
        return;
    let relative_pos = plot_minimap_gui.getRelativePos(x, y);
    let plot_x = Math.floor(relative_pos.x / plot_map_tile_size);
    let plot_y = Math.floor(relative_pos.y / plot_map_tile_size);
    if (plot_x >= 0 && plot_x < 5 && plot_y >= 0 && plot_y < 5)
        queueCommand(`plotteleport ${plot_names[plot_y][plot_x]}`);
}).requireArea("Garden");

Settings.registerSetting("Plot Minimap", "chat", (plot, material) => {
    const plot_coords = plotCoordinate(Player.getX(), Player.getZ());
    if (plot_names[plot_coords.y][plot_coords.x] !== plot) {
        ChatLib.chat(`"${plot_names[plot_coords.y][plot_coords.x]}" "${plot}"`);
    }

    plot_spray_time[plot_coords.y][plot_coords.x] = Date.now();
}).setCriteria("&r&a&lSPRAYONATOR! &r&7You sprayed &r&aPlot &r&7- &r&b${plot} &r&7with &r&a${material}&r&7!&r")
  .requireArea("Garden");

Settings.garden_plot_minimap_open_gui = () => {
    plot_minimap_gui.edit();
};