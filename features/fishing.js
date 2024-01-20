import Settings from "../utils/settings/main";
import { getArea } from "../utils/skyblock";
import { repeatSound } from "../utils/sound";

var last_cast = 0;
var original_volume = undefined;

Settings.registerSetting("Mute Sounds While Fishing", "soundPlay", (position, name, volume, pitch, category, event) => {
    const time_ellapsed = Date.now() - last_cast;
    if (time_ellapsed < 30_000) {
        if (!["note.pling", "random.successful_hit"].includes(name)) cancel(event);
    }
    else if (original_volume) {
        Client.settings.sound.setMasterVolume(original_volume);
        original_volume = undefined;
    }
});

Settings.registerSetting("Mute Sounds While Fishing", "playerInteract", () => {
    const item = Player?.getHeldItem();
    if (item?.getID() !== 346) return;
    
    const item_data = item?.getNBT()?.toObject();
    const item_id = item_data?.tag?.ExtraAttributes?.id;
    if (item_id !== undefined && ["SOUL_WHIP", "ZOMBIE_COMMANDER_WHIP", "GRAPPLING_HOOK"].includes(item_id))
        return;

    const area = getArea();
    if (area === "Kuudra") return;
    if (!original_volume && Settings.fishing_master_volume > 0) {
        original_volume = Client.settings.sound.getMasterVolume();
    }
    last_cast = Date.now();
    if (original_volume)
        Client.settings.sound.setMasterVolume(Settings.fishing_master_volume);
});

function resetStateMuteSounds() {
    last_cast = 0;
    if (original_volume) {
        Client.settings.sound.setMasterVolume(original_volume);
        original_volume = undefined;
    }
}

Settings.registerSetting("Mute Sounds While Fishing", "worldUnload", resetStateMuteSounds);
Settings.addAction("Mute Sounds While Fishing", resetStateMuteSounds);

var last_moved = Date.now();
var last_rotated = Date.now();
var last_yaw = Player?.getYaw();
var last_pitch = Player?.getPitch();
var afk = false;

function resetStateBlazingAuraWarning() {
    last_moved = Date.now();
    last_rotated = Date.now();
    last_yaw = Player?.getYaw();
    last_pitch = Player?.getPitch();
    afk = false;
}

Settings.registerSetting("Blazing Aura AFK Warning", "tick", () => {
    if (!Player) return;

    const helmet = Player.armor.getHelmet();
    const chestplate = Player.armor.getChestplate();
    const leggings = Player.armor.getLeggings();
    const boots = Player.armor.getBoots();
    if (!helmet || !chestplate || !leggings || !boots) return;

    const helmet_id = helmet.getNBT()?.toObject()?.tag?.ExtraAttributes?.id;
    const chestplate_id = chestplate.getNBT()?.toObject()?.tag?.ExtraAttributes?.id;
    const leggings_id = leggings.getNBT()?.toObject()?.tag?.ExtraAttributes?.id;
    const boots_id = boots.getNBT()?.toObject()?.tag?.ExtraAttributes?.id;

    if (
        ( helmet_id !== "FROZEN_BLAZE_HELMET" || chestplate_id !== "FROZEN_BLAZE_CHESTPLATE" || 
          leggings_id !== "FROZEN_BLAZE_LEGGINGS" || boots_id !== "FROZEN_BLAZE_BOOTS" ) 
        &&
        ( helmet_id !== "BLAZE_HELMET" || chestplate_id !== "BLAZE_CHESTPLATE" || 
          leggings_id !== "BLAZE_LEGGINGS" || boots_id !== "BLAZE_BOOTS" )
    ) {
        resetStateBlazingAuraWarning();
        return;
    }
    
    const current_time = Date.now();
    if (Player.isMoving()) 
        last_moved = current_time;
    
    const current_yaw = Player.getYaw();
    const current_pitch = Player.getPitch();
    if (last_yaw && last_pitch && (Math.abs( current_yaw - last_yaw ) > 0.5 || Math.abs( current_pitch - last_pitch ) > 0.5)) {
        last_rotated = current_time; 
        last_yaw = current_yaw;
        last_pitch = current_pitch;
    }
    if (!last_yaw || !last_pitch) {
        last_yaw = current_yaw;
        last_pitch = current_pitch;
    }
    
    if (!afk && (current_time - last_moved > 30_000 || current_time - last_rotated > 30_000)) {
        Client.showTitle("&c&lBlazing Aura Deactivated!!!", "&7move and look around!", 0, 100, 10);
        repeatSound("random.successful_hit", 1, 1, 5, 100);
        afk = true;
    }
    if (afk && (current_time - last_moved < 5_000 && current_time - last_rotated < 5_000)) {
        afk = false;
    }
});

Settings.registerSetting("Blazing Aura Deactivated", "worldLoad", resetStateBlazingAuraWarning);
Settings.addAction("Blazing Aura Deactivated", resetStateBlazingAuraWarning);

