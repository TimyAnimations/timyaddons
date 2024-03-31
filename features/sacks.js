import { queueCommand } from "../utils/command_queue";
import Settings from "../utils/settings/main"
import DungeonItemSettings from "../utils/settings/dungeon_item";

import { SKYBLOCK_ITEMS, getSkyblockIDFromName } from "../constant/items";
import { Button, GuiMenu, Label } from "../utils/menu_gui";
import { registerContainer, getContainer } from "../utils/skyblock";

var current_container_name = undefined;
var current_container = undefined;
const JAVA_TYPE_CONTAINER_CHEST = Java.type("net.minecraft.inventory.ContainerChest");

var item_content = {};
var item_gui = new GuiMenu(-110, -110);
item_gui.setAnchor(0.5, 0.5);
item_gui.align_x = 1.0;

Settings.registerSetting("Item List In Menu", "guiRender", (mouse_x, mouse_y, gui) => {
    if (!gui || !(gui instanceof Java.type("net.minecraft.client.gui.inventory.GuiContainer") || gui instanceof Java.type("net.minecraft.client.gui.inventory.GuiEditSign"))) 
        return;

    GlStateManager.func_179140_f();
    item_gui.draw(mouse_x, mouse_y);
})
Settings.registerSetting("Item List In Menu", "guiMouseClick", (mouse_x, mouse_y, button) => {
    item_gui.clicked(mouse_x, mouse_y, button);
})
Settings.registerSetting("Item List In Menu", "worldLoad", () => {
    item_content = {};
    item_gui.setContent([]);
})

registerContainer("_", () => {
    let container = getContainer();
    current_container = Player.getContainer();
    current_container_name = container;
    
    if (Settings.crimson_isle_item_message && container == "Fetch") {
        crimsonIsleFetchMessage();
        return;
    }
    if (Settings.garden_visitor_item_message) {
        gardenVisitorMessage();
        return;
    }
});

var last_button = 0;
register("clicked", (mouse_x, mouse_y, button) => {
    last_button = button;
});

Settings.registerSetting("Item List In Menu", "chat", (npc) => {
    let header = `&e[NPC] &r&f${npc.trim()}&7 - &rItems Required:`;
    delete item_content[header];
    setGuiContent();
}).requireArea("Garden")
  .setCriteria("&r&6&lOFFER ACCEPTED &r&8with &r${npc}&r&8(&r${*}&r&8)&r");

function crimsonIsleFetchMessage() {
    if (Settings.verbos) ChatLib.chat("crimsonIsleFetchMessage()");
    
    let item = current_container.getStackInSlot(22);
    if (!item) return;
    
    let name = item.getName();
    let required_items = parseItems(name);
    
    if (required_items.length <= 0 || !/§[0-9a-fk-or][ⓈⒶⒷⒸⒹ] §e/.test(name)) return;

    itemListMessage(`&6Fetch &7- &rItem Required:`, required_items, Settings.crimson_isle_item_message == 2);
}

function gardenVisitorMessage() {
    if (Settings.verbos) ChatLib.chat("gardenVisitorMessage()");

    let item = current_container.getStackInSlot(29);
    if (!item || item.getName() != "§aAccept Offer") return;
    let [required_items, header] = parseItemsFromLore(item);

    itemListMessage(`&e[NPC] &r${current_container.getStackInSlot(13).getName().replace(/§/g, "&").split("(")[0].trim()}&7 - &r${header}:`, required_items, Settings.garden_visitor_item_message == 2);
}

function itemListMessage(header, items, autosack = false) {
    let current_items = [];
    for (let i in items) {
        let item_id = items[i][0];
        
        let item_quantity_current = 0;
        let inventory_items = Player.getInventory().getItems();
        for (let j = 0; j < inventory_items.length; j++) {
            if (!inventory_items[j]) continue;
            
            let slot_item_id = getSkyblockId(inventory_items[j]);
            let slot_item_count = inventory_items[j].getStackSize(); 
            if (slot_item_id == item_id)
            item_quantity_current += slot_item_count;
        }
    
        current_items.push(item_quantity_current);
    }

    let list_string = items.map((item, i) => {
        let item_attributes = SKYBLOCK_ITEMS[item[0]].attributes;
        if (!item_attributes) return "";
        if (!item_attributes.includes("SACK")) return "";
        let item_quantity_required = item[1] ?? 1;
        let item_quantity_current = current_items[i] ?? item_quantity_required;
        let item_quantity_needed = Math.max(0, item_quantity_required - item_quantity_current);
        if (item_quantity_needed === 0) return "";
        return ` ${item[0]} ${item_quantity_needed}`
    }).join("");

    ChatLib.chat( new Message( 
        header ?? "Items:",
        Settings.item_list_show_sack_shortcut && list_string != "" && items.length > 1
            ? new TextComponent(` &b&l[sack all]`).setClick("run_command", `/getlistfromsacks${list_string}`)
            : ""
    ));

    let gui_content = []
    // gui_content.push(new Label((header ?? "Items:") + "\n"));

    var sack_string   = Settings.item_list_compact_shortcuts ? "s" : "sack";
    var bazaar_string = Settings.item_list_compact_shortcuts ? "b" : "bazaar";
    var craft_string  = Settings.item_list_compact_shortcuts ? "c" : "craft";

    for (let i in items) {
        let item_id = items[i][0];
        let item_quantity_required = items[i][1] ?? 1;
        let item_quantity_current = current_items[i] ?? item_quantity_required;
        let item_quantity_needed = Math.max(0, item_quantity_required - item_quantity_current);
        
        let item_name = SKYBLOCK_ITEMS[item_id].name ?? item_id;
        let item_name_colored = SKYBLOCK_ITEMS[item_id].display_name ?? SKYBLOCK_ITEMS[item_id].name ?? item_id;
        let item_craft_list = SKYBLOCK_ITEMS[item_id].craft;
        let item_attributes = SKYBLOCK_ITEMS[item_id].attributes ?? [];

        ChatLib.chat( new Message(
            " ",
            Settings.item_list_show_sack_shortcut 
                ? ( item_attributes.includes("SACK") && item_quantity_needed > 0 
                    ? new TextComponent(`&b&l[${sack_string}]`).setClick("run_command", `/getfromsacks ${item_id} ${item_quantity_needed}`) 
                    : `&8&l[${sack_string}]` )
                : ""
            ,
            Settings.item_list_show_bazaar_shortcut 
                ? ( item_attributes.includes("BAZAAR") && item_quantity_needed > 0 
                    ? new TextComponent(`&a&l[${bazaar_string}]`).setClick("run_command", `/bazaar ${item_name}`) 
                    : `&8&l[${bazaar_string}]` )
                : ""
            ,
            Settings.item_list_show_craft_shortcut 
                ? ( item_craft_list && item_quantity_needed > 0 
                    ? new TextComponent(`&6&l[${craft_string}]`).setClick("run_command", `/viewrecipe ${item_id}`) 
                    : `&8&l[${craft_string}]` )
                : ""
            ,
            `&e ${item_name_colored} &8x${Math.floor(item_quantity_required)}&r`,
            item_quantity_current > 0 
                ? ` &e(need ${item_quantity_needed})` : ""
        ));

        if (Settings.item_list_show_sack_shortcut) {
            gui_content.push(
                item_attributes.includes("SACK") && item_quantity_needed > 0
                    ? new Button(`§0 ${sack_string} §r`, () => { queueCommand(`getfromsacks ${item_id} ${item_quantity_needed}`) }).setBackgroundColor(Renderer.color(85, 255, 255))
                    : new Button(`§0 ${sack_string} §r`, undefined).setBackgroundColor(Renderer.color(85, 85, 85, 127))
            )
        }
        if (Settings.item_list_show_bazaar_shortcut) {
            gui_content.push(
                item_attributes.includes("BAZAAR") && item_quantity_needed > 0
                    ? new Button(`§0 ${bazaar_string} §r`, () => { queueCommand(`bazaar ${item_name}`) }).setBackgroundColor(Renderer.color(85, 255, 85))
                    : new Button(`§0 ${bazaar_string} §r`, undefined).setBackgroundColor(Renderer.color(85, 85, 85, 127))
            )
        }
        if (Settings.item_list_show_craft_shortcut) {
            gui_content.push(
                item_craft_list && item_quantity_needed > 0
                    ? new Button(`§0 ${craft_string} §r`, () => { queueCommand(`viewrecipe ${item_id}`) }).setBackgroundColor(Renderer.color(255, 170, 0))
                    : new Button(`§0 ${craft_string} §r`, undefined).setBackgroundColor(Renderer.color(85, 85, 85, 127))
            )
        }
        gui_content.push( new Label(`&e ${item_name_colored} &8x${Math.floor(item_quantity_required)}&r`) );
        gui_content.push( item_quantity_current > 0 ? new Label(` &e(need ${item_quantity_needed})    \n`).alignRight() : new Label("    \n").alignRight() );
    
        if (autosack && item_attributes.includes("SACK") && item_quantity_needed > 0)
            queueCommand(`getfromsacks ${item_id}`, item_quantity_needed);
    }

    item_content[header ?? "Items:"] = gui_content;
    setGuiContent();
}

function setGuiContent() {
    let gui_content = [];
    let idx = 0;
    for (let header in item_content) {
        const this_header = header;
        if (idx++ > 0)
            gui_content.push(new Label("\n"));
        gui_content.push(new Label(`${header}`));
        gui_content.push(
            new Button("&0 &lX \n", () => {
                delete item_content[this_header];
                setGuiContent();
            }).setBackgroundColor(Renderer.color(255, 85, 85, 190)).alignRight().disableBackgroundFill()
        );
        item_content[header].forEach((element) => {
            gui_content.push(element);
        });
    }
    item_gui.setContent(gui_content);
}

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
    if (last_button == 1 && i < lore.length && /(§7Fill Quiver Cost)/.test(lore[i])) {
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

function getSkyblockId(item) {
    if (!item) return undefined;
    return item.getNBT().toObject()?.tag?.ExtraAttributes?.id;
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

    let item_list = item.craft.map((item) => { return [item[0], item[1] * craft_count]; });
    
    itemListMessage(`&6Materials to craft &e${item.display_name} &7x${craft_count}&r:`, item_list);

}).setName("craftlist").setAliases("cl");

register("command", (arg1, arg2, ...args) => {
    queueCommand(`getfromsacks ${arg1}`, parseInt(arg2) ?? 1);
    for (let i = 0; i < args.length; i += 2) {
        if (args[i])
            queueCommand(`getfromsacks ${args[i]}`, parseInt(args[i + 1]) ?? 1);
    }
}).setName("getlistfromsacks").setAliases("glfs");

function register_trigger_list(name, init_value, trigger_list, is_enabled_function, use_autosack_function, append_triggers = []) {
    triggers = append_triggers;
    trigger_list.forEach((trigger_data) => {
        trigger_data.criterias.forEach((criteria) => {
            Settings.registerSetting(name, "chat", () => {
                itemListMessage(trigger_data.header, trigger_data.items, use_autosack_function());
            }, is_enabled_function).setCriteria(criteria);
        });
    });
};

register_trigger_list(
    "Crimson Isles Required Items List", Settings.crimson_isle_item_message,
    [
        {criterias: ["&e[NPC] &dSirih&f: &rOink.&r"], header: "&e[NPC] &dSirih&7 - &rItem Required:", items: [["SULPHUR_ORE", 1]]},
        {criterias: [
            "&e[NPC] &dPomtair&f: &rAhh...I don't know what I'm going to do...&r",
            "&e[NPC] &dPomtair&f: &rI lost the &fEnchanted Bone Meal&f...of course...&r",
            "&e[NPC] &dPomtair&f: &rAnother day without potatoes...I can't handle it...&r",
            "&e[NPC] &dPomtair&f: &rFeels bad man, this is just terrible.&r",
            "&e[NPC] &dPomtair&f: &rI tried everything...&r",
            "&e[NPC] &dPomtair&f: &r&osob&r"
        ], header: "&e[NPC] &dPomtair&7 - &rItem Required:", items: [["ENCHANTED_BONE_MEAL", 1]]},
        
        {criterias: ["&e[NPC] ${*}&f: &rTo start out I'll need some generic gold to experiment on, could you get me a stack.&r"], 
         header: "&9The Alchemist's Staff &e(1/8)&7 - &rItem Required:", items: [["GOLD_INGOT", 64]]},
        {criterias: ["&e[NPC] ${*}&f: &rNext I need some flat gold to test how reflective gold is, could you try forging gold into 5 of gold plates?&r"], 
         header: "&9The Alchemist's Staff &e(2/8)&7 - &rItem Required:", items: [["GOLDEN_PLATE", 5]]},
        {criterias: ["&e[NPC] ${*}&f: &rI heard there exists a golden helmet that helps you swim faster in water. I would like to test its magical properties, could you bring me one?&r"], 
         header: "&9The Alchemist's Staff &e(3/8)&7 - &rItem Required:", items: [["DIVER_HELMET", 1]]},
        {criterias: ["&e[NPC] ${*}&f: &rIt seems like the first piece you brought me is only 25% of the magical power, could you get me the leggings?&r"], 
         header: "&9The Alchemist's Staff &e(4/8)&7 - &rItem Required:", items: [["DIVER_LEGGINGS", 1]]},
        {criterias: ["&e[NPC] ${*}&f: &rNow I need a lot of compacted gold, it has to be very extremely dense. A half stack should do.&r"], 
         header: "&9The Alchemist's Staff &e(5/8)&7 - &rItem Required:", items: [["ENCHANTED_GOLD_BLOCK", 32]]},
        {criterias: ["&e[NPC] ${*}&f: &rThere is a fine grained gold substance somewhere in the Hub, I'll need 5 of that.&r"], 
         header: "&9The Alchemist's Staff &e(6/8)&7 - &rItem Required:", items: [["GOLDEN_POWDER", 5]]},
        {criterias: ["&e[NPC] ${*}&f: &rNext I'm going to need a vegetable that is made out of solid gold. I want to experiment with how gold interacts with organics, maybe you can find some, like a half stack?&r"], 
         header: "&9The Alchemist's Staff &e(7/8)&7 - &rItem Required:", items: [["ENCHANTED_GOLDEN_CARROT", 32]]},
        {criterias: ["&e[NPC] ${*}&f: &rI just need one last thing, there's an extremely dangerous scientist who sells an assortment of items, he has a special rounded type of gold. Try to convince him to sell you it.&r"], 
         header: "&9The Alchemist's Staff &e(8/8)&7 - &rItem Required:", items: [["GOLDEN_BALL", 1]]}
    ],
    (value) => value >= 1,
    () => Settings.crimson_isle_item_message == 2
);

const GOBLIN_EGG_LIST = ["GOBLIN_EGG", "GOBLIN_EGG_GREEN", "GOBLIN_EGG_RED", "GOBLIN_EGG_BLUE", "GOBLIN_EGG_YELLOW"];
var amber_crystal_items = [[GOBLIN_EGG_LIST[Settings.crystal_hollows_prefered_goblin_egg], 3]];
Settings.registerListener("Crystal Hollows Preferred Goblin Egg", (prefered_goblin_egg) => {
    amber_crystal_items[0][0] = GOBLIN_EGG_LIST[prefered_goblin_egg];
});
register_trigger_list(
    "Crystal Hollows Required Items List", Settings.crystal_hollows_item_message,
    [
        {criterias: [
            "&e[NPC] Professor Robot&f: &rBring me all &a6 &rkey components to the giant so that I can repair it!&r",
            "&e[NPC] Professor Robot&f: &rThat's not one of the components I need! Bring me one of the missing components:&r"
        ], 
         header: "&bSapphire Crystal&7 - &rItems Required:", items: [
            ["FTX_3070", 1], ["SUPERLITE_MOTOR", 1], ["CONTROL_SWITCH", 1], 
            ["ELECTRON_TRANSMITTER", 1], ["ROBOTRON_REFLECTOR", 1], ["SYNTHETIC_HEART", 1]
        ]},
        
        {criterias: ["&e[NPC] &bKalhuiki Door Guardian&f: &rThis temple is locked, you will need to bring me a key to open the door!&r"], 
         header: "&5Amethyst Crystal&7 - &rItems Required:", items: [["JUNGLE_KEY", 1]]},
        
         {criterias: [
            "&e[NPC] &6King Yolkar&f: &rBring me back &a3 &9Goblin Egg &rof any type and we can teach her a lesson!&r",
            "&e[NPC] &6King Yolkar&f: &rThat is certainly not the meal I am looking for! Bring me back some &9Goblin Egg &rand you will satiate my hunger.&r",
            "&e[NPC] &6King Yolkar&f: &rWhere are those &a3 &9Goblin Egg&r? My Chef is waiting!&r",
            "&e[NPC] &6King Yolkar&f: &rBring me &a3 &rof any type of &9Goblin Egg &rand we can show the &5Goblin Queen &rwhat it's like to lose something she loves!&r"
        ], 
         header: "&6Amber Crystal&7 - &rItems Required:", items: amber_crystal_items}
    ],
    (value) => value >= 1,
    () => Settings.crystal_hollows_item_message == 2
);

var last_item = undefined;

Settings.registerSetting("NPC Shops Required Items", "itemTooltip", (lore, item) => {
    if (last_item && last_item.getName() == item.getName()) return;
    last_item = item;
});

Settings.registerSetting("NPC Shops Required Items", "chat", (event) => {
    if (!last_item) return;
    
    let [required_items, header] = parseItemsFromLore(last_item);
    if (required_items.length <= 0) return;
    
    itemListMessage(`${last_item.getName()}&7 - &r${header}:`, required_items, Settings.shop_item_message == 2);
    cancel(event);
}).setCriteria("&r&cYou don't have the required items!&r");


function dungeonItemMessage(autosack = false) {
    const DUNGEON_ITEMS = [
        ["SPIRIT_LEAP", DungeonItemSettings.dungeon_item_SPIRIT_LEAP ?? 0],
        ["DUNGEON_DECOY", DungeonItemSettings.dungeon_item_DUNGEON_DECOY ?? 0],
        ["ENDER_PEARL", DungeonItemSettings.dungeon_item_ENDER_PEARL ?? 0],
        ["SUPERBOOM_TNT", DungeonItemSettings.dungeon_item_SUPERBOOM_TNT ?? 0],
        ["INFLATABLE_JERRY", DungeonItemSettings.dungeon_item_INFLATABLE_JERRY ?? 0],
        ["DUNGEON_TRAP", DungeonItemSettings.dungeon_item_DUNGEON_TRAP ?? 0],
        ["DUNGEON_CHEST_KEY", DungeonItemSettings.dungeon_item_DUNGEON_CHEST_KEY ?? 0],
    ];
    itemListMessage("&6Dungeon Sack&r:", 
                     DUNGEON_ITEMS.filter((item) => item[1] > 0), 
                     autosack);
}

function kuudraItemMessage(autosack = false) {
    const KUUDRA_ITEMS = [
        ["ENDER_PEARL", DungeonItemSettings.dungeon_item_ENDER_PEARL ?? 0]
    ];
    itemListMessage("&6Kuudra Sack&r:", 
                     KUUDRA_ITEMS.filter((item) => item[1] > 0), 
                     autosack);
}

var entering = undefined;

Settings.registerSetting("Dungeon Sack Items List &8- &7&o/dungeonsack, /ds&r", "chat", (type, floor) => {
    entering = type;
}).setCriteria("&9&m-----------------------------\n&r${*}&r&f &r&eentered &r${type}&r&e, &r${floor}&r&e!\n&r&9&m-----------------------------&r");
Settings.registerSetting("Dungeon Sack Items List &8- &7&o/dungeonsack, /ds&r", "worldLoad", () => {
    if (!entering) return;

    if (entering == "&cKuudra's Hollow") setTimeout(() => {
        kuudraItemMessage(DungeonItemSettings.dungeon_item_message == 2);
    }, 4_500);
    else setTimeout(() => {
        dungeonItemMessage(DungeonItemSettings.dungeon_item_message == 2);
    }, 4_500);

    entering = undefined;
});


register("command", (arg1, arg2, ...args) => {
    dungeonItemMessage(arg1 && arg1.toLowerCase() == "true");
}).setName("dungeonsack").setAliases("ds");