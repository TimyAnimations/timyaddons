import Settings from "../utils/settings/main";
import { SKYBLOCK_ITEMS, getSkyblockIDFromName } from "../constant/items";
import { MoveableGui } from "../utils/moveable_gui";

var item_lists = [];
var item_list_gui = new MoveableGui("item_list", (x, y, scale_x, scale_y) => {
    Renderer.drawRect(Renderer.color(0, 0, 0, 127), 0, 0, 250, 250);
    item_lists.forEach((list) => {
        Renderer.drawString(`${list.title} &7x${list.count}`, 1, 1);
        Renderer.translate(0, 10);
        list.items.forEach((item) => {
            Renderer.drawString(`     ${SKYBLOCK_ITEMS[item[0]]?.display_name ?? item[0]} &7x${item[1] * list.count}`, 1, 1);
            Renderer.translate(0, 10);
        })
    })
}, 100, 50, 250, 250);

register("renderOverlay", () => {
    item_list_gui.draw();
});

register("guiRender", (x, y, gui) => {
    if (!Settings.garden_plot_minimap_teleport_shortcut) return;
    if (!gui || !(gui instanceof Java.type("net.minecraft.client.gui.inventory.GuiContainer"))) 
        return;
    
    GlStateManager.func_179140_f();
    
    item_list_gui.draw();
    // let relative_pos = item_list_gui.getRelativePos(x, y);
    // let plot_x = Math.floor(relative_pos.x / plot_map_tile_size);
    // let plot_y = Math.floor(relative_pos.y / plot_map_tile_size);
});

register("command", () => {
    item_list_gui.edit();
}).setName("moveitemlist");

function parseItemsFromLore(item) {
    if (!item) return [];
    let lore = item.getNBT().toObject()?.tag?.display?.Lore ?? [];

    let i = 0;

    for (; i < lore.length && !/(§7Items Required:|§7Cost|§7Upgrade Cost:)/.test(lore[i]); i++);
    i++;
    let item_section_start = i < lore.length ? i : 0;
    for (; i < lore.length && lore[i] != ""; i++);
    let item_section_end = i;

    i++;
    if (Utils.last_button == 1 && i < lore.length && /(§7Fill Quiver Cost)/.test(lore[i])) {
        i++;
        item_section_start = i;
        for (; i < lore.length && lore[i] != ""; i++);
        item_section_end = i;
    }
    
    if (Settings.verbos)
        ChatLib.chat(`start:${item_section_start} end:${item_section_end}`);
    
    let item_section = lore.slice(item_section_start, item_section_end).join("\n");
    return [parseItems(item_section), item_section_start != 0 ? lore[item_section_start - 1]?.replace(/(§[0-9a-fk-or]|:)/g, "") : "Items Required"];
}

function parseItems(string) {
    if (!string || string == "") return [];

    if (Settings.verbos) ChatLib.chat(string);
    
    let matches = string.match(/§[0-9a-fk-or][^§(]+(?= §8x| \(|x §|$)/gm);
    
    let items = matches.reduce((accum, match) => {
        if (/§8x[\d,]+/.test(match)) {
            if (accum[accum.length - 1][0])
                accum[accum.length - 1][1] = parseInt(match.slice(3).replace(/,/g, "")) ?? 1;
            return accum;
        }
        if (/§8[\d,]+/.test(match)) {
            accum.push(parseInt(match.slice(2).replace(/,/g, "")) ?? 1);
            return accum;
        }
        
        let count = 1;
        if (typeof accum[accum.length - 1] == 'number') {
            count = accum.pop();
        }
        
        let name_colored = match.trim();
        let name = name_colored.replace(/§[0-9a-fk-or]/g, "");
        let id = getSkyblockIDFromName(name);
        accum.push([id, count]);
        return accum;
    }, []).filter((item) => item[0]);

    return items;
}

register("command", (arg1, arg2, ...args) => {
    if (!arg1) {
        ChatLib.chat("&cMissing arguments! Usage: /craftlist <name/id> <amount>");
        return;
    }
    
    if (!(arg1 in SKYBLOCK_ITEMS)) {
        ChatLib.chat("&cCouldn't find an item with this name or identifier!");
        return;
    }
    let item = SKYBLOCK_ITEMS[arg1];

    if (!item.craft) {
        ChatLib.chat(`&cCouldn't find needed crafting materials for &6${item.display_name ?? arg1}&c!`);
        return;
    }

    let craft_count = arg2 ? parseInt(arg2) : 1;
    if (!craft_count) craft_count = 1;

    item_lists.push({title: `&6Materials to craft &e${item.display_name}`, items: item.craft, count: craft_count});

    // let item_list = item.craft.map((item) => { return [item[0], item[1] * craft_count]; });
    
    // itemListMessage(`&6Materials to craft &e${item.display_name} &7x${craft_count}&r:`, item_list);

}).setName("craftlist").setAliases("cl");

