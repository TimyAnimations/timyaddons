import { drawWorldString } from "../utils/render";
import Settings from "../utils/settings/main";
import { getHeldSkyblockItemID } from "../utils/skyblock";
import { repeatSound } from "../utils/sound";
import { Vector3 } from "../utils/vector";
import { addWorldTimer } from "./instance/timers";

var last_stack = "0";
Settings.registerSetting("Full Dominus Stack Warning", "actionBar", (stack, event) => {
    if (last_stack === "&l10" && stack === "9") {
        Client.showTitle("&c&lDominus Stacks!", "", 0, 50, 10);
        repeatSound("random.successful_hit", 1, 1, 5, 100);
    }
    last_stack = stack;
}).setCriteria(" &6${stack}ᝐ").setContains();

const ENTITY_FILTER = [
    "EntityItemFrame", "EntityPainting", "EntityArmorStand", "EntityPlayerSP",
    "EntityItem", "EntityXPOrb"
];
const find_frozen_trigger = register("soundPlay", (pos) => {
    if (!fire_freeze_location) return;
    World.getAllEntities().forEach((entity) => {
        if (ENTITY_FILTER.includes(`${entity.getClassName()}`)) return;
        if (Vector3.distanceSq(fire_freeze_location, entity.getPos()) > 49) 
            return;
        addWorldTimer(entity.getX(), entity.getY() + 1, entity.getZ(), 200, "§b", "Frozen");
    })
}).setCriteria("random.anvil_land");
find_frozen_trigger.unregister();

let fire_freeze_location = undefined;
Settings.registerSetting("Fire Freeze Timer", "playerInteract", () => {
    if (fire_freeze_location) return;
    const item_id = getHeldSkyblockItemID();
    if (item_id === "FIRE_FREEZE_STAFF");

    fire_freeze_location = {x: Player.getX(), y: Player.getY(), z: Player.getZ()};
    Client.scheduleTask(90, () => find_frozen_trigger.register());
    Client.scheduleTask(110, () => find_frozen_trigger.unregister());
    Client.scheduleTask(200, () => fire_freeze_location = undefined);
});