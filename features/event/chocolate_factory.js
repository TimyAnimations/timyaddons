import Settings from "../../utils/settings/main"
import DeveloperSettings from "../../utils/settings/developer";
import { MoveableDisplay } from "../../utils/moveable_display";
import { getTabListNamesSafe, registerCloseContainer, registerContainer, requireContainer } from "../../utils/skyblock";
import { parseTimeString, timeElapseStringShort, timeElapseStringShortSingleUnit, toCommas, toCompactCommas } from "../../utils/format";
import { highlightSlot } from "../../utils/render";
import { queueCommand } from "../../utils/command_queue";

var upgrade_display = new MoveableDisplay("chocolate_factory_upgrade_timers");
export function getChocolateFactoryDisplay() {
    return upgrade_display;
}

var time_tower_recharge_hours = 7;

register("command", (value) => {
    upgrade_display.persistent_data.chocolate_spent_shop = parseInt(value);
}).setName("setspentchocolateshop");
const SHOP_MILESTONE = [
    2_000_000,
    10_000_000,
    25_000_000,
    50_000_000,
    100_000_000,
    250_000_000,
    500_000_000,
    1_000_000_000,
    2_500_000_000,
    5_000_000_000,
    10_000_000_000,
    25_000_000_000,
    50_000_000_000,
    100_000_000_000,
    150_000_000_000,
    200_000_000_000,
    250_000_000_000,
    300_000_000_000,
    350_000_000_000,
    400_000_000_000,
    500_000_000_000,
    600_000_000_000,
    700_000_000_000,
    800_000_000_000
]
const SHOP_MILESTONE_MYTHICS = [
    [0, 0],
    [0, 0.7/time_tower_recharge_hours],
    [55, 0],
    [0, 0],
]

registerContainer("Chocolate Shop", () =>  {
    const container = Player.getContainer();
    const items = container.getItems();

    const shop_milestone_item = items[50];
    upgrade_display.persistent_data.chocolate_spent_shop = parseLoreSpentShop(shop_milestone_item);
    upgrade_display.save();
});

function parseLoreSpentShop(item) {
    if (!item) return 0;
    let lore = item.getNBT().toObject()?.tag?.display?.Lore ?? [];
    let i = 0;
    for (; i < lore.length && !/§7Chocolate Spent: §6[\d,.]+/.test(lore[i]); i++);
    if (i == lore.length) return 0;
    return parseFloat(lore[i]?.replace(/(§7Chocolate Spent: §6|,)/g, "")) ?? 0;
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

        chocolate_spent_shop: 0,
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
        if (DeveloperSettings.event_chocolate_timer_value && value > 0)
            display_lines.push(`   &c-${toCommas(cost)} &7| &a+${toCommas(value, 2)} &7| &e${toCommas(cost / value, 2)}`);
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

    if (upgrade_display.persistent_data.chocolate_prestige && !isNaN(upgrade_display.persistent_data.chocolate_prestige)) {
        const chocolate_prestige = upgrade_display.persistent_data.chocolate_prestige + estimated_chocolate;
    
        if (upgrade_display.persistent_data.chocolate_prestige_cost && !isNaN(upgrade_display.persistent_data.chocolate_prestige_cost)) {
            const time_left = getEstimatedTimeLeft(upgrade_display.persistent_data.chocolate_prestige, upgrade_display.persistent_data.chocolate_prestige_cost, estimate);
            const time_left_string = time_left > 0 ? `&b${timeElapseStringShort(time_left)}` : "&aAvailable";
            display_lines.push("");
            display_lines.push(`&d&lPrestige:&r ${time_left_string}`);
            display_lines.push(` &e${toCommas(chocolate_prestige)}&7/&6${toCommas(upgrade_display.persistent_data.chocolate_prestige_cost)}`);
        }
        else {
            display_lines.push("");
            display_lines.push(`&d&lPrestige:&r &e${toCommas(chocolate_prestige)}`);
            // display_lines.push(` &e${toCommas(chocolate_prestige)}&7/&6${toCommas(upgrade_display.persistent_data.chocolate_prestige_cost)}`);
        }
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
            next_charge += time_tower_recharge_hours * 3.6e+6;
        }
        if (charges >= 3) time_tower_warning.register();
        else time_tower_warning.unregister();
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

const time_tower_warning = register("step", () => {
    World.playSound("random.burp", 1, 1);
}).setDelay(1);
time_tower_warning.unregister();

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
            next_charge += time_tower_recharge_hours * 3.6e+6;
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

const CHOCOLATE_CLICK_SLOT = 13;
const EMPLOYEE_FIRST_SLOT = 28;
const EMPLOYEE_LAST_SLOT = 34;
const RABBIT_BARN_SLOT = 35;
const TIME_TOWER_SLOT = 39;
const PRESTIGE_INFO_SLOT = 27;
const PRODUCTION_INFO_SLOT = 45;

requireContainer("Chocolate Factory", Settings.registerSetting("Chocolate Factory Upgrade Optimizer", "tick", (ticks_elapsed) => {
    const items = Player.getContainer().getItems();

    const chocolate_info_item = items[CHOCOLATE_CLICK_SLOT];
    const chocolate_production_item = items[PRODUCTION_INFO_SLOT];
    
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
        if (idx === CHOCOLATE_CLICK_SLOT) return;
        if (item?.getID() === 160) return;
        if (/§d§lCAUGHT!/g.test(item?.getName())) return;
        if (Settings.event_chocolate_rabbit_warning && ticks_elapsed % 3 === 0)
            World.playSound("random.successful_hit", 1, 1);
    });
    
    const chocolate_prestige = getChocolatePrestigeInfoFromLore(items[PRESTIGE_INFO_SLOT]);
    const chocolate_prestige_cost = PRESTIGE_COST[items[PRESTIGE_INFO_SLOT]?.getName()];
    let time_tower_cost = 0;
    let rabbit_shrine_cost = 0;

    upgrades_costs = items.slice(EMPLOYEE_FIRST_SLOT, 45).map((item, idx) => {
        const slot_idx = idx + EMPLOYEE_FIRST_SLOT;
        if (item?.getID() === 160) return NaN;
        const cost = getChocolateCostFromLore(item);
        let value = 0;
        
        let name = item?.getName();
        if (!name) return;
        if (isNaN(cost) && name?.startsWith("§c")) return NaN;

        if (slot_idx >= EMPLOYEE_FIRST_SLOT && slot_idx <= EMPLOYEE_LAST_SLOT) {
            const name_split = name.split("§8 - ");
            let level = name_split[1]?.replace(/[^\]]*$/g, "");
            if (level === "") level = "§7[0§7]"
            name = `${level} ${name_split[0]}`;
            
            if (!isNaN(cost)) {
                value = ((slot_idx - EMPLOYEE_FIRST_SLOT + 1) * chocolate_production.chocolate_multiplier);
                const cost_per_cps = cost / value;
                if (cost_per_cps < cheapest_value) {
                    cheapest_value = cost_per_cps;
                    cheapest_idx = slot_idx;
                    cheapest_cost = cost;
                    cheapest_name = name;
                }
            }
        }

        if (slot_idx === TIME_TOWER_SLOT) {
            time_tower_optimal = false;
            time_tower_cost = cost;
            if (!isNaN(cost)) {
                value = (chocolate_production.chocolate_per_second_raw * 0.1) / time_tower_recharge_hours;
                const cost_per_cps = cost / value;
                time_tower_optimal = cost_per_cps < cheapest_value;
            }
        }

        if (slot_idx === TIME_TOWER_SLOT + 2) {
            rabbit_shrine_cost = cost;
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
    
    if (DeveloperSettings.event_chocolate_cumulative_time_tower) {
        let time_tower_cumulative_cost = 0;
        let time_tower_cumulative_multiplier = 0;
        // [
        //     6_500_000,
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
        // ]
        // [
        //     7_000_000,
        //     14_000_000,
        //     21_000_000,
        //     28_000_000,
        //     42_000_000,
        //     56_000_000,
        //     70_000_000,
        //     84_000_000,
        //     98_000_000,
        //     112_000_000,
        //     140_000_000,
        //     168_000_000,
        //     210_000_000,
        //     280_000_000,
        // ]
        [
            7_500_000,
            15_000_000,
            22_500_000,
            30_000_000,
            45_000_000,
            60_000_000,
            75_000_000,
            90_000_000,
            105_000_000,
            120_000_000,
            150_000_000,
            180_000_000,
            225_000_000,
            300_000_000,
        ].forEach((cost, idx) => {
            if (isNaN(time_tower_cost) || time_tower_cost > cost) return;
            time_tower_cumulative_cost += cost;
            time_tower_cumulative_multiplier += 0.1;
            let value = ((chocolate_production.chocolate_per_second_raw * time_tower_cumulative_multiplier) / time_tower_recharge_hours)
            const cost_per_cps = time_tower_cumulative_cost / value;
            if (cost_per_cps > cheapest_value) return;
            upgrades[`${cost_per_cps > cheapest_value ? "&c" : "&a"}Time Tower ${idx + 2}`] = {
                cost: time_tower_cumulative_cost,
                value
            };
        });
    }

    if (DeveloperSettings.event_chocolate_cumulative_rabbit_shrine) {
        let rabbit_shine_cumulative_cost = 0;
        [
            10_000_000,
            20_000_000,
            30_000_000,
            40_000_000,
            60_000_000,
            80_000_000,
            100_000_000,
            120_000_000,
            150_000_000,
            200_000_000,
            250_000_000,
            300_000_000,
            350_000_000,
            400_000_000,
            450_000_000,
            500_000_000,
            550_000_000,
            600_000_000,
            650_000_000,
            700_000_000
        ].forEach((cost, idx) => {
            if (isNaN(rabbit_shrine_cost) || rabbit_shrine_cost > cost) return;
            rabbit_shine_cumulative_cost += cost;
            upgrades[`&eRabbit Shrine ${idx + 1}`] = {
                cost: rabbit_shine_cumulative_cost,
                value: 0
            };
        });
    }
    if (DeveloperSettings.event_chocolate_shop_milestone) {
        // upgrades[`&6Rabbit Pet Upgrade`] = {
        //     cost: 10_000_000_000,
        //     value: chocolate_production.chocolate_per_second_raw * 0.05
        // }
        
        let start_idx = 0;
        SHOP_MILESTONE.forEach((cost, idx) => {
            let base_added = 0, multiplier_added = 0;
            if (upgrade_display.persistent_data.chocolate_spent_shop >= cost) {
                start_idx = idx + 1;
                return;
            }
            for (let i = start_idx; i <= idx; i++) 
                switch (i % 6) {
                    case 0: base_added += 1; multiplier_added += 0.002; break;
                    case 1: base_added += 2; multiplier_added += 0.003; break;
                    case 2: base_added += 4; multiplier_added += 0.004; break;
                    case 3: base_added += 10; multiplier_added += 0.005; break;
                    case 4: base_added += 0; multiplier_added += 0.02; break;
                    case 5:
                        base_added += SHOP_MILESTONE_MYTHICS[Math.floor(i / 6)][0];
                        multiplier_added += SHOP_MILESTONE_MYTHICS[Math.floor(i / 6)][1];
                        break;
                }

            // if (cost - upgrade_display.persistent_data.chocolate_spent_shop <= 10_000_000_000 && !(SHOP_MILESTONE[idx + 1] && SHOP_MILESTONE[idx + 1] - upgrade_display.persistent_data.chocolate_spent_shop <= 10_000_000_000)) {
            //     upgrades[`&6Rabbit + Milestone ${toCompactCommas(cost, 1)}`] = {
            //         cost: 10_000_000_000,
            //         value: calculateUpgradeValue(chocolate_production.chocolate_per_second_raw, chocolate_production.chocolate_multiplier, base_added, 0.05 + multiplier_added)
            //     }
            // }
            const value = calculateUpgradeValue(chocolate_production.chocolate_per_second_raw, chocolate_production.chocolate_multiplier, base_added, multiplier_added)
            const cost_per_cps = (cost - upgrade_display.persistent_data.chocolate_spent_shop) / value;
            if (cost_per_cps > cheapest_value && idx != start_idx) return;

            upgrades[`&aShop Milestone ${toCompactCommas(cost, 1)}`] = {
                cost: cost - upgrade_display.persistent_data.chocolate_spent_shop,
                value: value
            }
        })
    }

    const rabbit_barn_item = items[RABBIT_BARN_SLOT];
    const [rabbit_count, rabbit_barn_capacity] = getRabbitBarnInfoFromLore(rabbit_barn_item);

    const time_tower_item = items[TIME_TOWER_SLOT];
    const time_tower_locked = time_tower_item?.getName()?.startsWith("§c") ?? true;
    const time_tower_info = getTimeTowerTowerInfoFromLore(time_tower_item);

    if (chocolate !== last_chocolate) {
        if (last_chocolate) {
            const earned = chocolate - last_chocolate;
            last_chocolate_earned.push({string: ChatLib.addColor(`${earned >= 0? "&e+" : "&c"}${toCommas(earned)}`), time: Date.now(), offset_x: Math.random(), offset_y: Math.random()});
            last_chocolate_earned = last_chocolate_earned.filter((data) => Date.now() - data.time < 4_000);
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

function calculateUpgradeValue(cps_raw, cps_multiplier, base_added, multiplier_added) {
    return (cps_raw * multiplier_added) + ((cps_multiplier + multiplier_added) * base_added);
}

requireContainer("Chocolate Factory", Settings.registerSetting("Chocolate Factory Upgrade Optimizer", "renderSlot", (slot) => {
    const idx = slot.getIndex();
    const [x, y] = [slot.getDisplayX() - 1, slot.getDisplayY() - 1];

    if (idx < 27 || idx >= 54) return;

    if (idx !== cheapest_idx && !(idx === 39 && time_tower_optimal)) {
        if (isNaN(upgrades_costs[idx - EMPLOYEE_FIRST_SLOT])) return;
        if (upgrade_display.persistent_data.chocolate < upgrades_costs[idx - EMPLOYEE_FIRST_SLOT])
            highlightSlot(x, y, Renderer.color(255, 85, 85, 85));
        else
            highlightSlot(x, y, Renderer.color(85, 255, 85, 85));
        return;
    };
    
    GlStateManager.func_179140_f();
    if (upgrade_display.persistent_data.chocolate < upgrades_costs[idx - EMPLOYEE_FIRST_SLOT])
        highlightSlot(x, y, Renderer.color(255, 85, 85, 127), Renderer.color(255, 85, 85));
    else
        highlightSlot(x, y, Renderer.color(85, 255, 85, 127), Renderer.color(85, 255, 85));
}));
requireContainer("Chocolate Factory", Settings.registerSetting("Chocolate Factory Rabbit Warning", "renderSlot", (slot) => {
    const idx = slot.getIndex();
    const [x, y] = [slot.getDisplayX() - 1, slot.getDisplayY() - 1];
    if (idx === CHOCOLATE_CLICK_SLOT) return;
    if (slot?.getItem()?.getID() === 160) return;
    if (/§d§lCAUGHT!/g.test(slot?.getItem()?.getName())) return;
    // if (!/(§e§lCLICK ME!|§6§lGolden Rabbit.*)/g.test(slot?.getItem()?.getName())) return;

    if (idx < 27 && idx !== CHOCOLATE_CLICK_SLOT) {
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
        ChatLib.command("cf", true);
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
    Tessellator.enableBlend();

    const date_now = Date.now();
    last_chocolate_earned.forEach((data) => {
        const uneased_t = (date_now - data.time) / 4_000;
        if (uneased_t > 1 || uneased_t < 0) return;
        const t = easeOutCubic(uneased_t);
        Renderer.translate(center_x + 110 + ((data.offset_x - 0.5) * 21 * t), center_y - 115 - ((data.offset_y + 10) * 4 * t))
        Renderer.getFontRenderer().func_175065_a(
            data.string, 0, 0, Renderer.color(255, 255, 255, Math.floor((1 - t) * 250) + 4), false
        );
        Renderer.finishDraw();
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
    for (; i < lore.length && !/§7Your Barn: §[ac]\d+§7\/§[ac]\d+ Rabbits/.test(lore[i]); i++);
    if (i == lore.length) return [NaN, NaN];
    return [
        parseInt(lore[i]?.replace(/(§7Your Barn: §[ac]|§7\/§[ac]\d+ Rabbits)/g, "")),
        parseInt(lore[i]?.replace(/(§7Your Barn: §[ac]\d+§7\/§[ac]| Rabbits)/g, ""))
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
    "§6Chocolate Factory V" : 30_000_000_000,
    "§6Chocolate Factory VI" : NaN,
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

var warned = false;
var last_pet = undefined;
function checkForRabbit() {
    let names = getTabListNamesSafe();
    if (!names || names.length === 0) return false;
    let idx = 20;
    for (; !names[idx]?.startsWith("§r§e§lPet:§r") && idx < names.length; idx++);

    return /^§r §r§7\[Lvl \d+\] §r§dRabbit/.test(names[idx + 1]);
}
// [CHAT] &r&r[32] "&r&e&lPet:&r"&r
// [CHAT] &r&r[33] "&r &r&7[Lvl 100] &r&dRabbit&r&5 ✦&r"&r
// [CHAT] &r&r[34] "&r &r&6+&r&e33,533,079.3 XP&r"&r
// [CHAT] &r&r[35] "&r"&r
register("command", () => {
    if (!checkForRabbit() && !warned) {
        ChatLib.chat("&c&lRABBIT PET NOT DETECTED");
        ChatLib.chat(" &erun /cf again to open the chocolate factory");
        World.playSound("random.anvil_land", 1, 1);
        warned = true;
        return;
    }
    
    warned = false;
    ChatLib.command("cf", false);
}).setName("cf");

// {
//     id: "minecraft:skull",
//     Count: 1b,
//     tag: {
//         SkullOwner: {
//             Id: "794465b5-3bd2-38fc-b02f-0b51d782e201",
//             Properties: {
//                 textures: [{
//                     Value: "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvZDE3YmRjYzljYWQ1YjJhYzJkYjQwYzU3NjEzNDljMzNlNDBhYjEwOGRkYThjZmE3ODhlOGNmZWExMTNkNGE3YyJ9fX0="
//                 }]
//             }
//         },
//         display: {
//             Lore: ["§7Grants §6+9,513,262 Chocolate§7!", "", "§e§lCLICK ME!"],
//             Name: "§6§lGolden Rabbit §8- §aJackpot!"
//         }
//     },
//     Damage: 3s
// }
// {
//     id: "minecraft:skull",
//     Count: 1b,
//     tag: {
//         SkullOwner: {
//             Id: "855b4e59-61ab-3149-b606-57be75bc6f01",
//             Properties: {
//                 textures: [{
//                     Value: "ewogICJ0aW1lc3RhbXAiIDogMTcxMTYzNTA4MTAyNywKICAicHJvZmlsZUlkIiA6ICJkN2JjNjA0MDRlNjg0MjM2OTVhODk0ZjNjZjM5MjVmNCIsCiAgInByb2ZpbGVOYW1lIiA6ICJfQ3liZXJEZW1vbl8iLAogICJzaWduYXR1cmVSZXF1aXJlZCIgOiB0cnVlLAogICJ0ZXh0dXJlcyIgOiB7CiAgICAiU0tJTiIgOiB7CiAgICAgICJ1cmwiIDogImh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvMTM3ZjZiZDVlN2M0ZThmYjIyYzg4ZWIwOTUzNzA3OWJkM2Q0YzE0NGNmNWEzNzZjZTZmMjAzMDExMGJkMTY4MCIKICAgIH0KICB9Cn0"
//                 }]
//             }
//         },
//         display: {
//             Lore: ["§7You caught a stray §fAugustus §7and", "§7gained §6+302,984 Chocolate§7!"],
//             Name: "§fAugustus §d§lCAUGHT!"
//         }
//     },
//     Damage: 3s
// }

