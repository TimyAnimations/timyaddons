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
        chocolate_prestige: 0,
        chocolate_prestige_cost: 150_000_000,
        
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

function updateUpgradeDisplay(estimate = true) {
    const time_since_last_update = estimate ? Date.now() - upgrade_display.persistent_data.last_updated : 0;
    const chocolate_per_second = upgrade_display.persistent_data.chocolate_per_second;
    const estimated_chocolate = chocolate_per_second * (time_since_last_update / 1_000);
    const current_chocolate = upgrade_display.persistent_data.chocolate + estimated_chocolate;
    const current_chocolate_total = upgrade_display.persistent_data.chocolate_total + estimated_chocolate;
    upgrade_display.clearLines();

    let display_lines = []
    display_lines.push(`&6&lChocolate Factory: `);
    display_lines.push(` &e${toCommas(current_chocolate)}&6 Chocolate`);
    display_lines.push(` &6${toCommas(chocolate_per_second, 2)}&7 per second`);
    display_lines.push(` &6${toCommas(current_chocolate_total)}&7 all-time`);
    display_lines.push("");
    display_lines.push("&a&lUpgrades: ");
    
    if (chocolate_per_second === 0) return;
    Object.entries(upgrade_display.persistent_data.upgrades).forEach(([name, cost], idx) => {
        if (!cost || isNaN(cost)) {
            display_lines.push(` ${name}&r: &c&lMAX`);
            return;
        }
        const chocolate_needed = cost - current_chocolate;

        const time_left = chocolate_needed * 1_000 / chocolate_per_second;
        const time_left_string = time_left > 0 ? `&b${timeElapseStringShort(time_left)}` : "&aAvailable";
        display_lines.push(` ${name}&r: ${time_left_string}${name === upgrade_display.persistent_data.cheapest_upgrade ? " &6&l✯&7" : ""}`);
        if (name === upgrade_display.persistent_data.cheapest_upgrade) {
            if (!cheapest_afford && time_left <= 0) {
                cheapest_afford = true;
                World.playSound("random.successful_hit", 1, 1);
            }
            else if (cheapest_afford && time_left > 0) {
                cheapest_afford = false;
            }
        }
    });

    if (!upgrade_display.persistent_data.chocolate_prestige || isNaN(upgrade_display.persistent_data.chocolate_prestige_cost)) return;
    const chocolate_prestige = upgrade_display.persistent_data.chocolate_prestige + estimated_chocolate;
    const chocolate_needed = upgrade_display.persistent_data.chocolate_prestige_cost - chocolate_prestige;

    const time_left = chocolate_needed * 1_000 / chocolate_per_second;
    const time_left_string = time_left > 0 ? `&b${timeElapseStringShort(time_left)}` : "&aAvailable";
    display_lines.push("");
    display_lines.push(`&d&lPrestige:&r ${time_left_string}`);
    display_lines.push(` &e${toCommas(chocolate_prestige)}&7/&6${toCommas(upgrade_display.persistent_data.chocolate_prestige_cost)}`);

    upgrade_display.addLine(...display_lines);
}

var cheapest_cost = Infinity
var cheapest_idx = -1;
var cheapest_afford = false;
var chocolate_item = undefined;
var upgrades_costs = [];

var last_chocolate = undefined;
var last_chocolate_earned = [];
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
    
    const chocolate_prestige = getChocolatePrestigeInfoFromLore(items[28]);
    const chocolate_prestige_cost = PRESTIGE_COST[items[28]?.getName()];
    upgrades_costs = items.slice(29, 45).map((item, idx) => {
        const slot_idx = idx + 29;
        if (item?.getID() === 160) return NaN;
        const cost = getChocolateCostFromLore(item);
        
        let name = item?.getName();
        if (!name) return;
        if (isNaN(cost) && name?.startsWith("§c")) return NaN;

        if (slot_idx >= 29 && slot_idx < 34) {
            const name_split = name.split("§8 - ");
            let level = name_split[1]?.replace(/[^\]]*$/g, "");
            if (level === "") level = "§7[0§7]"
            name = `${level} ${name_split[0]}`;
            
            if (!isNaN(cost)) {
                const cost_per_cps = cost / (slot_idx - 28);
                if (cost_per_cps < cheapest_value) {
                    cheapest_value = cost_per_cps;
                    cheapest_idx = slot_idx;
                    cheapest_cost = cost;
                    cheapest_name = name;
                }
            }
        }

        upgrades[name] = cost;
        return cost
    });

    if (chocolate !== last_chocolate) {
        if (last_chocolate) {
            const earned = chocolate - last_chocolate;
            last_chocolate_earned.push({string: `${earned >= 0? "&e+" : "&c"}${toCommas(earned)}`, time: Date.now(), offset_x: Math.random(), offset_y: Math.random()});
            last_chocolate_earned = last_chocolate_earned.filter((data) => Date.now() - data.time < 1_000);
        }
        last_chocolate = chocolate;
    }

    upgrade_display.persistent_data.chocolate = chocolate;
    upgrade_display.persistent_data.chocolate_per_second = chocolate_per_second;
    upgrade_display.persistent_data.chocolate_total = chocolate_total;
    upgrade_display.persistent_data.chocolate_prestige = chocolate_prestige;
    upgrade_display.persistent_data.chocolate_prestige_cost = chocolate_prestige_cost;
    upgrade_display.persistent_data.upgrades = upgrades;
    upgrade_display.persistent_data.cheapest_upgrade = cheapest_name;
    upgrade_display.persistent_data.last_updated = Date.now();
    updates_estimate_trigger.unregister();
    updateUpgradeDisplay(false);
}));
requireContainer("Chocolate Factory", Settings.registerSetting("Chocolate Factory Upgrade Optimizer", "renderSlot", (slot) => {
    const idx = slot.getIndex();
    const [x, y] = [slot.getDisplayX() - 1, slot.getDisplayY() - 1];

    if (idx < 27 || idx >= 54) return;

    if (idx !== cheapest_idx) {
        if (isNaN(upgrades_costs[idx - 29])) return;
        if (upgrade_display.persistent_data.chocolate < upgrades_costs[idx - 29])
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

function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
}

requireContainer("Chocolate Factory", Settings.registerSetting("Chocolate Factory Upgrade Optimizer", "guiRender", () => {
    const [center_x, center_y] = [(Renderer.screen.getWidth() / 2), (Renderer.screen.getHeight() / 2)];
    Renderer.retainTransforms(true);
    Renderer.translate(center_x + 110, center_y - 110);
    upgrade_display.draw_func(center_x + 110, center_y - 110, 1, 1)
    Renderer.retainTransforms(false);

    const date_now = Date.now();
    last_chocolate_earned.forEach((data) => {
        const uneased_t = (date_now - data.time) / 2_000;
        if (uneased_t > 1) return;
        const t = easeOutCubic(uneased_t);
        // Renderer.drawString(`${t} ${data.string}`, center_x, center_y - 120);
        Renderer.translate(center_x + 110 + ((data.offset_x - 0.5) * 16 * t), center_y - 115 - ((data.offset_y + 10) * 3 * t))
        Renderer.drawString(data.string, 0, 0);
    })
}));


registerCloseContainer("Chocolate Factory", () => {
    upgrade_display.save();
    updates_estimate_trigger.register();
    last_chocolate = undefined;
    last_chocolate_earned = [];
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

const PRESTIGE_COST = {
    "§6Chocolate Factory I" : 150_000_000,
    "§6Chocolate Factory II" : 1_000_000_000,
    "§6Chocolate Factory III" : 4_000_000_000,
    "§6Chocolate Factory IV" : 10_000_000_000,
    "§6Chocolate Factory V" : NaN,
}
function getChocolatePrestigeInfoFromLore(item) {
    if (!item) return NaN;
    let lore = item.getNBT().toObject()?.tag?.display?.Lore ?? [];
    let i = 0;
    for (; i < lore.length && !/§7Chocolate this Prestige: §6[\d,.]/.test(lore[i]); i++);
    if (i == lore.length) return NaN;
    
    return parseFloat(lore[i]?.split(" ")[3]?.replace(/§[0-9a-fk-or]/g, "")?.replace(/,/g, ""));
}

requireContainer("Chocolate Factory", Settings.registerSetting("Chocolate Factory Hide Tooltip", "itemTooltip", (lore, item, event) => {
    if (!/§e[\d,.]+ §6Chocolate/.test(item?.getName())) return;
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

/*
{
    id: "minecraft:dye",
    Count: 1b,
    tag: {
        display: {
            Lore: ["§7What does it do? Nobody knows...", "", "§cRequires Chocolate Factory III!"],
            Name: "§c???"
        }
    },
    Damage: 8s
    {
    id: "minecraft:dye",
    Count: 1b,
    tag: {
        display: {
            Lore: ["§65,964.41 Chocolate §8per second", "", "  §6+281 §8(Hoppity's Collection§8)", "  §6+2,100 §8(Rabbit Employees§8)", "", "§7Total Multiplier: §62.505x", "  §6+0.455x §8(Hoppity's Collection§8)", "  §6+0.1x §8(Chocolate Factory II§8)", "  §6+0.7x §8(§dTime Tower§8)", "  §6+0.25x §8(§dCookie Buff§8)"],
            Name: "§6Chocolate Production"
        }
    },
    Damage: 3s
}
}
{
    id: "minecraft:clock",
    Count: 1b,
    tag: {
        display: {
            Lore: ["§7When active, this ancient building",
             "§7increases the production of your",
             "§7§6Chocolate Factory §7by §6+0.8x §7for §a1h§7.",
             "",
             "§7Status: §c§lINACTIVE",
             "",
             "§7Charges: §80§7/§a3",
             "§7Next Charge: §a1h49m52s",
             "§8§m-----------------",
             "§a§lUPGRADE §8➜ §dTime Tower IX",
             "  §6+0.9x Chocolate §8per second",
             "",
             "§7Cost",
             "§666,000,000 Chocolate",
             "",
             "§eLeft-click to upgrade!",
             "§cThe Time Tower is charging!"],
            Name: "§dTime Tower VIII"
        }
    },
    Damage: 0s
    {
    id: "minecraft:clock",
    Count: 1b,
    tag: {
        ench: [],
        display: {
            Lore: ["§7When active, this ancient building", "§7increases the production of your", "§7§6Chocolate Factory §7by §6+0.4x §7for §a1h§7.", "", "§7Status: §a§lACTIVE §f16m15s", "", "§7Charges: §e2§7/§a3", "§7Next Charge: §a7h17m29s", "§8§m-----------------", "§a§lUPGRADE §8➜ §dTime Tower V", "  §6+0.5x Chocolate §8per second", "", "§7Cost", "§624,000,000 Chocolate", "", "§eLeft-click to upgrade!", "§dThe Time Tower is active!"],
            Name: "§dTime Tower IV"
        }
    },
    Damage: 0s
    {
    id: "minecraft:dye",
    Count: 1b,
    tag: {
        display: {
            Lore: ["§65,050.62 Chocolate §8per second", "", "  §6+285 §8(Hoppity's Collection§8)", "  §6+10 §8(§fNibble Chocolate Stick§8)", "  §6+1,846 §8(Rabbit Employees§8)", "", "§7Total Multiplier: §62.359x", "  §6+0.459x §8(Hoppity's Collection§8)", "  §6+0.25x §8(Chocolate Factory III§8)", "  §6+0.4x §8(§dTime Tower§8)", "  §6+0.25x §8(§dCookie Buff§8)"],
            Name: "§6Chocolate Production"
        }
    },
    Damage: 3s
}
}
}


*/