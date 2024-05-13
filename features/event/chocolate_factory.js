import Settings from "../../utils/settings/main"
import { MoveableDisplay } from "../../utils/moveable_display";
import { registerCloseContainer, requireContainer } from "../../utils/skyblock";
import { parseTimeString, timeElapseStringShort, timeElapseStringShortSingleUnit, toCommas, toCompactCommas } from "../../utils/format";
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
        cheapest_upgrade: undefined,

        rabbit_count: 0,
        rabbit_barn_capacity: 0,

        chocolate_per_second_raw: 0,
        chocolate_multiplier: 1,
        time_tower_unlocked: false,
        time_tower_multiplier: 0,
        time_tower_end: 0,
        time_tower_charges: 0,
        time_tower_next_charge: 0,
    }
    upgrade_display.save();
}

Settings.event_chocolate_open_gui = () => {
    upgrade_display.edit();
};

updates_estimate_trigger = Settings.registerSetting("Chocolate Factory Upgrade Optimizer GUI", "step", () => { updateUpgradeDisplay(true, Settings.event_chocolate_timer_gui_compact); }).setFps(1);

function getEstimatedChocolatePerSecond(ignore_tower = false) {
    if (!upgrade_display.persistent_data.chocolate_per_second_raw || !upgrade_display.persistent_data.chocolate_multiplier)
        return upgrade_display.persistent_data.chocolate_per_second;

    let multiplier = upgrade_display.persistent_data.chocolate_multiplier;
    if (!ignore_tower && upgrade_display.persistent_data.time_tower_end && upgrade_display.persistent_data.time_tower_end > Date.now())
        multiplier += upgrade_display.persistent_data.time_tower_multiplier;

    return upgrade_display.persistent_data.chocolate_per_second_raw * multiplier;
}

function getEstimatedChocolate() {
    const time_since_last_update = Date.now() - upgrade_display.persistent_data.last_updated;
    let chocolate_per_second = getEstimatedChocolatePerSecond();
    return chocolate_per_second * (time_since_last_update / 1_000);
}

function getEstimatedTimeLeft(chocolate, cost, estimate = true) {
    const estimated_chocolate = estimate ? getEstimatedChocolate(chocolate) : 0;
    const current_chocolate = chocolate + estimated_chocolate;
    
    let chocolate_per_second = getEstimatedChocolatePerSecond();

    if (upgrade_display.persistent_data.time_tower_end && upgrade_display.persistent_data.time_tower_end > Date.now()) {
        const time_tower_left = upgrade_display.persistent_data.time_tower_end - Date.now();
        const time_tower_chocolate = current_chocolate + (chocolate_per_second * (time_tower_left / 1_000));

        if (cost < time_tower_chocolate) {
            return (cost - current_chocolate) * 1_000 / chocolate_per_second;
        }

        let chocolate_per_second_no_time_tower = getEstimatedChocolatePerSecond(true);
    
        return ((cost - time_tower_chocolate) * 1_000 / chocolate_per_second_no_time_tower) + time_tower_left;
    }
    
    return (cost - current_chocolate) * 1_000 / chocolate_per_second;
}

function getUpgradeDisplayLines(estimate = true) {
    let chocolate_per_second = getEstimatedChocolatePerSecond();
    
    const estimated_chocolate = estimate ? getEstimatedChocolate() : 0;
    const current_chocolate = upgrade_display.persistent_data.chocolate + estimated_chocolate;
    const current_chocolate_total = upgrade_display.persistent_data.chocolate_total + estimated_chocolate;

    let display_lines = []
    display_lines.push(`&6&lChocolate Factory: `);
    display_lines.push(` &e${toCommas(current_chocolate)}&6 Chocolate`);
    display_lines.push(` &6${toCommas(chocolate_per_second, 2)}&7 per second`);
    display_lines.push(` &6${toCommas(current_chocolate_total)}&7 all-time`);
    display_lines.push(` &a${upgrade_display.persistent_data.rabbit_count}&7/&a${upgrade_display.persistent_data.rabbit_barn_capacity}&7 rabbits`);
    
    if (chocolate_per_second === 0) {
        return display_lines;
    }
    display_lines.push("");
    display_lines.push("&a&lUpgrades: ");
    
    const cheapest_cost = upgrade_display.persistent_data.upgrades[upgrade_display.persistent_data.cheapest_upgrade]?.cost ?? upgrade_display.persistent_data.upgrades[upgrade_display.persistent_data.cheapest_upgrade];
    const cheapest_value = upgrade_display.persistent_data.upgrades[upgrade_display.persistent_data.cheapest_upgrade]?.value ?? 0;
    Object.entries(upgrade_display.persistent_data.upgrades).forEach(([name, data], idx) => {
        const cost = data?.cost ?? data;
        const value = data?.value ?? 0;
        if (!cost || isNaN(cost)) {
            display_lines.push(` ${name}&r: &c&lMAX`);
            return;
        }

        const time_left = getEstimatedTimeLeft(upgrade_display.persistent_data.chocolate, cost, estimate);
        const time_left_string = time_left > 0 ? `&b${timeElapseStringShort(time_left)}` : "&aAvailable";

        const cheapest = cheapest_cost && (cost / value) <= (cheapest_cost / cheapest_value);
        display_lines.push(` ${name}&r: ${time_left_string}${cheapest ? " &6&l✯&7" : ""}`);
        // display_lines.push(`   &c-${toCommas(cost)} &7| &a+${toCommas(value, 2)} &7| &e${toCommas(cost / value, 2)}`);
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

    if (upgrade_display.persistent_data.chocolate_prestige && !isNaN(upgrade_display.persistent_data.chocolate_prestige_cost)) {
        const chocolate_prestige = upgrade_display.persistent_data.chocolate_prestige + estimated_chocolate;
    
        const time_left = getEstimatedTimeLeft(upgrade_display.persistent_data.chocolate_prestige, upgrade_display.persistent_data.chocolate_prestige_cost, estimate);
        const time_left_string = time_left > 0 ? `&b${timeElapseStringShort(time_left)}` : "&aAvailable";
        display_lines.push("");
        display_lines.push(`&d&lPrestige:&r ${time_left_string}`);
        display_lines.push(` &e${toCommas(chocolate_prestige)}&7/&6${toCommas(upgrade_display.persistent_data.chocolate_prestige_cost)}`);
    }

    if (upgrade_display.persistent_data.time_tower_unlocked) {
        const now_second = Math.floor(Date.now() / 1_000);
        const time_tower_end_string = upgrade_display.persistent_data.time_tower_end && upgrade_display.persistent_data.time_tower_end > Date.now()
            ? `&a&lACTIVE &r${timeElapseStringShort(upgrade_display.persistent_data.time_tower_end - (now_second * 1_000))}`
            : "&c&lINACTIVE";
        
        let charges = upgrade_display.persistent_data.time_tower_charges;
        let next_charge = upgrade_display.persistent_data.time_tower_next_charge ?? 0;
        while (next_charge <= Date.now() && charges < 3) {
            charges++;
            next_charge += 2.88e+7;
        }
        const time_tower_next_charge_string = next_charge > Date.now() && charges < 3
            ? `&a${timeElapseStringShort(next_charge - (now_second * 1_000))}`
            : undefined;

        display_lines.push("");
        display_lines.push(`&d&lTime Tower:&r ${time_tower_end_string}`);
        display_lines.push(` &7Charges: &${charges == 3 ? "a" : "e"}${charges}&7/&a3`);
        if (time_tower_next_charge_string)
            display_lines.push(` &7Next Charge: &a${time_tower_next_charge_string}`);
    }

    return display_lines;
}

function getUpgradeDisplayLinesCompact(estimate = true) {
    let chocolate_per_second = getEstimatedChocolatePerSecond();
    
    const estimated_chocolate = estimate ? getEstimatedChocolate() : 0;
    const current_chocolate = upgrade_display.persistent_data.chocolate + estimated_chocolate;
    const current_chocolate_total = upgrade_display.persistent_data.chocolate_total + estimated_chocolate;

    let display_lines = []
    display_lines.push(`&6&lChocolate Factory: `);
    display_lines.push(` &e${toCompactCommas(current_chocolate)}&6 Chocolate`);
    display_lines.push(` &6${toCommas(chocolate_per_second, 2)}&7 per second`);
    display_lines.push(` &6${toCompactCommas(current_chocolate_total)}&7 all-time`);
    
    if (chocolate_per_second === 0) {
        return display_lines;
    }
    display_lines.push("");
    // display_lines.push("&a&lUpgrades: ");
    const cheapest_cost = upgrade_display.persistent_data.upgrades[upgrade_display.persistent_data.cheapest_upgrade]?.cost ?? upgrade_display.persistent_data.upgrades[upgrade_display.persistent_data.cheapest_upgrade];
    const cheapest_value = upgrade_display.persistent_data.upgrades[upgrade_display.persistent_data.cheapest_upgrade]?.value ?? 0;
    Object.entries(upgrade_display.persistent_data.upgrades).forEach(([name, data], idx) => {
        const cost = data?.cost ?? data;
        const value = data?.value ?? 0;
        
        if (!cost || isNaN(cost)) {
            // display_lines.push(` ${name}&r: &c&lMAX`);
            return;
        }

        const time_left = getEstimatedTimeLeft(upgrade_display.persistent_data.chocolate, cost, estimate);
        const time_left_string = time_left > 0 ? `&b${timeElapseStringShortSingleUnit(time_left)}` : "&a&l✓";

        const cheapest = cheapest_cost && (cost / value) <= (cheapest_cost / cheapest_value);
        display_lines.push(` ${name.replace(/(Rabbit |Jackrabbit )/g, "")}&r: ${time_left_string}${cheapest ? " &6&l✯&7" : ""}`);
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

    if (upgrade_display.persistent_data.chocolate_prestige && !isNaN(upgrade_display.persistent_data.chocolate_prestige_cost)) {
        const chocolate_prestige = upgrade_display.persistent_data.chocolate_prestige + estimated_chocolate;
    
        const time_left = getEstimatedTimeLeft(upgrade_display.persistent_data.chocolate_prestige, upgrade_display.persistent_data.chocolate_prestige_cost, estimate);
        const time_left_string = time_left > 0 ? `&b${timeElapseStringShortSingleUnit(time_left)}` : "&a&l✓";
        display_lines.push("");
        display_lines.push(` &d&lPrestige:&r &e${toCompactCommas(chocolate_prestige)}&7/&6${toCompactCommas(upgrade_display.persistent_data.chocolate_prestige_cost, 0)} &8- ${time_left_string}`);
    }

    if (upgrade_display.persistent_data.time_tower_unlocked) {
        const now_second = Math.floor(Date.now() / 1_000);
        const time_tower_end_string = upgrade_display.persistent_data.time_tower_end && upgrade_display.persistent_data.time_tower_end > Date.now()
            ? `&a&lACTIVE &r${timeElapseStringShortSingleUnit(upgrade_display.persistent_data.time_tower_end - (now_second * 1_000))}`
            : undefined;
        
        let charges = upgrade_display.persistent_data.time_tower_charges;
        let next_charge = upgrade_display.persistent_data.time_tower_next_charge ?? 0;
        while (next_charge <= Date.now() && charges < 3) {
            charges++;
            next_charge += 2.88e+7;
        }
        const time_tower_next_charge_string = next_charge > Date.now() && charges < 3
            ? ` &8- &a${timeElapseStringShortSingleUnit(next_charge - (now_second * 1_000))}`
            : "";

        display_lines.push(` &d&lTime Tower:&r &${charges == 3 ? "a" : "e"}${charges}&7/&a3${time_tower_next_charge_string}`);
        if (time_tower_end_string)
            display_lines.push(`  ${time_tower_end_string}`);
    }

    return display_lines;
}

function updateUpgradeDisplay(estimate = true, compact = true) {
    upgrade_display.clearLines();
    if (compact) {
        upgrade_display.addLine(...getUpgradeDisplayLinesCompact(estimate));
        return;
    }
    upgrade_display.addLine(...getUpgradeDisplayLines(estimate));
}

var cheapest_cost = Infinity
var cheapest_idx = -1;
var time_tower_optimal = false;
var cheapest_afford = false;
var chocolate_item = undefined;
var upgrades_costs = [];

var last_chocolate = undefined;
var last_chocolate_earned = [];
requireContainer("Chocolate Factory", Settings.registerSetting("Chocolate Factory Upgrade Optimizer", "tick", (ticks_elapsed) => {
    const items = Player.getContainer().getItems();

    const chocolate_info_item = items[13];
    const chocolate_production_item = items[45];
    
    chocolate_item = chocolate_info_item;
    const chocolate_name_split = chocolate_info_item?.getName()?.split(" ") ?? [];
    const chocolate = parseFloat(chocolate_name_split[0]?.replace(/§[0-9a-fk-or]/g, "")?.replace(/,/g, ""));
    if (isNaN(chocolate)) {
        return;
    }
    let chocolate_per_second = getChocolatePerSecondFromLore(chocolate_info_item);
    const chocolate_production = getChocolateProductionFromLore(chocolate_production_item);
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
    let time_tower_cost = 0;
    upgrades_costs = items.slice(29, 45).map((item, idx) => {
        const slot_idx = idx + 29;
        if (item?.getID() === 160) return NaN;
        const cost = getChocolateCostFromLore(item);
        let value = 0;
        
        let name = item?.getName();
        if (!name) return;
        if (isNaN(cost) && name?.startsWith("§c")) return NaN;

        if (slot_idx >= 29 && slot_idx < 34) {
            const name_split = name.split("§8 - ");
            let level = name_split[1]?.replace(/[^\]]*$/g, "");
            if (level === "") level = "§7[0§7]"
            name = `${level} ${name_split[0]}`;
            
            if (!isNaN(cost)) {
                value = ((slot_idx - 28) * chocolate_production.chocolate_multiplier);
                const cost_per_cps = cost / value;
                if (cost_per_cps < cheapest_value) {
                    cheapest_value = cost_per_cps;
                    cheapest_idx = slot_idx;
                    cheapest_cost = cost;
                    cheapest_name = name;
                }
            }
        }

        if (slot_idx === 39) {
            time_tower_optimal = false;
            time_tower_cost = cost;
            if (!isNaN(cost)) {
                value = (chocolate_production.chocolate_per_second_raw * 0.1) / 8
                const cost_per_cps = cost / value;
                time_tower_optimal = cost_per_cps < cheapest_value;
            }
        }
        
        if (slot_idx === 42) {
            if (!isNaN(cost)) {
                value = chocolate_production.chocolate_per_second_raw * 0.01;
                const cost_per_cps = cost / value;
                if (cost_per_cps < cheapest_value) {
                    cheapest_value = cost_per_cps;
                    cheapest_idx = slot_idx;
                    cheapest_cost = cost;
                    cheapest_name = name;
                }
            }
        }

        upgrades[name] = {
            cost: cost,
            value: value
        };
        return cost
    });

    // let time_tower_cumulative_cost = 0;
    // let time_tower_cumulative_multiplier = 0;
    // [
    //     6_500_500,
    //     13_000_000,
    //     19_500_000,
    //     26_000_000,
    //     39_000_000,
    //     52_000_000,
    //     65_000_000,
    //     78_000_000,
    //     91_000_000,
    //     104_000_000,
    //     130_000_000,
    //     156_000_000,
    //     195_000_000,
    //     260_000_000,
    // ].forEach((cost, idx) => {
    //     if (time_tower_cost > cost) return;
    //     time_tower_cumulative_cost += cost;
    //     time_tower_cumulative_multiplier += 0.1;
    //     let value = ((chocolate_production.chocolate_per_second_raw * time_tower_cumulative_multiplier) / 8)
    //     const cost_per_cps = time_tower_cumulative_cost / value;
    //     if (cost_per_cps > cheapest_value) return;
    //     upgrades[`${cost_per_cps > cheapest_value ? "&c" : "&a"}Time Tower ${idx + 2}`] = {
    //         cost: time_tower_cumulative_cost,
    //         value
    //     };
    // });

    const rabbit_barn_item = items[34];
    const [rabbit_count, rabbit_barn_capacity] = getRabbitBarnInfoFromLore(rabbit_barn_item);

    const time_tower_item = items[39];
    const time_tower_locked = time_tower_item?.getName()?.startsWith("§c") ?? true;
    const time_tower_info = getTimeTowerTowerInfoFromLore(time_tower_item);

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

    upgrade_display.persistent_data.rabbit_count = rabbit_count;
    upgrade_display.persistent_data.rabbit_barn_capacity = rabbit_barn_capacity;

    upgrade_display.persistent_data.chocolate_per_second_raw = chocolate_production.chocolate_per_second_raw;
    upgrade_display.persistent_data.chocolate_multiplier = chocolate_production.chocolate_multiplier;
    upgrade_display.persistent_data.time_tower_unlocked = !time_tower_locked;
    upgrade_display.persistent_data.time_tower_multiplier = chocolate_production.time_tower_multiplier;
    upgrade_display.persistent_data.time_tower_end = time_tower_info.end;
    upgrade_display.persistent_data.time_tower_charges = time_tower_info.charges;
    upgrade_display.persistent_data.time_tower_next_charge = time_tower_info.next_charge;

    updates_estimate_trigger.unregister();
    updateUpgradeDisplay(false, false);
}));
requireContainer("Chocolate Factory", Settings.registerSetting("Chocolate Factory Upgrade Optimizer", "renderSlot", (slot) => {
    const idx = slot.getIndex();
    const [x, y] = [slot.getDisplayX() - 1, slot.getDisplayY() - 1];

    if (idx < 27 || idx >= 54) return;

    if (idx !== cheapest_idx && !(idx === 39 && time_tower_optimal)) {
        if (isNaN(upgrades_costs[idx - 29])) return;
        if (upgrade_display.persistent_data.chocolate < upgrades_costs[idx - 29])
            highlightSlot(x, y, Renderer.color(255, 85, 85, 85));
        else
            highlightSlot(x, y, Renderer.color(85, 255, 85, 85));
        return;
    };
    
    GlStateManager.func_179140_f();
    if (upgrade_display.persistent_data.chocolate < upgrades_costs[idx - 29])
        highlightSlot(x, y, Renderer.color(255, 85, 85, 127), Renderer.color(255, 85, 85));
    else
        highlightSlot(x, y, Renderer.color(85, 255, 85, 127), Renderer.color(85, 255, 85));
}));
requireContainer("Chocolate Factory", Settings.registerSetting("Chocolate Factory Rabbit Warning", "renderSlot", (slot) => {
    const idx = slot.getIndex();
    const [x, y] = [slot.getDisplayX() - 1, slot.getDisplayY() - 1];
    if (!/§e§lCLICK ME!/.test(slot?.getItem()?.getName())) return;

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
function getChocolateProductionFromLore(item) {
    let ret = {
        chocolate_per_second: 0,
        chocolate_per_second_raw: 0,
        chocolate_multiplier: 1,
        time_tower_multiplier: 0,
    };
    if (!item) return ret;
    let lore = item.getNBT().toObject()?.tag?.display?.Lore ?? [];
    let i = 0;
    for (; i < lore.length && !/§6[\d,.]+ Chocolate §8per second/.test(lore[i]); i++);
    if (i >= lore.length) return ret;
    
    if (/§6[\d,.]+ Chocolate §8per second/.test(lore[i])) {
        ret.chocolate_per_second = parseFloat(lore[i]?.split(" ")[0]?.replace(/§[0-9a-fk-or]/g, "")?.replace(/,/g, ""));
    };

    for (; i < lore.length && !/§7Total Multiplier: §6[\d,.]+x/.test(lore[i]); i++) {
        if (/  §6\+[\d,.]+ §8(.*§8)/g.test(lore[i])) {
            let num = parseFloat(lore[i]?.replace(/(  §6\+| §8(.*§8)|,)/g, ""));
            ret.chocolate_per_second_raw += isNaN(num) ? 0 : num;
        }
    };
    if (i >= lore.length) return ret;
    
    for (; i < lore.length; i++) {
        if (/  §6\+[\d,.]+x §8(.*§8)/g.test(lore[i])) {
            let num = parseFloat(lore[i]?.replace(/(  §6\+|x §8(.*§8)|,)/g, ""));
            if (/Time Tower/g.test(lore[i]))
                ret.time_tower_multiplier = isNaN(num) ? 0 : num;
            else
                ret.chocolate_multiplier += isNaN(num) ? 0 : num;
        }
    };
    
    return ret;
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

function getRabbitBarnInfoFromLore(item) {
    if (!item) return [NaN, NaN];
    let lore = item.getNBT().toObject()?.tag?.display?.Lore ?? [];
    let i = 0;
    for (; i < lore.length && !/§7Your Barn: §a\d+§7\/§a\d+ Rabbits/.test(lore[i]); i++);
    if (i == lore.length) return [NaN, NaN];
    return [
        parseInt(lore[i]?.replace(/(§7Your Barn: §a|§7\/§a\d+ Rabbits)/g, "")),
        parseInt(lore[i]?.replace(/(§7Your Barn: §a\d+§7\/§a| Rabbits)/g, ""))
    ]
}

function getTimeTowerTowerInfoFromLore(item) {
    let ret = {
        charges: 0,
        end: 0,
        next_charge: 0
    };
    if (!item) return ret;
    let lore = item.getNBT().toObject()?.tag?.display?.Lore ?? [];
    let i = 0;
    for (; i < lore.length && !/§7Status: /.test(lore[i]); i++);
    if (i == lore.length) return ret;

    if (/§7Status: §a§lACTIVE §f/g.test(lore[i]))
        ret.end = Date.now() + parseTimeString(lore[i].replace(/§7Status: §a§lACTIVE §f/g));

    for (; i < lore.length && !/§7Charges: §[0-9a-fk-or][0123]§7\/§a3/.test(lore[i]); i++);
    if (i == lore.length) return ret;
    
    ret.charges = parseInt(lore[i]?.replace(/(§7Charges: §[0-9a-fk-or]|§7\/§a3)/g, ""));

    for (; i < lore.length && !/§7Next Charge: §a/.test(lore[i]); i++);
    if (i == lore.length) return ret;

    ret.next_charge = Date.now() + parseTimeString(lore[i].replace(/§7Next Charge: §a/g, ""));

    return ret;
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
    upgrade_display.persistent_data.chocolate_total += count_num;
    upgrade_display.persistent_data.chocolate_prestige += count_num;
    upgrade_display.save();
}).setCriteria("&r&7&lDUPLICATE RABBIT! &6+${count} Chocolate&r");

Settings.registerSetting("Chocolate Factory Upgrade Optimizer GUI", "chat", (chocolate, multiplier) => {
    const estimated_chocolate = getEstimatedChocolate();
    upgrade_display.persistent_data.chocolate += estimated_chocolate;
    upgrade_display.persistent_data.chocolate_total += estimated_chocolate;
    upgrade_display.persistent_data.chocolate_prestige += estimated_chocolate;
    upgrade_display.persistent_data.rabbit_count++;
    upgrade_display.persistent_data.last_updated = Date.now();
    
    const chocolate_num = parseFloat(chocolate?.replace(/,/g, ""));
    if (!isNaN(chocolate_num))
        upgrade_display.persistent_data.chocolate_per_second_raw += chocolate_num;
    const multiplier_num = parseFloat(multiplier?.replace(/,/g, ""));
    if (!isNaN(multiplier_num))
        upgrade_display.persistent_data.chocolate_multiplier += multiplier_num;

    upgrade_display.save();
}).setCriteria("&r&d&lNEW RABBIT! &6+${chocolate} Chocolate &7and &6+${multiplier}x Chocolate &7per second!&r");

Settings.registerSetting("Chocolate Factory Upgrade Optimizer GUI", "chat", (multiplier) => {
    const estimated_chocolate = getEstimatedChocolate();
    upgrade_display.persistent_data.chocolate += estimated_chocolate;
    upgrade_display.persistent_data.chocolate_total += estimated_chocolate;
    upgrade_display.persistent_data.chocolate_prestige += estimated_chocolate;
    upgrade_display.persistent_data.last_updated = Date.now();

    if (/[^\d,.]/g.test(multiplier)) 
        return;

    upgrade_display.persistent_data.rabbit_count++;
    const multiplier_num = parseFloat(multiplier?.replace(/,/g, ""));
    if (!isNaN(multiplier_num))
        upgrade_display.persistent_data.chocolate_multiplier += multiplier_num;

    upgrade_display.save();
}).setCriteria("&r&d&lNEW RABBIT! &6+${multiplier}x Chocolate &7per second!&r");

