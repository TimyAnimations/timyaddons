import Settings from "../../utils/settings/main"
import { MoveableDisplay } from "../../utils/moveable_display"
import { repeatSound } from "../../utils/sound";
import { timeElapseStringShort } from "../../utils/format";

var broodmother_state = undefined;
var broodmother_spawning_time = undefined;
var broodmother_display = new MoveableDisplay("broodmother_display");

export function getBroodmotherDisplay() {
    return broodmother_display;
}

broodmother_display.setLine(0, `&4Broodmother&7 - &r0s`);
broodmother_display.hide();
var last_minute_warned_time = undefined;
var last_seconds_warned_time = undefined;
var last_spawn_warned_time = undefined;

Settings.bestiary_broodmother_open_gui = () => {
    broodmother_display.edit();
};

var broodmother_state_from_scoreboard = false;

const BROODMOTHER_SPAWN_TIME = {
    "§eSlain": 600_000,
    "§eDormant": 540_000,
    "§6Soon": 360_000,
    "§6Awakening": 180_000,
    "§4Imminent": 60_000,
    "§4Alive!": -50,
};
const BROODMOTHER_STATES = ["§eDormant", "§6Soon", "§6Awakening", "§4Imminent", "§4Alive!", "§eSlain"];

// §r Broodmother: §r§4Imminent§r
// §r Broodmother: §r§4Alive!§r
// §r Broodmother: §r§eSlain§r
// §r Broodmother: §r§eDormant§r
// §r Broodmother: §r§6Soon§r
// §r Broodmother: §r§6Awakening§r
function getBroodmotherState() {
    let lines = Scoreboard?.getLines();
    if (!lines) return;

    let i = 0;
    for (;i < lines.length && !lines[i]?.getName().startsWith("§4Broodmother§7:🎁§7 "); i++);
    if (i === lines.length) { // get tab instead
        
        if (!TabList) return undefined;
        let names = TabList.getNames();
        if (!names) return undefined;
        
        let idx = 20; //&r&4&lPests:&r
        for (; !names[idx]?.startsWith("§r Broodmother: §r") && idx < names.length; idx++);
        
        if (idx === names.length) return undefined;
        
        let tab_state = names[idx]?.slice("§r Broodmother: §r".length, -2)
        if (broodmother_state_from_scoreboard && BROODMOTHER_STATES.indexOf(tab_state) < BROODMOTHER_STATES.indexOf(broodmother_state))
            return broodmother_state;
        
        broodmother_state_from_scoreboard = false;
        return tab_state;
    }

    broodmother_state_from_scoreboard = true;
    return lines[i]?.getName().slice("§4Broodmother§7:🎁§7 ".length)
}

function resetBroodmotherState() {
    broodmother_state = undefined;
    broodmother_spawning_time = undefined;
    last_minute_warned_time = undefined;
    last_seconds_warned_time = undefined;
    last_spawn_warned_time = undefined;
    broodmother_display.hide();
    broodmother_display.setLine(0, `&4Broodmother&7 - &r0s`);
}

Settings.registerSetting("Broodmother Respawn Warning", "tick", () => {
    let current_broodmother_state = getBroodmotherState();
    
    if (!current_broodmother_state) return;
    if (broodmother_state === current_broodmother_state) return;

    // ChatLib.chat(`"${broodmother_state}" => "${current_broodmother_state}"`);
    broodmother_state = current_broodmother_state;
    let world_time = Date.now();
    let next_spawning_time = world_time + BROODMOTHER_SPAWN_TIME[current_broodmother_state];
    if (!broodmother_spawning_time || current_broodmother_state === "§eSlain" || 
        world_time > broodmother_spawning_time || next_spawning_time < broodmother_spawning_time)
    {
        broodmother_spawning_time = next_spawning_time;
    }
}).requireArea("Spider's Den");

Settings.registerSetting("Broodmother Respawn Warning", "tick", () => {
    if (!broodmother_state || !broodmother_spawning_time) return;
    let time_left = broodmother_spawning_time - Date.now();
    
    if (time_left < 1_000 && (!last_spawn_warned_time || last_spawn_warned_time < (broodmother_spawning_time - 599_000))) {
        last_spawn_warned_time = Date.now();
        ChatLib.chat(`&4&lBROODMOTHER IS RESPAWNING!`);
        repeatSound("random.successful_hit", 1, 1, 5, 100);
        return;
    }
    if (time_left < 10_000 && (!last_seconds_warned_time || last_seconds_warned_time < (broodmother_spawning_time - 599_000))) {
        last_seconds_warned_time = Date.now();
        ChatLib.chat(`&cBroodmother respawning in 10 second!`);
        World.playSound("random.successful_hit", 0.5, 1);
        return;

    }
    if (time_left < 60_000 && (!last_minute_warned_time || last_minute_warned_time < (broodmother_spawning_time - 599_000))) {
        last_minute_warned_time = Date.now();
        ChatLib.chat(`&cBroodmother respawning in 1 minute!`);
        return;
    }
}).requireArea("Spider's Den");

Settings.registerSetting("Broodmother Respawn Warning", "tick", () => {
    if (!Settings.bestiary_broodmother_timer || !broodmother_state || !broodmother_spawning_time) return;
    broodmother_display.show()
    broodmother_display.setLine(0, `&4Broodmother&7 - &r${
        broodmother_spawning_time > Date.now()
            ? timeElapseStringShort((broodmother_spawning_time - Date.now()))
            : "&cALIVE!!!"
    }`);
}).requireArea("Spider's Den");

Settings.addAction("Broodmother Respawn Warning", resetBroodmotherState);
Settings.registerSetting("Broodmother Respawn Warning", "worldLoad", resetBroodmotherState);



