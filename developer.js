import { queueCommand } from "./utils/command_queue";
import { timeElapseString, timeElapseStringShort } from "./utils/format";
import { MoveableDisplay } from "./utils/moveable_display";
import { repeatSound } from "./utils/sound";
import { Waypoint } from "./utils/waypoint";

register("command", () => {
    let names = TabList.getNames();
    names.forEach((name, idx) => {ChatLib.chat(`[${idx}] "${name}"`)});
}).setName("gettabnames");

var display = new MoveableDisplay("test", 100, 10);
display.show();

// register("step", () => {
//     Client.showTitle("&c&lTest!!!", "&7testing!", 0, 20, 10);
// }).setDelay(4);
// var waypoint = new Waypoint("drag");
// waypoint.hide();

// register("soundPlay", (position, name, volume, pitch, category, event) => {
//     if (name !== "mob.enderdragon.wings") return;
//     waypoint.setPosition(position.x, position.y, position.z);
//     waypoint.show();
//     let string = `"${name}" - "${category}" - ${position}`;
//     display.lines.push(string);
//     // const index = display.lines.indexOf(string);
//     // if (index > -1) 
//     //     display.lines.splice(index, 1);
//     while (display.lines.length > 10) display.lines.shift();
// });

// register("worldLoad", () => { waypoint.hide(); });

register("guiMouseClick", (x, y, button, gui) => {
    const clicked_item_vanilla = gui?.slotUnderMouse?.func_75211_c();
    if (!clicked_item_vanilla) return;

    const clicked_item = new Item(clicked_item_vanilla)
    ChatLib.chat(`"${clicked_item.getName()}"`);
    display.lines = clicked_item.getLore();
});

register("command", () => {
    World.getAllPlayers().forEach(player => {
        ChatLib.chat(`${player}`);
    })
}).setName("getallplayers");

// §r§c5,665/5,665?  §6§l10ᝐ§r     §a946§a? Defense     §b3,682/3,682? §3780?§r
// §r§c5,665/5,665?  §69ᝐ     §a946§a? Defense     §b3,682/3,682? §3780?§r
// Guild > [MVP+] RawrB0T [S]: voidgameringdenn > for just a random picture5,665/5,665❤  9ᝐ     946❈ Defense     3,682/3,682✎ 780ʬ (33)


/**
 * {
    id: "minecraft:chest",
    Count: 1b,
    tag: {
        display: {
            Lore: ["§7Purchase this chest to receive the", "§7rewards above!", "", "§7Cost", "§9Kuudra Key"],
            Name: "§aOpen Reward Chest"
        }
    },
    Damage: 0s
}
{
    id: "minecraft:chest",
    Count: 1b,
    tag: {
        display: {
            Lore: ["§7Purchase this chest to receive the", "§7rewards above!", "", "§7Cost", "§aThis Chest is Free!"],
            Name: "§aOpen Reward Chest"
        }
    },
    Damage: 0s
}
 */