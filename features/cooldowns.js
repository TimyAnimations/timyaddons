import { parseTimeString, timeElapseStringShortSingleUnit } from "../utils/format";
import { MoveableDisplay } from "../utils/moveable_display";
import Settings from "../utils/settings/main";

const cooldown_display = new MoveableDisplay("cooldown_display");
cooldown_display.hide();

Settings.addAction("Ability Cooldown Display", (value) => {
    if (!value)
        cooldown_display.hide();
})
Settings.combat_cooldown_display_open_gui = () => {
    cooldown_display.edit();
};
export function getCooldownDisplay() {
    return cooldown_display;
}
const cooldowns = {};

Settings.registerSetting("Ability Cooldown Display", "playerInteract", () => {
    const item = Player.getHeldItem();
    if (!item) return;

    const lore = item.getNBT().toObject()?.tag?.display?.Lore ?? [];
    
    let i = 0;
    for (; i < lore.length && !/§6Ability: (.*)  §e§lRIGHT CLICK/.test(lore[i]); i++);
    if (i === lore.length) return;

    const ability = lore[i].replace(/§6Ability: (.*)  §e§lRIGHT CLICK/, "$1");

    for (; i < lore.length && !/§8Cooldown: §a(\d+)s/.test(lore[i]); i++);
    if (i === lore.length) return;

    const cooldown = parseInt(lore[i].replace(/§8Cooldown: §a(\d+)s/, "$1"));
    const now = Date.now()

    if (cooldowns[ability] && cooldowns[ability] >= now)
        return;

    cooldowns[ability] = now + (cooldown * 1_000);
});

Settings.registerSetting("Ability Cooldown Display", "clicked", (x, y, button) => {
    if (button !== 0) return;

    const item = Player.getHeldItem();
    if (!item) return;

    const lore = item.getNBT().toObject()?.tag?.display?.Lore ?? [];
    
    let i = 0;
    for (; i < lore.length && !/§6Ability: (.*)  §e§lLEFT CLICK/.test(lore[i]); i++);
    if (i === lore.length) return;

    const ability = lore[i].replace(/§6Ability: (.*)  §e§lLEFT CLICK/, "$1");

    for (; i < lore.length && !/§8Cooldown: §a(\d+)s/.test(lore[i]); i++);
    if (i === lore.length) return;

    const cooldown = parseInt(lore[i].replace(/§8Cooldown: §a(\d+)s/, "$1"));
    const now = Date.now()

    if (cooldowns[ability] && cooldowns[ability] >= now)
        return;

    cooldowns[ability] = now + (cooldown * 1_000);
});

Settings.registerSetting("Ability Cooldown Display", "tick", () => {
    cooldown_display.clearLines();
    const lines = [];
    const now = Date.now()
    Object.entries(cooldowns)?.forEach(([abiltiy, cooldown_expire]) => {
        if (cooldown_expire > now)
            lines.push(`&b${abiltiy}&r: &e${((cooldown_expire - now) / 1_000).toFixed(1)}s`);
        else
            delete cooldowns[abiltiy];
    });
    if (lines.length > 0) {
        cooldown_display.show();
        cooldown_display.addLine(...lines);
    }
    else {
        cooldown_display.hide();
    }
});

Settings.registerSetting("Ability Cooldown Display", "worldLoad", () => {
    Object.entries(cooldowns)?.forEach(([abiltiy, cooldown_expire]) => {
        delete cooldowns[abiltiy];
    });
    cooldowns["Mining Speed Boost"] = Date.now() + 60_000;
});

// {
//     id: "minecraft:prismarine_shard",
//     Count: 1b,
//     tag: {
//         ench: [{
//             lvl: 5s,
//             id: 32s
//         }],
//         HideFlags: 254,
//         display: {
//             Lore: [
//  "§8Breaking Power 9",
//  "",
//  "§7Damage: §c+75",
//  "§7Mining Speed: §a+634 §9(+34)",
//  "§7Mining Fortune: §a+38 §9(+8)",
//  "§7Mining Wisdom: §a+10",
//  " §8[§7⸕§8] §8[§8☘§8]",
//  "",
//  "§9Compact X",
//  "§7Gain §3+10☯ Mining Wisdom §7and a §a0.57%",
//  "§a§7chance to drop an enchanted item.",
//  "§9Efficiency V",
//  "§7Increases how quickly your tool",
//  "§7breaks blocks.",
//  "§9Experience III",
//  "§7Grants a §a37.5% §7chance for mobs and",
//  "§7ores to drop double experience.",
//  "§9Fortune III",
//  "§7Grants §6+30☘ Mining Fortune§7, which",
//  "§7increases your chance for multiple",
//  "§7drops.",
//  "§9Smelting Touch I",
//  "§7Automatically smelts broken blocks",
//  "§7into their smelted form.",
//  "",
//  "§7Gain §a+20% §dGemstone Powder",
//  "§7when using this Drill!",
//  "",
//  "§7Gives §a+800§7 §dGemstone §6⸕ Mining Speed",
//  "§7Gives §a+120§7 §dGemstone §6☘ Mining Fortune",
//  "",
//  "§7Fuel Tank: §cNot Installed",
//  "§7§7Increases fuel capacity with part",
//  "§7installed.",
//  "",
//  "§7Drill Engine: §cNot Installed",
//  "§7§7Increases §6⸕ Mining Speed §7with part",
//  "§7installed.",
//  "",
//  "§aBlue Cheese Goblin Omelette Part",
//  "§7Adds §a+1§7 level to all unlocked Heart of the",
//  "§7Mountain perks",
//  "",
//  "§7Fuel: §22,919§8/3k",
//  "",
//  "§6Ability: Mining Speed Boost  §e§lRIGHT CLICK",
//  "§7Grants §a+§a300% §6⸕ Mining Speed §7for",
//  "§7§a20s§7.",
//  "§8Cooldown: §a120s",
//  "",
//  "§9Auspicious Bonus",
//  "§7Grants §a+8 §6☘ Mining Fortune§7, which",
//  "§7increases your chance for multiple",
//  "§7drops.",
//  "",
//  "§8§l* §8Co-op Soulbound §8§l*",
//  "§5§lEPIC DRILL"],
//             Name: "§5Auspicious Jasper Drill X"
//         },
//         ExtraAttributes: {
//             drill_part_upgrade_module: "goblin_omelette_blue_cheese",
//             drill_fuel: 2919,
//             modifier: "auspicious",
//             compact_blocks: 1660621,
//             id: "GEMSTONE_DRILL_4",
//             enchantments: {
//                 efficiency: 5,
//                 fortune: 3,
//                 smelting_touch: 1,
//                 compact: 10,
//                 experience: 3
//             },
//             uuid: "92e1cc31-2096-49ad-9004-7c54de443e64",
//             donated_museum: 1b,
//             timestamp: 1669380660000L
//         }
//     },
//     Damage: 0s
// }