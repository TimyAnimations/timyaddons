import { toCommas } from "../../utils/format";
import { registerCloseContainer, registerContainer } from "../../utils/skyblock";
import Settings from "../../utils/settings/main";
var powder_string = "";

registerContainer("Heart of the Mountain", () => {
    if (!Settings.mining_total_powder) return;
    const container = Player.getContainer();
    const items = container.getItems();

    const available_powder_item = items[49];
    const spend_powder_item = items[52];

    // ChatLib.chat(available_powder_item.getName());
    // ChatLib.chat(spend_powder_item.getName());

    const available_powder = parseLoreAvailablePowder(available_powder_item);
    // ChatLib.chat( toCommas(available_powder.mithril) );
    // ChatLib.chat( toCommas(available_powder.gemstone) );
    // ChatLib.chat( toCommas(available_powder.glacite) );
    
    const spend_powder = parseLoreSpentPowder(spend_powder_item);
    // ChatLib.chat( toCommas(spend_powder.mithril) );
    // ChatLib.chat( toCommas(spend_powder.gemstone) );
    // ChatLib.chat( toCommas(spend_powder.glacite) );
    
    powder_string = 
        "&7Total Mithril: &2" + toCommas(available_powder.mithril + spend_powder.mithril) + "\n" +
        "&7Total Gemstone: &d" + toCommas(available_powder.gemstone + spend_powder.gemstone) + "\n" +
        "&7Total Glacite: &b" + toCommas(available_powder.glacite + spend_powder.glacite);

    powder_trigger.register();
});

registerCloseContainer("Heart of the Mountain", () =>  {
    powder_trigger.unregister();
})

const powder_trigger = register("guiRender", () => {
    const [center_x, center_y] = [(Renderer.screen.getWidth() / 2), (Renderer.screen.getHeight() / 2)];
    Renderer.retainTransforms(true);
    Renderer.translate(center_x + 110, center_y - 110);
    Renderer.drawString(powder_string, 0, 0);
    Renderer.retainTransforms(false);
});
powder_trigger.unregister();

function parseLoreAvailablePowder(item) {
    let ret = {
        mithril: 0,
        gemstone: 0,
        glacite: 0
    };
    if (!item) return ret;
    let lore = item.getNBT().toObject()?.tag?.display?.Lore ?? [];
    let i = 0;
    for (; i < lore.length && !/§7Mithril Powder: §a§2[\d,.]+/.test(lore[i]); i++);
    if (i == lore.length) return ret;
    ret.mithril += parseInt(lore[i]?.replace(/(§7Mithril Powder: §a§2|,)/g, ""));

    for (; i < lore.length && !/§7Gemstone Powder: §a§d[\d,.]+/.test(lore[i]); i++);
    if (i == lore.length) return ret;
    ret.gemstone += parseInt(lore[i]?.replace(/(§7Gemstone Powder: §a§d|,)/g, ""));
    
    for (; i < lore.length && !/§7Glacite Powder: §a§b[\d,.]+/.test(lore[i]); i++);
    if (i == lore.length) return ret;
    ret.glacite += parseInt(lore[i]?.replace(/(§7Glacite Powder: §a§b|,)/g, ""));

    return ret;
}

function parseLoreSpentPowder(item) {
    let ret = {
        mithril: 0,
        gemstone: 0,
        glacite: 0
    };
    if (!item) return ret;
    let lore = item.getNBT().toObject()?.tag?.display?.Lore ?? [];
    let i = 0;
    for (; i < lore.length && !/  §8- §2[\d,.]+ Mithril Powder/.test(lore[i]); i++);
    if (i == lore.length) return ret;
    ret.mithril += parseInt(lore[i]?.replace(/(  §8- §2| Mithril Powder|,)/g, ""));

    for (; i < lore.length && !/  §8- §b[\d,.]+ Glacite Powder/.test(lore[i]); i++);
    if (i == lore.length) return ret;
    ret.glacite += parseInt(lore[i]?.replace(/(  §8- §b| Glacite Powder|,)/g, ""));
    
    for (; i < lore.length && !/  §8- §d[\d,.]+ Gemstone Powder/.test(lore[i]); i++);
    if (i == lore.length) return ret;
    ret.gemstone += parseInt(lore[i]?.replace(/(  §8- §d| Gemstone Powder|,)/g, ""));

    return ret;
}

// "§7Mithril Powder: §a§27,639,437"
// "§7Gemstone Powder: §a§d5,389,579"
// "§7Glacite Powder: §a§b1,232,130"
// "  §8- §212,437,788 Mithril Powder"
// "  §8- §b19,116,243 Glacite Powder"
// "  §8- §d17,327,514 Gemstone Powder"

/*
{
    id: "minecraft:skull",
    Count: 1b,
    tag: {
        SkullOwner: {
            Id: "c25cd49b-a22f-3b3b-8628-56022ad9c1e0",
            Properties: {
                textures: [{
                    Value: "ewogICJ0aW1lc3RhbXAiIDogMTYwNzk4NDI0NDM4NywKICAicHJvZmlsZUlkIiA6ICJhMmY4MzQ1OTVjODk0YTI3YWRkMzA0OTcxNmNhOTEwYyIsCiAgInByb2ZpbGVOYW1lIiA6ICJiUHVuY2giLAogICJzaWduYXR1cmVSZXF1aXJlZCIgOiB0cnVlLAogICJ0ZXh0dXJlcyIgOiB7CiAgICAiU0tJTiIgOiB7CiAgICAgICJ1cmwiIDogImh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvODZmMDZlYWEzMDA0YWVlZDA5YjNkNWI0NWQ5NzZkZTU4NGU2OTFjMGU5Y2FkZTEzMzYzNWRlOTNkMjNiOWVkYiIKICAgIH0KICB9Cn0="
                }]
            }
        },
        display: {
            Lore: ["§7Token of the Mountain: §50", "", "§7§8Unlock more §5Token of the Mountain", "§5§8by leveling up your Heart of the", "§8Mountain tiers.", "", "§9᠅ Powder", "§7§9Powders §8are dropped from mining", "§8ores in the §2Dwarven Mines §8and are", "§8used to upgrade the perks you've", "§8unlocked!", "", "§7Mithril Powder: §a§27,639,437", "  §8(§2+1 §7extra base powder§8)", "  §8(§2+65% §7more powder§8)", "§7Gemstone Powder: §a§d5,389,579", "  §8(§d+2 §7extra base powder§8)", "  §8(§d+65% §7more powder§8)", "§7Glacite Powder: §a§b1,232,130", "  §8(§b+3 §7extra base powder§8)", "  §8(§b+65% §7more powder§8)", "", "§7§8Increase your chance to gain extra", "§8Powder by unlocking perks, equipping", "§8the §2Mithril Golem Pet§8, and more!"],
            Name: "§5Heart of the Mountain"
        }
    },
    Damage: 3s
}
{
    id: "minecraft:skull",
    Count: 1b,
    tag: {
        SkullOwner: {
            Id: "d627817b-e5a0-37d1-843c-10190e48db0f",
            Properties: {
                textures: [{
                    Value: "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvNjQ0OGUyNzUzMTM1MzJmNTRjNGJhMjE4OTQ4MDlhMjNkY2U1MmFmMDFkZGQxZTg5ZmM3Njg5NDgxZmFiNzM3ZSJ9fX0="
                }]
            }
        },
        display: {
            Lore: ["§7Resets the Perks and Abilities of", "§7your §5Heart of the Mountain§7, locking", "§7them and resetting their levels.", "", "§7You will be reimbursed with:", "  §8- §525 Token of the Mountain", "  §8- §212,437,788 Mithril Powder", "  §8- §b19,116,243 Glacite Powder", "  §8- §d17,327,514 Gemstone Powder", "", "§7You will §akeep §7any Tiers and §cPeak of", "§cthe Mountain §7that you have unlocked.", "", "§7Cost", "§6100,000 Coins", "", "§7§c§lWARNING: This is permanent.", "§c§lYou can not go back after", "§c§lresetting your Heart of the", "§c§lMountain!"],
            Name: "§cReset Heart of the Mountain"
        }
    },
    Damage: 3s
}
*/