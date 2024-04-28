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

Settings.addAction("Chocolate Factory Upgrade Optimizer GUI", (value) => {
    if (value)
        upgrade_display.show();
    else
        upgrade_display.hide();
})
if (Settings.event_chocolate_timer_gui)
    upgrade_display.show();
else
    upgrade_display.hide();

if (!upgrade_display.persistent_data) {
    upgrade_display.persistent_data = {
        chocolate_per_second: 0,
        chocolate: 0,
        chocolate_total: 0,
        last_updated: Date.now(),
        upgrades: {},
        cheapest_upgrade: undefined
    }
    upgrade_display.save();
}

Settings.event_chocolate_open_gui = () => {
    upgrade_display.edit();
};

updates_estimate_trigger = Settings.registerSetting("Chocolate Factory Upgrade Optimizer GUI", "step", () => { updateUpgradeDisplay(); }).setFps(1);

function updateUpgradeDisplay(estimate = true, true_cps = undefined) {
    const time_since_last_update = estimate ? Date.now() - upgrade_display.persistent_data.last_updated : 0;
    const current_chocolate = upgrade_display.persistent_data.chocolate + (upgrade_display.persistent_data.chocolate_per_second * (time_since_last_update / 1_000));
    const current_chocolate_total = upgrade_display.persistent_data.chocolate_total + (upgrade_display.persistent_data.chocolate_per_second * (time_since_last_update / 1_000));
    const chocolate_per_second = upgrade_display.persistent_data.chocolate_per_second;
    upgrade_display.clearLines();
    upgrade_display.setLine(0, `&6&lChocolate Factory: `);
    upgrade_display.setLine(1, ` &e${toCommas(current_chocolate)}&6 Chocolate`);
    if (true_cps) {
        upgrade_display.setLine(2, ` &6${toCommas(chocolate_per_second, 2)}&7 per second &e(${toCommas(true_cps, 2)})`);
    }
    else {
        upgrade_display.setLine(2, ` &6${toCommas(chocolate_per_second, 2)}&7 per second`);
    }
    upgrade_display.setLine(3, ` &6${toCommas(current_chocolate_total)}&7 all-time`);
    if (chocolate_per_second === 0) return;
    Object.entries(upgrade_display.persistent_data.upgrades).forEach(([name, cost], idx) => {
        const chocolate_needed = cost - current_chocolate;

        const time_left = chocolate_needed * 1_000 / chocolate_per_second;
        const time_left_string = time_left > 0 ? `&b${timeElapseStringShort(time_left)}` : "&aAvailable";
        upgrade_display.setLine(4 + idx, ` ${name}${name === upgrade_display.persistent_data.cheapest_upgrade ? "&8 - &6&lBEST&7" : ""}&r: ${time_left_string}`);
    });
}

var cheapest_cost = Infinity
var cheapest_idx = -1;
var chocolate_item = undefined;
var upgrades_costs = [];

var last_chocolate = 0;
var last_chocolate_time = Date.now();
var true_cps = 0;
requireContainer("Chocolate Factory", Settings.registerSetting("Chocolate Factory Upgrade Optimizer", "tick", (ticks_elapsed) => {
    const items = Player.getContainer().getItems();

    const chocolate_info_item = items[13];
    chocolate_item = items[13];
    const chocolate_name_split = chocolate_info_item?.getName()?.split(" ") ?? [];
    const chocolate = parseFloat(chocolate_name_split[0]?.replace(/§[0-9a-fk-or]/g, "")?.replace(/,/g, ""));
    if (isNaN(chocolate)) {
        return;
    }
    const chocolate_per_second = getChocolatePerSecondFromLore(chocolate_info_item);
    if (isNaN(chocolate_per_second)) {
        return;
    }
    const chocolate_total = getChocolateAllTimeFromLore(chocolate_info_item);

    let upgrades = {};
    let cheapest_value = Infinity;
    cheapest_cost = Infinity;
    cheapest_idx = -1;
    let cheapest_name = undefined;
    items.slice(0, 27).forEach((item, idx) => {
        if (idx === 13) return;
        if (item?.getID() === 160) return;
        if (!/§e§lCLICK ME!/.test(item?.getName())) return;
        if (Settings.event_chocolate_rabbit_warning && ticks_elapsed % 3 === 0)
            World.playSound("random.successful_hit", 1, 1);
    });
    upgrades_costs = items.slice(27, 54).map((item, idx) => {
        const slot_idx = idx + 27;
        if (item?.getID() === 160) return NaN;
        const cost = getChocolateCostFromLore(item);
        if (isNaN(cost)) return NaN;
        if (slot_idx >= 29 && slot_idx < 34) {
            const cost_per_cps = cost / (slot_idx - 28);
            if (cost_per_cps < cheapest_value) {
                cheapest_value = cost_per_cps;
                cheapest_idx = slot_idx;
                cheapest_cost = cost;
                cheapest_name = item?.getName();
            }
        }

        upgrades[item?.getName()] = cost;
        return cost
    });

    const date_now = Date.now();
    const time_ellapsed = date_now - last_chocolate_time;
    if (chocolate !== last_chocolate && time_ellapsed > 1_000) {
        true_cps = (chocolate - last_chocolate) * (1_000 / time_ellapsed);
        last_chocolate = chocolate;
        last_chocolate_time = date_now;
    }

    upgrade_display.persistent_data.chocolate = chocolate;
    upgrade_display.persistent_data.chocolate_per_second = chocolate_per_second;
    upgrade_display.persistent_data.chocolate_total = chocolate_total;
    upgrade_display.persistent_data.upgrades = upgrades;
    upgrade_display.persistent_data.cheapest_upgrade = cheapest_name;
    upgrade_display.persistent_data.last_updated = Date.now();
    updates_estimate_trigger.unregister();
    updateUpgradeDisplay(false, true_cps);
}));
requireContainer("Chocolate Factory", Settings.registerSetting("Chocolate Factory Upgrade Optimizer", "renderSlot", (slot) => {
    const idx = slot.getIndex();
    const [x, y] = [slot.getDisplayX() - 1, slot.getDisplayY() - 1];

    if (idx < 27 || idx >= 54) return;

    if (idx !== cheapest_idx) {
        if (isNaN(upgrades_costs[idx - 27])) return;
        if (upgrade_display.persistent_data.chocolate < upgrades_costs[idx - 27])
            highlightSlot(x, y, Renderer.color(255, 85, 85, 85));
        else
            highlightSlot(x, y, Renderer.color(85, 255, 85, 85));
        return;
    };
    
    GlStateManager.func_179140_f();
    if (upgrade_display.persistent_data.chocolate < cheapest_cost)
        highlightSlot(x, y, Renderer.color(255, 85, 85, 127), Renderer.color(255, 85, 85));
    else
        highlightSlot(x, y, Renderer.color(85, 255, 85, 127), Renderer.color(85, 255, 85));
}));
requireContainer("Chocolate Factory", Settings.registerSetting("Chocolate Factory Upgrade Optimizer", "renderSlot", (slot) => {
    const idx = slot.getIndex();
    const [x, y] = [slot.getDisplayX() - 1, slot.getDisplayY() - 1];

    if (idx < 27 && idx !== 13) {
        highlightSlot(x, y, Renderer.color(255, 170, 0, 127), Renderer.color(255, 170, 0));
        return;
    }
}));

Settings.registerSetting("Chocolate Factory Upgrade Optimizer GUI", "guiRender", (mouse_x, mouse_y, gui) => {
    if (!gui || !(gui instanceof Java.type("net.minecraft.client.gui.inventory.GuiInventory"))) 
        return;
    upgrade_display.draw();
});
Settings.registerSetting("Chocolate Factory Upgrade Optimizer GUI", "guiMouseClick", (mouse_x, mouse_y, button, gui) => {
    if (!gui || !(gui instanceof Java.type("net.minecraft.client.gui.inventory.GuiInventory"))) 
        return;
    if (upgrade_display.inArea(mouse_x, mouse_y))
        queueCommand("cf");
});

requireContainer("Chocolate Factory", Settings.registerSetting("Chocolate Factory Upgrade Optimizer", "guiRender", () => {
    const [center_x, center_y] = [(Renderer.screen.getWidth() / 2), (Renderer.screen.getHeight() / 2)];
    Renderer.retainTransforms(true);
    Renderer.translate(center_x + 110, center_y - 110);
    upgrade_display.draw_func(center_x + 110, center_y - 110, 1, 1)
    Renderer.retainTransforms(false);
}));


registerCloseContainer("Chocolate Factory", () => {
    upgrade_display.save();
    updates_estimate_trigger.register();
})

function getChocolateCostFromLore(item) {
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
function getChocolateAllTimeFromLore(item) {
    if (!item) return NaN;
    let lore = item.getNBT().toObject()?.tag?.display?.Lore ?? [];
    let i = 0;
    for (; i < lore.length && !/§7All-time Chocolate: §6[\d,.]/.test(lore[i]); i++);
    if (i == lore.length) return NaN;
    
    return parseFloat(lore[i]?.split(" ")[2]?.replace(/§[0-9a-fk-or]/g, "")?.replace(/,/g, ""));
}

requireContainer("Chocolate Factory", Settings.registerSetting("Chocolate Factory Hide Tooltip", "itemTooltip", (lore, item, event) => {
    if (/§e[\d,.]+ §6Chocolate/.test(item?.getName()))
        cancel(event);
}));
requireContainer("Chocolate Factory", Settings.registerSetting("Chocolate Factory Mute Eat Sound", "soundPlay", (position, name, vol, pitch, category, event) => {
    if (name === "random.eat")
        cancel(event);
}));

Settings.registerSetting("Chocolate Factory Upgrade Optimizer GUI", "chat", (count) => {
    const count_num = parseFloat(count?.replace(/,/g, ""));
    if (isNaN(count_num)) return;
    upgrade_display.persistent_data.chocolate += count_num;
}).setCriteria("&r&7&lDUPLICATE RABBIT! &6+${count} Chocolate&r");

// &r&7&lDUPLICATE RABBIT! &6+811,113 Chocolate&r
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
{
    id: "minecraft:skull",
    Count: 1b,
    tag: {
        SkullOwner: {
            Id: "3fb84d65-d866-3556-9764-78b9f5f70412",
            Properties: {
                textures: [{
                    Value: "ewogICJ0aW1lc3RhbXAiIDogMTcxMTYzNTAyMTEyMiwKICAicHJvZmlsZUlkIiA6ICJjMTJkMmY5ZWJhZGI0ZTllYTIxZmM2M2M3YWY3M2E5NSIsCiAgInByb2ZpbGVOYW1lIiA6ICJEcmVhbXlOZW9uIiwKICAic2lnbmF0dXJlUmVxdWlyZWQiIDogdHJ1ZSwKICAidGV4dHVyZXMiIDogewogICAgIlNLSU4iIDogewogICAgICAidXJsIiA6ICJodHRwOi8vdGV4dHVyZXMubWluZWNyYWZ0Lm5ldC90ZXh0dXJlLzZmZmEzMTE5YzA5Y2IwMTFhYjg3N2IyNzI0MWY4MjI5OTRhYWRhMzNhMjhmYTljZjgzMzFiOTE4OWJmOGFlMGMiCiAgICB9CiAgfQp9"
                }]
            }
        },
        display: {
            Name: "§e§lCLICK ME!"
        }
    },
    Damage: 3s
}
*/