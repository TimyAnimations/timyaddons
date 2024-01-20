import Settings from "../../utils/settings/main";
import { queueCommand } from "../../utils/command_queue";

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
});