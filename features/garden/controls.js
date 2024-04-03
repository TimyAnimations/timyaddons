import { stringWidth } from "../../utils/format";
import { getHeldSkyblockItemID } from "../../utils/skyblock";
import Settings from "../../utils/settings/main";

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

function setSensitivitySafe(new_sensitivity) {
    const mc_settings = Client.settings.getSettings();

    if (!isNaN(new_sensitivity) && new_sensitivity < 1.0 && new_sensitivity > -0.31)
        mc_settings.field_74341_c = new_sensitivity;
    else if (!isNaN(user_sensitivity) && user_sensitivity < 1.0 && user_sensitivity > -0.31)
        mc_settings.field_74341_c = user_sensitivity;
}

function resetSensitivity() {
    setSensitivitySafe(user_sensitivity);
    reset_trigger.unregister();
}


function getAngleDifference(a1, a2) {
    let angle_distance = a1 - a2;
    while (angle_distance < -180) angle_distance += 360;
    while (angle_distance > 180) angle_distance -= 360;
    return angle_distance
}

var farming = false;
var user_sensitivity = Client.settings.getSettings().field_74341_c;
var target_yaw = undefined;
var target_pitch = undefined;
Settings.registerSetting("Lower Sensitivity Near Target Angle", "tick", () => {
    const mc_settings = Client.settings.getSettings();
    const item_id = getHeldSkyblockItemID();
    
    if (!farming && item_id && item_id in tool_angles) {
        farming = true;
        user_sensitivity = mc_settings.field_74341_c;
        target_yaw = tool_angles[item_id].yaw;
        target_pitch = tool_angles[item_id].pitch;
        reset_trigger.register();
        return
    }
    if (farming) {
        if (!item_id || !(item_id in tool_angles)) {
            farming = false;
            target_yaw = undefined;
            target_pitch = undefined;
            resetSensitivity();
            return;
        }
        target_yaw = tool_angles[item_id].yaw;
        target_pitch = tool_angles[item_id].pitch;
        if (target_yaw === undefined && target_pitch == undefined) return;


        const yaw_difference = getAngleDifference(target_yaw ?? Player.getYaw(), Player.getYaw());
        const pitch_difference = getAngleDifference(target_pitch ?? Player.getPitch(), Player.getPitch());
        const angle_distance = Math.sqrt(pitch_difference**2 + yaw_difference**2);
    
        let new_sensitivity = user_sensitivity;
        if (angle_distance < 5) new_sensitivity = 0.0;
        if (angle_distance < 0.5) new_sensitivity = -0.1;
        if (angle_distance < 0.05) new_sensitivity = -0.2;
        if (angle_distance < 0.02) new_sensitivity = -0.25;
        if (angle_distance < 0.005) new_sensitivity = -0.27;
        setSensitivitySafe(new_sensitivity);
    }
}).requireArea("Garden");

Settings.registerSetting("Target Angle Visualizer GUI", "renderOverlay", () => {
    if ((target_yaw === undefined && target_pitch === undefined) || !farming || perfect_angle_count >= 20) return;
    const x_mid = (Renderer.screen.getWidth() / 2) + 0.5;
    const y_mid = (Renderer.screen.getHeight() / 2) + 0.5;
    const yaw_difference = getAngleDifference(target_yaw ?? Player.getYaw(), Player.getYaw());
    const pitch_difference = getAngleDifference(target_pitch ?? Player.getPitch(), Player.getPitch());

    const angle_distance = Math.sqrt(pitch_difference**2 + yaw_difference**2);
    const direction = {
        x: yaw_difference / angle_distance,
        y: pitch_difference / angle_distance
    }

    const target_yaw_string = `&c${target_yaw !== undefined ? target_yaw?.toFixed(4) : "No Target"} / ${target_pitch !== undefined ? target_pitch?.toFixed(4) : "No Target"}`;
    const current_angle_string = `&a${Player.getYaw().toFixed(4)} / ${Player.getPitch().toFixed(4)}`;
    const target_yaw_string_width = stringWidth(target_yaw_string);
    const current_angle_string_width = stringWidth(current_angle_string);
    const width = target_yaw_string_width > current_angle_string_width ? target_yaw_string_width : current_angle_string_width;

    const scale = Renderer.screen.getScale();


    Renderer.retainTransforms(true);
    GL11.glLineWidth(scale + 1);
    Renderer.translate(x_mid, y_mid);
    
    Renderer.drawRect(Renderer.color(0, 0, 0, 85), -width / 2 - 1, 41, width + 1, 18);
    Renderer.drawString(current_angle_string, -current_angle_string_width / 2, 42);
    Renderer.drawString(target_yaw_string, -target_yaw_string_width / 2, 51);
    
    if (angle_distance < 0.001) {
        Renderer.drawShape(Renderer.GREEN, [[-10, 0], [10, 0]], 3);
        Renderer.drawShape(Renderer.GREEN, [[0, -10], [0, 10]], 3);
    }
    else {
        Renderer.drawShape(Renderer.RED, [[yaw_difference, pitch_difference - 10], [yaw_difference, pitch_difference + 10]], 3);
        Renderer.drawShape(Renderer.RED, [[yaw_difference - 10, pitch_difference], [yaw_difference + 10, pitch_difference]], 3);
        Renderer.rotate(Math.atan2(direction.y, direction.x) * 180.0 / Math.PI);
        Renderer.drawShape(Renderer.GOLD, [
            [10, 10],
            [20, 0],
            [10, -10],
        ], 3);
    }
    
    Renderer.retainTransforms(false);
}).requireArea("Garden");

var perfect_angle_count = 0;
Settings.registerSetting("Target Angle Visualizer GUI", "tick", () => {
    const yaw_difference = getAngleDifference(target_yaw ?? Player.getYaw(), Player.getYaw());
    const pitch_difference = getAngleDifference(target_pitch ?? Player.getPitch(), Player.getPitch());
    const angle_distance = Math.sqrt(pitch_difference**2 + yaw_difference**2);
    if (angle_distance < 0.001) {
        if (perfect_angle_count < 20)
            perfect_angle_count++;
    }
    else {
        perfect_angle_count = 0;
    }
}).requireArea("Garden");


register("command", (arg1, arg2) => {
    const item_id = getHeldSkyblockItemID();

    if (!item_id) {
        ChatLib.chat("&cItem ID not found");
        return;
    }
    
    const angle = parseFloat(arg2);

    switch (arg1?.toLowerCase()) {
        case "reset":
            switch (arg2?.toLowerCase()) {
                case "yaw":
                    if (item_id in tool_angles)
                        tool_angles[item_id].yaw = undefined;
                    break;
                case "pitch":
                    if (item_id in tool_angles)
                        tool_angles[item_id].pitch = undefined;
                    break;
                default:
                    delete tool_angles[item_id];
            }
            FileLib.write(IMPORT_NAME, LOCATION_DATA_FILE, JSON.stringify(tool_angles));
            break;
        case "yaw": case "y":
            if (!isNaN(angle)) {
                tool_angles[item_id] = {
                    yaw: angle,
                    pitch: tool_angles[item_id]?.pitch
                }
            }
            if (tool_angles[item_id]?.yaw !== undefined)
                ChatLib.chat(`&aCurrent Target Yaw for "&e${item_id}&a" is &e${tool_angles[item_id].yaw}`);
            else
                ChatLib.chat(`&cNo Target Yaw for "&e${item_id}&c"`);
            break;
        case "pitch": case "p":
            if (!isNaN(angle)) {
                tool_angles[item_id] = {
                    yaw: tool_angles[item_id]?.yaw,
                    pitch: angle
                }
            }
            if (tool_angles[item_id]?.pitch !== undefined)
                ChatLib.chat(`&aCurrent Target Pitch for "&e${item_id}&a" is &e${tool_angles[item_id].pitch}`);
            else
                ChatLib.chat(`&cNo Target Pitch for "&e${item_id}&c"`);
            break;
        default:
            if (arg1) {
                const split = arg1.split("/");
                const yaw_angle = parseFloat(split[0]);
                const pitch_angle = parseFloat(split[1]);
                tool_angles[item_id] = {
                    yaw: isNaN(yaw_angle) ? undefined : yaw_angle,
                    pitch: isNaN(pitch_angle) ? undefined : pitch_angle
                }
            }
            if (tool_angles[item_id]?.yaw !== undefined)
                ChatLib.chat(`&aCurrent Target Yaw for "&e${item_id}&a" is &e${tool_angles[item_id].yaw}`);
            else
                ChatLib.chat(`&cNo Target Yaw for "&e${item_id}&c"`);
            if (tool_angles[item_id]?.pitch !== undefined)
                ChatLib.chat(`&aCurrent Target Pitch for "&e${item_id}&a" is &e${tool_angles[item_id].pitch}`);
            else
                ChatLib.chat(`&cNo Target Pitch for "&e${item_id}&c"`);
    }

    FileLib.write(IMPORT_NAME, LOCATION_DATA_FILE, JSON.stringify(tool_angles));
}).setName("farmingtool").setAliases("ft");

const reset_trigger = register("worldUnload", () => {
    farming = false;
    resetSensitivity();
}).unregister();