import Settings from "../../utils/settings/main";
import { queueCommand } from "../../utils/command_queue";
import { getScoreboardLinesSafe, getTabListNamesSafe, registerArea } from "../../utils/skyblock";
import { repeatSound } from "../../utils/sound";
import { showTitle } from "../../utils/render";

Settings.registerSetting("Autoshow Extra Stats", "chat", (event) => {
    bar_count = 2;
    bar_trigger.register();
    header_trigger.register();
    score_trigger.register();
    time_trigger.register();
    queueCommand("showextrastats");
    cancel(event);
}).setCriteria("&r&f                             &6> &e&lEXTRA STATS &6<&r");

var bar_count = 0;
const bar_trigger = register("chat", (event) => {
    if (--bar_count <= 0)
        bar_trigger.unregister();
    cancel(event);
}).setCriteria("&r&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬&r");

const header_trigger = register("chat", (event) => {
    header_trigger.unregister();
    cancel(event);
}).setCriteria("&r&f               &r${*}&r&8- &r${*}&r");

const score_trigger = register("chat", (event) => {
    score_trigger.unregister();
    cancel(event);
}).setCriteria("&r&f                           &r&fTeam Score: &r${*}&r${*}&r");

const time_trigger = register("chat", (event) => {
    time_trigger.unregister();
    cancel(event);
}).setCriteria("&r&f                      &r&c☠ &r&eDefeated &r${*}&r&ein &r${*}&r");

bar_trigger.unregister();
header_trigger.unregister();
score_trigger.unregister();
time_trigger.unregister();

register("worldUnload", () => {
    bar_trigger.unregister();
    header_trigger.unregister();
    score_trigger.unregister();
    time_trigger.unregister();
    current_class = undefined;
});

var count = 0;
Settings.registerSetting("Tank Low Health Warning", "tick", () => {
    if (Settings.dungeon_warn_tank_low_health === 1 && getDungeonClass() !== "Healer" && Player.getXPLevel() > 0) return;
    let lines = getScoreboardLinesSafe();
    lines.forEach((line) => {
        if (/§e\[[T]\] §[0-9a-f].* §[ce][\d,]+/.test(line.getName())) {
            let health = line.getName().replace(/§e\[[T]\] §[0-9a-f].* /, "");
            if (health.startsWith("§c")) {
                showTitle(`&c&lTANK CRITICAL&r`, `&c❤ &r${health.replace(/[^\d,]/g, "")}`, 0, 2, 0);
                if (count++ === 0)
                    World.playSound("random.successful_hit", 1, 1);
                count %= 4;  
                return;
            }
            showTitle(`&eTANK LOW&r`, `&c❤ &r${health.replace(/[^\d,]/g, "")}`, 0, 2, 0);
        }
    })
}).requireArea("Dungeon");

var current_class = undefined;
function getDungeonClass() {
    if (current_class)
        return current_class;
    
    let tab = getTabListNamesSafe()[1];
    if (!tab) return undefined;

    tab.match(/§f\(§r§d\w+ /g)?.forEach((match) => {
        current_class = match.slice("§f(§r§d".length).trim();
    });

    return current_class;
}