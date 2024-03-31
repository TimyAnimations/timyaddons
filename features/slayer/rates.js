import { timeElapseStringShort } from "../../utils/format";
import { MoveableDisplay } from "../../utils/moveable_display";
import Settings from "../../utils/settings/main";

var start = undefined;
var session = [];
var session_start = undefined;
var bosses = 0;
var xp_per_boss = 1_500;
var last_boss_message = "";

var mayor_data = undefined;
var xp_per_boss_multiplier = 1.0;

register("worldLoad", () => {
    if ( mayor_data && Date.now() - (mayor_data["lastUpdated"] ?? 0) < 3_600_000 )
        return;

    let data = FileLib.getUrlContent("https://api.hypixel.net/v2/resources/skyblock/election");
    mayor_data = JSON.parse(data);

    let perks = mayor_data?.mayor?.perks;
    if (!perks) return;

    xp_per_boss_multiplier = 1.0;
    perks.forEach(perk => {
        if (perk?.name === "Slayer XP Buff")
            xp_per_boss_multiplier = 1.25;
    });
})

const XP_MESSAGES = {
    "&r   &5&l» &7Slay &c6,000 Combat XP &7worth of Zombies&7.&r": 1500,
    "&r   &5&l» &7Slay &c4,800 Combat XP &7worth of Zombies&7.&r": 500,
    "&r   &5&l» &7Slay &c2,400 Combat XP &7worth of Zombies&7.&r": 100,
    "&r   &5&l» &7Slay &c1,440 Combat XP &7worth of Zombies&7.&r": 25,
    "&r   &5&l» &7Slay &c150 Combat XP &7worth of Zombies&7.&r": 5,

    "&r   &5&l» &7Slay &c2,000 Combat XP &7worth of Spiders&7.&r": 500,
    "&r   &5&l» &7Slay &c1,000 Combat XP &7worth of Spiders&7.&r": 100,
    "&r   &5&l» &7Slay &c600 Combat XP &7worth of Spiders&7.&r": 25,
    "&r   &5&l» &7Slay &c250 Combat XP &7worth of Spiders&7.&r": 5,

    "&r   &5&l» &7Slay &c3,168 Combat XP &7worth of Wolves&7.&r": 500,
    "&r   &5&l» &7Slay &c1,584 Combat XP &7worth of Wolves&7.&r": 100,
    "&r   &5&l» &7Slay &c648 Combat XP &7worth of Wolves&7.&r": 25,
    "&r   &5&l» &7Slay &c270 Combat XP &7worth of Wolves&7.&r": 5,

    "&r   &5&l» &7Slay &c22,000 Combat XP &7worth of Endermen&7.&r": 500,
    "&r   &5&l» &7Slay &c11,000 Combat XP &7worth of Endermen&7.&r": 100,
    "&r   &5&l» &7Slay &c6,600 Combat XP &7worth of Endermen&7.&r": 25,
    "&r   &5&l» &7Slay &c2,750 Combat XP &7worth of Endermen&7.&r": 5,

    "&r   &5&l» &7Slay &c36,000 Combat XP &7worth of Blazes&7.&r": 500,
    "&r   &5&l» &7Slay &c18,000 Combat XP &7worth of Blazes&7.&r": 100,
    "&r   &5&l» &7Slay &c14,400 Combat XP &7worth of Blazes&7.&r": 25,
    "&r   &5&l» &7Slay &c6,000 Combat XP &7worth of Blazes&7.&r": 5,

    "&r   &5&l» &7Slay &c900 Combat XP &7worth of Vampires&7.&r": 150,
    "&r   &5&l» &7Slay &c750 Combat XP &7worth of Vampires&7.&r": 120,
    "&r   &5&l» &7Slay &c600 Combat XP &7worth of Vampires&7.&r": 60,
    "&r   &5&l» &7Slay &c450 Combat XP &7worth of Vampires&7.&r": 25,
    "&r   &5&l» &7Slay &c360 Combat XP &7worth of Vampires&7.&r": 10,
}
for (let message in XP_MESSAGES) {
    const this_message = message;
    Settings.registerSetting("Track Slayer Rates", "chat", () => { 
        xp_per_boss = XP_MESSAGES[this_message];
        if (last_boss_message !== this_message) {
            resetState();
            session_start = Date.now();
            start = Date.now();
            session_display.show();
            last_boss_message = this_message;
        }
    }).setCriteria(this_message);
}

var session_display = new MoveableDisplay("slayer_rates");
session_display.setLine(0, `&cSession Time:&6 0s`);
session_display.setLine(1, `&cSession Stats:`);
session_display.setLine(2, `   &60 &rbosses`);
session_display.setLine(3, `   &60 &rxp`);
session_display.setLine(4, `&cSession Rates:`);
session_display.setLine(5, `   &60s &raverage`);
session_display.setLine(6, `   &60 &rboss/hour`);
session_display.setLine(7, `   &60 &rxp/hour`);
session_display.hide();

export function getSlayerRatesDisplay() {
    return session_display;
}

Settings.slayer_rates_open_gui = () => {
    session_display.edit();
};

function resetState() {
    start = undefined;
    session = [];
    session_start = undefined;
    bosses = 0;
    last_boss_message = "";

    session_display.setLine(0, `&cSession Time:&6 0s`);
    session_display.setLine(2, `   &60 &rbosses`);
    session_display.setLine(3, `   &60 &rxp`);
    session_display.setLine(5, `   &60s &raverage`);
    session_display.setLine(6, `   &60 &rboss/hour`);
    session_display.setLine(7, `   &60 &rxp/hour`);
    session_display.hide();
}

function toCommas(value) {
    return value.toFixed().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

Settings.registerSetting("Track Slayer Rates", "chat", () => {
    start = Date.now();
}).setCriteria("&r  &r&5&lSLAYER QUEST STARTED!&r");

Settings.registerSetting("Track Slayer Rates", "chat", (event) => {
    if (!start) return;
    bosses++;
    let elapsed = Date.now() - start;
    session.push(elapsed);
    let average = session.reduce((prev, current) => prev + current) / session.length;
    let boss_per_hour = 3_600_000 / average;
    cancel(event);
    ChatLib.chat(
        `&r  &r&a&lSLAYER QUEST COMPLETE!&r\n&r   &r&6Time Elapsed &7- &6${timeElapseStringShort(elapsed)}`
    );
    session_display.setLine(2, `   &6${bosses} &rbosses`);
    session_display.setLine(3, `   &6${toCommas(bosses * (xp_per_boss * xp_per_boss_multiplier))} &rxp`);
    session_display.setLine(5, `   &6${timeElapseStringShort(average)} &raverage`);
    session_display.setLine(6, `   &6${(boss_per_hour).toFixed(2)} &rboss/hour`);
    session_display.setLine(7, `   &6${toCommas(boss_per_hour * (xp_per_boss * xp_per_boss_multiplier))} &rxp/hour`);
    session_display.show();
}).setCriteria("&r  &r&a&lSLAYER QUEST COMPLETE!&r");

Settings.registerSetting("Track Slayer Rates", "step", () => {
    if (!session_start) return;
    session_display.setLine(0, `&cSession Time:&6 ${timeElapseStringShort(Date.now() - session_start)}`);
    // session_display.setLine(8, `&cMultiplier:&6 ${xp_per_boss_multiplier}`);
}).setDelay(1);
Settings.registerSetting("Track Slayer Rates", "chat", resetState)
    .setCriteria("&r&aYour Slayer Quest has been cancelled!&r");
Settings.registerSetting("Track Slayer Rates", "worldLoad", resetState);
Settings.addAction("Track Slayer Rates", resetState);

register("command", resetState).setName("slayerratereset");
