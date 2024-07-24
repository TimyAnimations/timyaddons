import { timeElapseStringShort } from "../../utils/format";
import { drawWorldString } from "../../utils/render";
import Settings from "../../utils/settings/main";

class TickTimer {
    #tick = 0;

    constructor(tick = global_tick) {
        this.#tick = tick;
    }
    static get tick() {
        return global_tick + Tessellator.getPartialTicks();
    }
    get tick() {
        return TickTimer.tick - this.#tick;
    }
    set tick(val) {
        this.#tick = val;
    }
}

var global_tick = 0;
var world_tick = undefined;
var last_world_tick = undefined;
var world_timers = [];
register("tick", (tick) => {
    if (World.isLoaded()) {
        last_world_tick = world_tick;
        world_tick = World.getTime();
    }
    else {
        world_tick = undefined;
    }
    global_tick += world_tick && last_world_tick && world_tick >= last_world_tick && world_tick - last_world_tick < 5 
                    ? world_tick - last_world_tick
                    : 1;
    world_timers = world_timers.filter(([x, y, z, end, color_code]) => global_tick <= end);
});

register("worldUnload", () => world_tick = undefined);

register("renderWorld", (partial_tick) => {
    world_timers.forEach(([x, y, z, end, color_code, label], idx) => {
        const diff = (end - (global_tick + partial_tick));
        if (diff > 0) drawWorldString(`${color_code}${timeElapseStringShort(diff * 1_000 / 20, 2)}`, x, y, z, 1.0, true, false);
    });
});

// register("renderOverlay", () => {
//     Renderer.drawString(`${TickTimer.tick}`, 300, 300);
//     Renderer.drawString(`${world_tick}`, 300, 309);
//     const diff = world_tick - last_world_tick;
//     Renderer.drawString(`${diff < 0 || isNaN(diff) ? "&c" : "&a"}${diff}`, 300, 318);
//     world_timers.forEach(([x, y, z, end, color_code, label], idx) => {
//         var diff = (end - (global_tick + Tessellator.getPartialTicks())) * 1_000 / 20;
//         if (diff < 0) diff = 0;
//         Renderer.drawString(`${color_code}${label ?? ""}${label ? ": " : ""}${timeElapseStringShort(diff, 2)}&r`, 300, 327 + (9 * idx));
//     });
// });

export function addWorldTimer(x, y, z, duration_ticks, color_code = "§r", label = undefined) {
    world_timers.push([x, y, z, global_tick + duration_ticks, color_code, label]);
}

Settings.registerSetting("Sadan Giant Spawn Timers", "chat", () => {
    addWorldTimer(-17, 82, 53, 64, "§d", "Giant");
    addWorldTimer(-17, 82, 79, 84, "§b", "Giant");
    addWorldTimer(-1, 82, 79, 104, "§a", "Giant");
    addWorldTimer(-1, 82, 53, 124, "§c", "Giant");
}).setCriteria("&r&c[BOSS] Sadan&r&f: My giants! Unleashed!&r");

Settings.registerSetting("Sadan Giant Spawn Timers", "chat", () => {
    addWorldTimer(-8, 71, 80, 72, "§6", "Sadan");
}).setCriteria("&r&c[BOSS] Sadan&r&f: Maybe in another life. Until then, meet my ultimate corpse.&r");


// register("command", (duration) => {
//     addWorldTimer(Player.getX(), Player.getY(), Player.getZ(), parseInt(duration), "§r");
// }).setName("testworldtimer");
// 5206958.058841586
// 5207021.460428834
// 5207040.398150831
// 5207060.69934994
// 5207080.780300438

// 5207256.5007894635
// 5207328.162687883


/*
[CHAT] &r&c[BOSS] Sadan&r&f: So you made it all the way here... Now you wish to defy me? Sadan?!&r
[CHAT] &r&c[BOSS] Sadan&r&f: The audacity! I have been the ruler of these floors for a hundred years!&r
[CHAT] &r&c[BOSS] Sadan&r&f: I am the bridge between this realm and the world below! You shall not pass!&r
[CHAT] &r&eYour bone plating reduced the damage you took by &r&c3,595.2&r&e!&r
[CHAT] &r&cThis ability is on cooldown for 30s.&r
[CHAT] &r&e&lArcher Milestone &r&e❺&r&7: You have dealt &r&c50,000,000&r&7 Ranged Damage so far! &r&a04m 19s&r
[CHAT] &r&e&lArcher Milestone &r&e❻&r&7: You have dealt &r&c75,000,000&r&7 Ranged Damage so far! &r&a04m 19s&r
[CHAT] &r&e&lArcher Milestone &r&e❼&r&7: You have dealt &r&c100,000,000&r&7 Ranged Damage so far! &r&a04m 19s&r
[CHAT] &r&a&l+5 Kill Combo &r&8&r&b+3✯ Magic Find&r
[CHAT] &r&e&lArcher Milestone &r&e❽&r&7: You have dealt &r&c125,000,000&r&7 Ranged Damage so far! &r&a04m 19s&r
[CHAT] &r&e&lArcher Milestone &r&e❾&r&7: You have dealt &r&c150,000,000&r&7 Ranged Damage so far! &r&a04m 19s&r
[CHAT] &r&a&l+10 Kill Combo &r&8+&r&610 &r&7coins per kill&r
[CHAT] &r&9&l+15 Kill Combo &r&8&r&b+3✯ Magic Find&r
[CHAT] &r&5&l+20 Kill Combo &r&8&r&3+15☯ Combat Wisdom&r
[CHAT] &r&c[BOSS] Sadan&r&f: My Terracotta Army wasn't enough? You had to awaken a Golem on top, &r&bTimy&r&r&r?!&r
[CHAT] &r&6Rapid Fire&r&a is ready to use! Press &r&6&lDROP&r&a to activate it!&r
[CHAT] &r&5&l+25 Kill Combo &r&8&r&b+3✯ Magic Find&r
[CHAT] &r&c[BOSS] Sadan&r&f: How many more of my Golems will you disturb, &r&bTimy&r&r&r?&r
[CHAT] &r&cYour Kill Combo has expired! You reached a 26 Kill Combo!&r
[CHAT] &r&c[BOSS] Sadan&r&f: All my Golems want is some peace and quiet! Can you not, &r&bTimy&r&r&r?!&r
[CHAT] &r&a&l+5 Kill Combo &r&8&r&b+3✯ Magic Find&r
[CHAT] &r&a&l+10 Kill Combo &r&8+&r&610 &r&7coins per kill&r
[CHAT] &r&c[BOSS] Sadan&r&f: How many more of my Golems will you disturb, &r&bTimy&r&r&r?&r
[CHAT] &r&eYour bone plating reduced the damage you took by &r&c6,027.2&r&e!&r
[CHAT] &r&9&l+15 Kill Combo &r&8&r&b+3✯ Magic Find&r
[CHAT] &r&c[BOSS] Sadan&r&f: ENOUGH!&r
[CHAT] &r&c[BOSS] Sadan&r&f: My giants! Unleashed!&r
[CHAT] &r&cYour Kill Combo has expired! You reached a 19 Kill Combo!&r
[CHAT] &r&c[BOSS] Sadan&r&f: How many players does it take to kill a Giant?&r
[CHAT] &r&c[BOSS] Sadan&r&f: You did it. I understand now, you have earned my respect.&r
[CHAT] &r&c[BOSS] Sadan&r&f: If only you had become my disciples instead of this incompetent bunch.&r
[CHAT] &r&6Rapid Fire&r&a is ready to use! Press &r&6&lDROP&r&a to activate it!&r
[CHAT] &r&aYou earned &r&211 GEXP &r&a+ &r&e1,230 Event EXP &r&afrom playing SkyBlock!&r
[CHAT] &r&c[BOSS] Sadan&r&f: Maybe in another life. Until then, meet my ultimate corpse.&r
[CHAT] &r&c[BOSS] Sadan&r&f: I'm sorry, but I need to concentrate. I wish it didn't have to come to this.&r
[CHAT] &r&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬&r
[CHAT] &r&f                        &r&cThe Catacombs &r&8- &r&eFloor VI&r
[CHAT] &r
[CHAT] &r&f                            &r&fTeam Score: &r&a155 &r&f(&r&6C&r&f)&r
[CHAT] &r&f                      &r&c☠ &r&eDefeated &r&cSadan &r&ein &r&a05m 01s&r
[CHAT] &r&f                             &6> &e&lEXTRA STATS &6<&r
[CHAT] &r&f                                   &r&8+&r&b82 Bits&r
[CHAT] &r&f                     &r&8+&r&35,597.4 Catacombs Experience&r
[CHAT] &r&f                       &r&8+&r&32,975.2 Archer Experience&r
[CHAT] &r&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬&r
[CHAT] &r&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬&r
[CHAT] &r&f                     &r&cThe Catacombs &r&8- &r&eFloor VI Stats&r
[CHAT] &r
[CHAT] &r&f                            &r&fTeam Score: &r&a155 &r&f(&r&6C&r&f)&r
[CHAT] &r&f                      &r&c☠ &r&eDefeated &r&cSadan &r&ein &r&a05m 01s&r
[CHAT] &r
[CHAT] &r&f                 &r&fTotal Damage as Archer: &r&a777,821,871&r
[CHAT] &r&f                             &r&fEnemies Killed: &r&a135&r
[CHAT] &r&f                                   &r&fDeaths: &r&c0&r
[CHAT] &r&f                              &r&fSecrets Found: &r&b6&r
[CHAT] &r
[CHAT] &r&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬&r
[CHAT] &r
[CHAT] &r&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬&r
[CHAT]       &r&6&lCLICK HERE &bto re-queue into &a&aThe Catacombs!&r
[CHAT] &r&a&l▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬&r
[CHAT] &r
[CHAT] &r&c[BOSS] Sadan&r&f: NOOOOOOOOO!!! THIS IS IMPOSSIBLE!!&r
[CHAT] &r&7Warping you to your SkyBlock island...&r
[CHAT] &7Sending to server mini38CK...&r
[CHAT] &r&c[BOSS] Sadan&r&f: FATHER, FORGIVE ME!!!&r
[CHAT] &r&8 &r&8 &r&1 &r&3 &r&3 &r&7 &r&8 &r
[CHAT] &cAutopet &eequipped your &7[Lvl 100] &dRabbit&5 ✦&e! &a&lVIEW RULE&r
[CHAT] &r&eYou haven't claimed your &r&6Summer Rewards &r&eyet!&r
[CHAT] &r&eTalk to the &r&bSummer Sloth &r&ein the &r&aHub!&r
[CHAT] &f{"server":"mini38CK","gametype":"SKYBLOCK","mode":"dynamic","map":"Private Island"}&r
[CHAT] &aYou are playing on profile: &eTomato&b (Co-op)&r
[CHAT] &r&8Profile ID: 22a2d17e-c6b0-491d-9bdb-c45e50b4d682&r
[CHAT] &r&bNew day! &r&eYour &r&2Sky Mall &r&ebuff changed!&r
[CHAT] &r&eNew buff&r&r&r: &r&fReduce Pickaxe Ability cooldown by &r&a20%&r&f.&r
[CHAT] &r&8&oYou can disable this messaging by toggling Sky Mall in your /hotm!&r
[CHAT] &r&2Guild > &b[MVP&4+&b] New_BaR265&f: &r[NPC] Jacob: You placed in the PLATINUM bracket in the Cocoa Beans Contest!&r
[CHAT] &2Guild > &r&bEDELP &r&ejoined.&r
[CHAT] &r&2Guild > &b[MVP&4+&b] New_BaR265&f: &rFIRST TRY BABY&r
[CHAT] &2Guild > &r&bhuginio &r&eleft.&r
[CHAT] &r&a&r&6Pickobulus &r&ais now available!&r
[CHAT] &aFriend > &r&bmasterbobulator &r&ejoined.&r
*/