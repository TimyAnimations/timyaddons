import { stringWidth } from "../../utils/format";
import { getHeldSkyblockItemID, isHoldingSkyblockItem } from "../../utils/skyblock";
import Settings from "../../utils/settings/main";

const farming_tools = [
    "BINGHOE",
    "ROOKIE_HOE",
    "BASIC_GARDENING_AXE",
    "BASIC_GARDENING_HOE",
    "ADVANCED_GARDENING_AXE",
    "ADVANCED_GARDENING_HOE",
    "CACTUS_KNIFE",
    "FUNGI_CUTTER",
    "PUMPKIN_DICER",
    "PUMPKIN_DICER_2",
    "PUMPKIN_DICER_3",
    "MELON_DICER",
    "MELON_DICER_2",
    "MELON_DICER_3",
    "COCO_CHOPPER",
    "THEORETICAL_HOE_WHEAT_1",
    "THEORETICAL_HOE_WHEAT_2",
    "THEORETICAL_HOE_WHEAT_3",
    "THEORETICAL_HOE_POTATO_2",
    "THEORETICAL_HOE_POTATO_1",
    "THEORETICAL_HOE_POTATO_3",
    "THEORETICAL_HOE_CARROT_1",
    "THEORETICAL_HOE_CARROT_2",
    "THEORETICAL_HOE_CARROT_3",
    "THEORETICAL_HOE_CANE_1",
    "THEORETICAL_HOE_CANE_2",
    "THEORETICAL_HOE_CANE_3",
    "THEORETICAL_HOE_WARTS_1",
    "THEORETICAL_HOE_WARTS_2",
    "THEORETICAL_HOE_WARTS_3"
]

const IMPORT_NAME = "TimyAddons/data"
const LOCATION_DATA_FILE = "tool_angles.json"

var tool_angles = (() => {
    let location_file = FileLib.exists(IMPORT_NAME, LOCATION_DATA_FILE) 
                            ? FileLib.read(IMPORT_NAME, LOCATION_DATA_FILE)
                            : undefined;
    let saved_data = {};
    if (location_file)
        saved_data = JSON.parse(location_file);

    return saved_data;
})();
FileLib.write(IMPORT_NAME, LOCATION_DATA_FILE, JSON.stringify(tool_angles));


var farming = false;
var user_sensitivity = Client.settings.getSettings().field_74341_c;
var target_angle = undefined;
Settings.registerSetting("Lower Sensitivity Near Target Yaw", "tick", () => {
    const mc_settings = Client.settings.getSettings();
    const item_id = getHeldSkyblockItemID();
    
    if (!farming && item_id && item_id in tool_angles) {
        farming = true;
        user_sensitivity = mc_settings.field_74341_c;
        target_angle = tool_angles[item_id];
        reset_trigger.register();
        return
    }
    if (farming) {
        if (!item_id || !(item_id in tool_angles)) {
            farming = false;
            target_angle = undefined;
            setSensitivitySafe(user_sensitivity);
            return;
        }
        target_angle = tool_angles[item_id];
        if (target_angle === undefined) return;

        let angle_distance = getAngleDistance(Player.getYaw(), target_angle);
        angle_distance = Math.abs(angle_distance);
        let new_sensitivity = user_sensitivity;
        if (angle_distance < 3) new_sensitivity = 0.0;
        if (angle_distance < 0.3) new_sensitivity = -0.1;
        if (angle_distance < 0.03) new_sensitivity = -0.2;
        if (angle_distance < 0.01) new_sensitivity = -0.25;
        if (angle_distance < 0.003) new_sensitivity = -0.27;
        setSensitivitySafe(new_sensitivity);
    }
}).requireArea("Garden");

var perfect_angle_count = 0;
Settings.registerSetting("Target Yaw Compass GUI", "tick", () => {
    if (Math.abs(Player.getYaw() - target_angle) < 0.001) {
        if (perfect_angle_count < 20)
            perfect_angle_count++;
    }
    else {
        perfect_angle_count = 0;
    }
}).requireArea("Garden");

function getAngleDistance(a1, a2) {
    let angle_distance = a1 - a2;
    while (angle_distance < -180) angle_distance += 360;
    while (angle_distance > 180) angle_distance -= 360;
    return angle_distance
}

Settings.registerSetting("Target Yaw Compass GUI", "renderOverlay", () => {
    if (target_angle === undefined || !farming || perfect_angle_count >= 20) return;
    Renderer.retainTransforms(true);

    Renderer.translate(Renderer.screen.getWidth() / 2, Renderer.screen.getHeight() / 2 - 25);
    Renderer.drawCircle(Renderer.color(0, 0, 0, 85), 0, 0, 20, 32);
    Renderer.drawLine(Renderer.color(255, 85, 85, 127), 0, 0, 0, -18, 1);
    const target_angle_string = `&c${target_angle.toFixed(3)}`;
    const current_angle_string = `&a${Player.getYaw().toFixed(3)}`;
    const target_angle_string_width = stringWidth(target_angle_string);
    const current_angle_string_width = stringWidth(current_angle_string);
    const width = target_angle_string_width > current_angle_string_width ? target_angle_string_width : current_angle_string_width;
    const direction_string = Math.abs(Player.getYaw() - target_angle) < 0.001 ? "&a-" : (getAngleDistance(Player.getYaw(), target_angle) > 0 ? "&6<" : "&6>")
    Renderer.drawRect(Renderer.color(0, 0, 0, 85), -width / 2 - 1, 32, width + 1, 27);
    Renderer.drawString(direction_string, -stringWidth("<") / 2, 33);
    Renderer.drawString(current_angle_string, -current_angle_string_width / 2, 42);
    Renderer.drawString(target_angle_string, -target_angle_string_width / 2, 51);
    Renderer.rotate(Player.getYaw() - target_angle);
    Renderer.drawLine(Renderer.color(85, 255, 85), 0, 0, 0, -18, 1);
    Renderer.drawCircle(Renderer.color(85, 85, 85), 0, 0, 3, 16);

    Renderer.retainTransforms(false);
}).requireArea("Garden");

function setSensitivitySafe(new_sensitivity) {
    const mc_settings = Client.settings.getSettings();

    if (!isNaN(new_sensitivity) && new_sensitivity < 1.0 && new_sensitivity > -0.31)
        mc_settings.field_74341_c = new_sensitivity;
    else if (!isNaN(user_sensitivity) && user_sensitivity < 1.0 && user_sensitivity > -0.31)
        mc_settings.field_74341_c = user_sensitivity;
}


register("command", (angle) => {
    const item_id = getHeldSkyblockItemID();

    if (!item_id) {
        ChatLib.chat("&cItem ID not found");
        return;
    }
    
    if (angle?.toLowerCase() === "reset") {
        // tool_angles = {};
        delete tool_angles[item_id];
        FileLib.write(IMPORT_NAME, LOCATION_DATA_FILE, JSON.stringify(tool_angles));
        return;
    }

    if (!angle || isNaN(parseFloat(angle))) {
        if (item_id in tool_angles) {
            ChatLib.chat(`&aCurrent Target Yaw for "&e${item_id}&a" is &e${tool_angles[item_id].toFixed(1)}`);
        }
        else {
            ChatLib.chat(`&cNo Target Yaw set for "&e${item_id}&c"`)
        }
        return;
    }

    tool_angles[item_id] = parseFloat(parseFloat(angle));
    FileLib.write(IMPORT_NAME, LOCATION_DATA_FILE, JSON.stringify(tool_angles));
    ChatLib.chat(`&aCurrent Target Yaw for "&e${item_id}&a" is now set to &e${tool_angles[item_id].toFixed(1)}`);

}).setName("farmingtoolyaw").setAliases("ftyaw");

const reset_trigger = register("worldUnload", () => {
    farming = false;
    Client.settings.getSettings().field_74341_c = user_sensitivity;
    reset_trigger.unregister();
}).unregister();