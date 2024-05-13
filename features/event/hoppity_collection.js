import Settings from "../../utils/settings/main"
import { MoveableDisplay } from "../../utils/moveable_display";
import { getClosedContainer, getContainer, registerCloseContainer, registerContainer, requireContainer } from "../../utils/skyblock";

var collection_display = new MoveableDisplay("chocolate_factory_rabbit_collection");
export function getChocolateFactoryCollectionDisplay() {
    return collection_display;
}

Settings.addAction("Hoppity's Collection Tracker GUI", (value) => {
    if (value)
        collection_display.show();
    else
        collection_display.hide();
})
if (Settings.event_chocolate_egg_collection_gui)
    collection_display.show();
else
    collection_display.hide();

Settings.event_chocolate_egg_collection_open_gui = () => {
    collection_display.edit();
};

if (!collection_display.persistent_data) {
    collection_display.persistent_data = {
        rabbits: JSON.parse(FileLib.read("TimyAddons/constant", "rabbits.json")) ?? {},
        rarity_counts: {
            "TOTAL": 0,
            "COMMON": 0,
            "UNCOMMON": 0,
            "RARE": 0,
            "EPIC": 0,
            "LEGENDARY": 0,
            "MYTHIC": 0
        },
        rarity_dupes: {
            "TOTAL": 0,
            "COMMON": 0,
            "UNCOMMON": 0,
            "RARE": 0,
            "EPIC": 0,
            "LEGENDARY": 0,
            "MYTHIC": 0
        },
        rarity_max: {
            "TOTAL": 0,
            "COMMON": 0,
            "UNCOMMON": 0,
            "RARE": 0,
            "EPIC": 0,
            "LEGENDARY": 0,
            "MYTHIC": 0
        }
    };
    collection_display.save();
}

updateRarityCount();
updateCollectionDisplay();

registerContainer("_", () => {
    if (!Settings.event_chocolate_timer) return;
    
    let container = getContainer();
    
    if (!container || !container.includes("Hoppity's Collection")) {
        if (container === "Chocolate Factory") {
            menu_trigger.register();
        }
        return;
    }

    let found = 0;
    Player?.getContainer()?.getItems()?.forEach((item, idx) => {
        if (idx < 9 || idx % 9 === 0 || idx % 9 === 8 || idx > 44) return;
        if (!item || (item.getID() !== 397 && item.getID() !== 351)) return;
        const name = item.getName();
        
        let count = item.getID() === 397 ? 1 + getCountFromLore(item) : 0;
        found++;
        collection_display.persistent_data.rabbits[name] = count;
    });

    updateRarityCount();
    updateCollectionDisplay();
    menu_trigger.register();
});
registerCloseContainer("_", () => {
    let container = Player.getContainer()?.getName();
    if (!container || (!container.includes("Hoppity's Collection") && container !== "Chocolate Factory"))
        menu_trigger.unregister();
})

function getCountFromLore(item) {
    if (!item) return 0;
    let lore = item.getNBT().toObject()?.tag?.display?.Lore ?? [];
    let i = 0;
    for (; i < lore.length && !/§7Duplicates Found: §a[\d,.]/.test(lore[i]); i++);
    if (i == lore.length) return 0;
    
    const count = parseInt(lore[i]?.replace(/(§7Duplicates Found: §a|,)/g, ""));
    return isNaN(count) ? 0 : count;
}

function updateRarityCount() {
    let counts = {
        "TOTAL": 0,
        "COMMON": 0,
        "UNCOMMON": 0,
        "RARE": 0,
        "EPIC": 0,
        "LEGENDARY": 0,
        "MYTHIC": 0
    };
    let dupes = {
        "TOTAL": 0,
        "COMMON": 0,
        "UNCOMMON": 0,
        "RARE": 0,
        "EPIC": 0,
        "LEGENDARY": 0,
        "MYTHIC": 0
    };
    let max = {
        "TOTAL": 0,
        "COMMON": 0,
        "UNCOMMON": 0,
        "RARE": 0,
        "EPIC": 0,
        "LEGENDARY": 0,
        "MYTHIC": 0
    };

    Object.entries(collection_display.persistent_data.rabbits)?.forEach(([name, count]) => {
        max["TOTAL"] += 1;
        if (count > 0) {
            counts["TOTAL"] += 1;
            dupes["TOTAL"] += count - 1;
        }
        switch (name.slice(0, 2)) {
            case "§f":
                max["COMMON"] += 1;
                if (count > 0) {
                    counts["COMMON"] += 1;
                    dupes["COMMON"] += count - 1;
                }
                break;
            case "§a":
                max["UNCOMMON"] += 1;
                if (count > 0) {
                    counts["UNCOMMON"] += 1;
                    dupes["UNCOMMON"] += count - 1;
                }
                break;
            case "§9":
                max["RARE"] += 1;
                if (count > 0) {
                    counts["RARE"] += 1;
                    dupes["RARE"] += count - 1;
                }
                break;
            case "§5":
                max["EPIC"] += 1;
                if (count > 0) {
                    counts["EPIC"] += 1;
                    dupes["EPIC"] += count - 1;
                }
                break;
            case "§6":
                max["LEGENDARY"] += 1;
                if (count > 0) {
                    counts["LEGENDARY"] += 1;
                    dupes["LEGENDARY"] += count - 1;
                }
                break;
            case "§d":
                max["MYTHIC"] += 1;
                if (count > 0) {
                    counts["MYTHIC"] += 1;
                    dupes["MYTHIC"] += count - 1;
                }
                break;
            // default:
                // ChatLib.chat(`UNKNOWN: ${name}`);
        }
    });

    collection_display.persistent_data.rarity_counts = counts;
    collection_display.persistent_data.rarity_dupes = dupes;
    collection_display.persistent_data.rarity_max = max;
    collection_display.save();
}

function updateCollectionDisplay() {
    collection_display.clearLines();
    let display_lines = [];
    
    const counts = collection_display.persistent_data.rarity_counts;
    const dupes = collection_display.persistent_data.rarity_dupes;
    const max = collection_display.persistent_data.rarity_max;
    
    display_lines.push("&a&lHoppity's Collection:");
    [["TOTAL", "&bTOTAL"], ["COMMON", "&fCOMMON"], ["UNCOMMON", "&aUNCOMMON"], 
     ["RARE", "&9RARE"], ["EPIC", "&5EPIC"], ["LEGENDARY", "&6LEGENDARY"], ["MYTHIC", "&dMYTHIC"]]
    .forEach(([rarity, label]) => {
        let line = ` ${label}: &a${counts[rarity]}&7/&a${max[rarity]}`
        if (dupes[rarity] > 0) {
            line += ` &e(${dupes[rarity]} Dupes)`;
        }
        display_lines.push(line);
    });

    collection_display.addLine(...display_lines);
}

var menu_trigger = Settings.registerSetting("Hoppity's Collection Tracker", "guiRender", () => {
    const [center_x, center_y] = [(Renderer.screen.getWidth() / 2), (Renderer.screen.getHeight() / 2)];
    Renderer.retainTransforms(true);
    Renderer.translate(center_x - 110 - collection_display.width, center_y - 110);
    collection_display.draw_func(center_x - 110 - collection_display.width, center_y - 110, 1, 1);
    Renderer.retainTransforms(false);
});
menu_trigger.unregister();

Settings.registerSetting("Hoppity's Collection Tracker", "chat", (rabbit) => {
    rabbit = rabbit.replace(/&/g, "§");
    if (rabbit in collection_display.persistent_data.rabbits) {
        collection_display.persistent_data.rabbits[rabbit] += 1;
    }
    else {
        collection_display.persistent_data.rabbits[rabbit] = 1;
    }

    updateRarityCount();
    updateCollectionDisplay();
}).setCriteria("&r${*}HOPPITY'S HUNT &7You found ${rabbit} &7(${*})!&r");