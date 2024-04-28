import Settings from "../../utils/settings/main"
import { MoveableDisplay } from "../../utils/moveable_display";
import { registerCloseContainer, requireContainer } from "../../utils/skyblock";
import { timeElapseStringShort, toCommas } from "../../utils/format";
import { highlightSlot } from "../../utils/render";
import { queueCommand } from "../../utils/command_queue";

var upgrade_display = new MoveableDisplay("chocolate_factory_upgrade_timers");
export function getChocolateFactoryDisplay() {
    return upgrade_display;
}

upgrade_display.setLine(0, "&6&lChocolate Factory: ");

Settings.addAction("Chocolate Factory Upgrade Timer GUI", (value) => {
    if (value)
        upgrade_display.show();
    else
        upgrade_display.hide();
})
if (Settings.event_chocolate_timer)
    upgrade_display.show();
else
    upgrade_display.hide();

if (!upgrade_display.persistent_data) {
    upgrade_display.persistent_data = {
        chocolate_per_second: 0,
        chocolate: 0,
        last_updated: Date.now(),
        upgrades: {}
    }
    upgrade_display.save();
}

Settings.event_chocolate_open_gui = () => {
    upgrade_display.edit();
};

Settings.registerSetting("Chocolate Factory Upgrade Timer GUI", "step", () => {
    const time_since_last_update = Date.now() - upgrade_display.persistent_data.last_updated;
    const current_chocolate = upgrade_display.persistent_data.chocolate + (upgrade_display.persistent_data.chocolate_per_second * (time_since_last_update / 1_000));
    const chocolate_per_second = upgrade_display.persistent_data.chocolate_per_second;
    upgrade_display.clearLines();
    upgrade_display.setLine(0, `&6&lChocolate Factory: `);
    upgrade_display.setLine(1, ` &e${toCommas(current_chocolate)}&7 chocolate`);
    upgrade_display.setLine(2, ` &e${toCommas(chocolate_per_second)}&7 chocolate/sec`);
    if (chocolate_per_second === 0) return;
    Object.entries(upgrade_display.persistent_data.upgrades).forEach(([name, cost], idx) => {
        const chocolate_needed = cost - current_chocolate;

        const time_left = chocolate_needed * 1_000 / chocolate_per_second;
        const time_left_string = time_left > 0 ? `&b${timeElapseStringShort(time_left)}` : "&aAvailable";
        upgrade_display.setLine(3 + idx, ` ${name}&r: ${time_left_string}`);
    });
}).setFps(1);

var cheapest_cost = Infinity
var cheapest_idx = -1;
var chocolate_item = undefined;
requireContainer("Chocolate Factory", Settings.registerSetting("Chocolate Factory Upgrade Timer GUI", "tick", () => {
    const items = Player.getContainer().getItems();

    const chocolate_info_item = items[13];
    chocolate_item = items[13];
    const chocolate_name_split = chocolate_info_item?.getName()?.split(" ") ?? [];
    const chocolate = parseFloat(chocolate_name_split[0]?.replace(/§[0-9a-fk-or]/g, "")?.replace(/,/g, ""));
    if (isNaN(chocolate)) {
        // ChatLib.chat(`"${chocolate_info_item?.getName()}&r" couldn't parse current chocolate "${chocolate_name_split[0]?.replace(/§[0-9a-fk-or]/g, "")}"`);
        return;
    }
    const chocolate_per_second = getChocolatePerSecondFromLore(chocolate_info_item);
    if (isNaN(chocolate_per_second)) {
        // ChatLib.chat(`"${chocolate_info_item?.getName()}&r" couldn't parse current chocolate per second`);
        return;
    }

    let upgrades = {};
    let cheapest_value = Infinity;
    cheapest_cost = Infinity;
    cheapest_idx = -1;
    items.slice(0, 27).forEach((item, idx) => {
        if (idx === 13) return;
        if (item?.getID() === 160) return;
        World.playSound("random.successful_hit", 1, 1);
    });
    items.slice(27, 54).forEach((item, idx) => {
        if (item?.getID() === 160) return;
        const cost = getCostFromLore(item);
        if (isNaN(cost)) return;
        idx += 27;
        if (idx >= 29 && idx < 34) {
            const cost_per_cps = cost / (idx - 28);
            if (cost_per_cps < cheapest_value) {
                cheapest_value = cost_per_cps;
                cheapest_idx = idx;
                cheapest_cost = cost;
            }
        }

        upgrades[item?.getName()] = cost;
    });

    upgrade_display.persistent_data.chocolate = chocolate;
    upgrade_display.persistent_data.chocolate_per_second = chocolate_per_second;
    upgrade_display.persistent_data.upgrades = upgrades;
    upgrade_display.persistent_data.last_updated = Date.now();
}));
requireContainer("Chocolate Factory", Settings.registerSetting("Chocolate Factory Upgrade Timer GUI", "renderSlot", (slot) => {
    const idx = slot.getIndex();
    const [x, y] = [slot.getDisplayX() - 1, slot.getDisplayY() - 1];

    if (idx < 27 && idx !== 13) {
        highlightSlot(x, y, Renderer.color(255, 170, 0, 127), Renderer.color(255, 170, 0));
    }

    if (idx !== cheapest_idx) return;
    
    GlStateManager.func_179140_f();
    if (upgrade_display.persistent_data.chocolate < cheapest_cost)
        highlightSlot(x, y, Renderer.color(255, 85, 85, 127), Renderer.color(255, 85, 85));
    else
        highlightSlot(x, y, Renderer.color(85, 255, 85, 127), Renderer.color(85, 255, 85));
}));
Settings.registerSetting("Chocolate Factory Upgrade Timer GUI", "guiRender", () => {
    upgrade_display.draw();
});
requireContainer("Chocolate Factory", Settings.registerSetting("Chocolate Factory Upgrade Timer GUI", "guiRender", () => {
    const [center_x, center_y] = [(Renderer.screen.getWidth() / 2), (Renderer.screen.getHeight() / 2)];
    if (chocolate_item) {
        Renderer.drawString(chocolate_item.getLore().join("\n"), center_x + 110, center_y - 110);
    }
}));
Settings.registerSetting("Chocolate Factory Upgrade Timer GUI", "guiMouseClick", (mouse_x, mouse_y) => {
    if (upgrade_display.inArea(mouse_x, mouse_y))
        queueCommand("cf");
});
requireContainer("Chocolate Factory", Settings.registerSetting("Chocolate Factory Upgrade Timer GUI", "itemTooltip", (lore, item, event) => {
    if (/§e[\d,.]+ §6Chocolate/.test(item?.getName()))
        cancel(event);
}));
registerCloseContainer("Chocolate Factory", () => {
    upgrade_display.save();
})

function getCostFromLore(item) {
    if (!item) return NaN;
    let lore = item.getNBT().toObject()?.tag?.display?.Lore ?? [];
    let i = 0;
    for (; i < lore.length && !/§7Cost/.test(lore[i]); i++);
    i++;
    if (i >= lore.length) return NaN;
    if (!/§6[\d,.]+ Chocolate/.test(lore[i])) return NaN;
    
    return parseFloat(lore[i]?.split(" ")[0]?.replace(/§[0-9a-fk-or]/g, "")?.replace(/,/g, ""));

}
function getChocolatePerSecondFromLore(item) {
    if (!item) return NaN;
    let lore = item.getNBT().toObject()?.tag?.display?.Lore ?? [];
    let i = 0;
    for (; i < lore.length && !/§7Chocolate Production/.test(lore[i]); i++);
    i++;
    if (i >= lore.length) return NaN;
    if (!/§6[\d,.]+ §8per second/.test(lore[i])) return NaN;
    
    return parseFloat(lore[i]?.split(" ")[0]?.replace(/§[0-9a-fk-or]/g, "")?.replace(/,/g, ""));

}

/*
{
    id: "minecraft:skull",
    Count: 1b,
    tag: {
        SkullOwner: {
            Id: "d7ac85e6-bd40-359e-a2c5-86082959309e",
            Properties: {
                textures: [{
                    Value: "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvOWE4MTUzOThlN2RhODliMWJjMDhmNjQ2Y2FmYzhlN2I4MTNkYTBiZTBlZWMwY2NlNmQzZWZmNTIwNzgwMTAyNiJ9fX0="
                }]
            }
        },
        display: {
            Lore: ["§7§6Chocolate§7, of course, is not a valid", "§7source of §anutrition§7. This, however,", "§7does not stop it from being §dawesome§7.", "", "§7Chocolate Production", "§658.37 §8per second", "", "§7All-time Chocolate: §626,543", "", "§7§eClick to uncover the meaning of life!"],
            Name: "§e1,506 §6Chocolate"
        }
    },
    Damage: 3s
}
{
    id: "minecraft:skull",
    Count: 1b,
    tag: {
        SkullOwner: {
            Id: "d7ac85e6-bd40-359e-a2c5-86082959309e",
            Properties: {
                textures: [{
                    Value: "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvOWE4MTUzOThlN2RhODliMWJjMDhmNjQ2Y2FmYzhlN2I4MTNkYTBiZTBlZWMwY2NlNmQzZWZmNTIwNzgwMTAyNiJ9fX0="
                }]
            }
        },
        display: {
            Lore: ["§7§6Chocolate§7, of course, is not a valid", "§7source of §anutrition§7. This, however,", "§7does not stop it from being §dawesome§7.", "", "§7Chocolate Production", "§6465.12 §8per second", "", "§7All-time Chocolate: §6770,933", "", "§7§eClick to uncover the meaning of life!"],
            Name: "§e4,057 §6Chocolate"
        }
    },
    Damage: 3s
}
*/