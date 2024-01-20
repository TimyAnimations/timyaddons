import Settings from "../utils/settings/main";
import { repeatSound } from "../utils/sound";

var last_stack = "0";
Settings.registerSetting("Full Dominus Stack Warning", "actionBar", (stack, event) => {
    if (last_stack === "&l10" && stack === "9") {
        Client.showTitle("&c&lDominus Stacks!", "", 0, 50, 10);
        repeatSound("random.successful_hit", 1, 1, 5, 100);
    }
    last_stack = stack;
}).setCriteria(" &6${stack}ᝐ").setContains();
