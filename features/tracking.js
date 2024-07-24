import { timeElapseStringShort, timeElapseStringShortSingleUnit, timeElapseStringShortSingleUnitHours, toCommas, toCompactCommas } from "../utils/format";
import { MoveableDisplay } from "../utils/moveable_display";
import Settings from "../utils/settings/main";

const avarice_coin_gui = new MoveableDisplay("avarice_coin", 10, 300);
export function getAvariceCoinDisplay() {
    return avarice_coin_gui;
}

avarice_coin_gui.hide();
Settings.addAction("Avarice Tracker", (value) => {
    if (!value)
        avarice_coin_gui.hide();
})
Settings.combat_avarice_tracker_open_gui = () => {
    avarice_coin_gui.edit();
};

var start_coins = undefined;
var start_coins_time = undefined;

const milestones = [
    1_000,
    10_000,
    100_000,
    1_000_000,
    10_000_000,
    100_000_000,
    1_000_000_000
]

Settings.registerSetting("Avarice Tracker", "tick", () => {
    const player = Player.asPlayerMP();
    const helmet = player.entity?.func_71124_b(4);
    avarice_coin_gui.clearLines();
    if (!helmet) {
        start_coins = undefined;
        start_coins_time = undefined;
        avarice_coin_gui.hide();
        return;
    };
    const helmet_item = new Item(helmet);
    const helmet_data = helmet_item.getNBT()?.toObject();
    const helmet_id = helmet_data?.tag?.ExtraAttributes?.id;
    if (helmet_id !== "CROWN_OF_AVARICE") {
        start_coins = undefined;
        start_coins_time = undefined;
        avarice_coin_gui.hide();
        return;
    }
    
    const coins = parseInt(helmet_data?.tag?.ExtraAttributes?.collected_coins);
    avarice_coin_gui.show();
    avarice_coin_gui.addLine(
        `&6&lCrown of Avarice:`,
        ` &e${toCommas(coins, 0)} &6coins`
    );
    
    const now = Date.now();
    if (isNaN(coins)) return;
    if (start_coins === undefined || start_coins === coins) {
        start_coins = coins;
        start_coins_time = now;
        return;
    }

    const elapsed_time = now - start_coins_time;
    const earned_coins = coins - start_coins;
    const coins_per_hour = (3.6e+6 * earned_coins / elapsed_time)
    const milestone_lines = milestones.reduce((cumm, curr) => {
        if (coins > curr) return cumm;
        const time_until = ((curr - coins) * elapsed_time / earned_coins);
        return [...cumm, ` &b${timeElapseStringShortSingleUnitHours(time_until)} &3till ${toCompactCommas(curr, 0)}`];
    }, []);

    avarice_coin_gui.addLine(
        `&6&lSession: &r${timeElapseStringShort(elapsed_time)}`,
        ` &e${toCommas(earned_coins, 0)} &6earned`,
        ` &e${toCommas(coins_per_hour, 0)} &6coins/hour`,
        ...milestone_lines
    );

});

Settings.registerSetting("Avarice Tracker", "worldLoad", () => {
    start_coins = undefined;
    start_coins_time = undefined;
    avarice_coin_gui.hide();
});

/*
{
    id: "minecraft:skull",
    Count: 1b,
    tag: {
        ench: [{
            lvl: 3s,
            id: 5s
        }, {
            lvl: 1s,
            id: 6s
        }],
        HideFlags: 254,
        SkullOwner: {
            Id: "78cf2906-63e0-3a5b-b27b-1519ac4e9313",
            Properties: {
                textures: [{
                    Value: "ewogICJ0aW1lc3RhbXAiIDogMTcxMDg1MDEzMTk0NSwKICAicHJvZmlsZUlkIiA6ICJmNzcxMDI1NGMzYWY0YjA5YmRjY2NiNDRjNjg1NjFiMCIsCiAgInByb2ZpbGVOYW1lIiA6ICJDZXJ1c1YyIiwKICAidGV4dHVyZXMiIDogewogICAgIlNLSU4iIDogewogICAgICAidXJsIiA6ICJodHRwOi8vdGV4dHVyZXMubWluZWNyYWZ0Lm5ldC90ZXh0dXJlLzliNjBkNmY2NTU3NTIwYzBjYjBkZmMwYTExOTNmMjNhMmYyOWRlNTJjMThkYmI3NDZlNGExYTk5ZjE4ZGM2MWMiCiAgICB9CiAgfQp9"
                }]
            }
        },
        display: {
            Lore: ["§7Strength: §c+12 §9(+12)", "§7Crit Chance: §c+12% §9(+12%)", "§7Crit Damage: §c+12% §9(+12%)", "§7Bonus Attack Speed: §c+15% §9(+15%)", "§7Health: §a+305 §e(+60) §9(+10)", "§7Defense: §a+170 §e(+30) §9(+10)", "§7Speed: §a+1 §9(+1)", "§7Intelligence: §a+12 §9(+12)", "§7Health Regen: §a+10", "", "§9Aqua Affinity I", "§9Growth V", "§9Protection V", "§9Rejuvenate V", "§9Respiration III", "§9Transylvanian V", "", "§6Ability: Indulgence ", "§7Coins you collect from killing mobs", "§7are consumed by the helmet. Gain", "§7§c+0.015x§c❁ Damage §7and §b+0.6✯ Magic", "§bFind §7for each digit of coins collected.", "§7§8(Capped at 1B)", "", "§7Collected Coins: §6684,276", "  §c+1.09x§c❁ Damage", "  §b+3.6✯ Magic Find", "", "§9Renowned Bonus", "§7Increases most stats by §a+1%§7.", "", "§8§l* §8Co-op Soulbound §8§l*", "§d§l§ka§r §d§l§d§lMYTHIC HELMET §d§l§ka"],
            Name: "§dRenowned Crown of Avarice"
        },
        ExtraAttributes: {
            rarity_upgrades: 1,
            hot_potato_count: 15,
            collected_coins: 684276L,
            modifier: "renowned",
            originTag: "UNKNOWN",
            id: "CROWN_OF_AVARICE",
            enchantments: {
                rejuvenate: 5,
                growth: 5,
                protection: 5,
                transylvanian: 5,
                respiration: 3,
                aqua_affinity: 1
            },
            uuid: "346109ff-2171-4061-9b3f-a2e1cc89b5af",
            donated_museum: 1b,
            timestamp: 1619417760000L
        }
    },
    Damage: 3s
}
*/