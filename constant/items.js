export const SKYBLOCK_ITEMS = JSON.parse(FileLib.read("TimyAddons", "./constant/items.json"));

export function getSkyblockIDFromName(name) {
    name = name.toUpperCase()
    for (let id in SKYBLOCK_ITEMS) {
        if (SKYBLOCK_ITEMS[id].name.toUpperCase() == name)
            return id;
    }
    return undefined;
}

