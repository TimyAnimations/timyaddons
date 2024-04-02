import Settings from "../../utils/settings/main";
import { queueCommand } from "../../utils/command_queue";
import { Waypoint } from "../../utils/waypoint";

// pest hitbox
var pests = {};
const PEST_OFFSETS = {
    "§cൠ Fly": 2,
    "§cൠ Mosquito": 2,
    "§cൠ Cricket": 2.5,
    "§cൠ Locust": 2.5,
    "§cൠ Moth": 2,
    "§cൠ Earthworm": 2.5,
    "§cൠ Rat": 2.5,
    "§cൠ Beetle": 2.5,
    "§cൠ Slug": 2.5,
    "§cൠ Mite": 2.5
}
Settings.registerSetting("Pest Hitbox", "tick", () => {
    for (let uuid in pests) {
        if (pests[uuid].entity.isDead()) {
            pests[uuid].entity = undefined;
            pests[uuid].waypoint.hide();  
            delete pests[uuid];       
        }
        else {
            pests[uuid].waypoint.attachToEntity(pests[uuid].entity, 0, pests[uuid].offset, 0);
            pests[uuid].waypoint.show(false);
        }
    }
    
    let armor_stands = World.getAllEntitiesOfType(Java.type("net.minecraft.entity.item.EntityArmorStand"));
    for (let i = 0; i < armor_stands.length; i++) {
        let name = armor_stands[i].getName();
        if (!name.startsWith("§cൠ ")) continue;
        
        let uuid = armor_stands[i].getUUID().toString();
        if (uuid in pests) continue;

        pests[uuid] = {
            entity: armor_stands[i],
            offset: PEST_OFFSETS[name.split("§r")[0]] ?? 0,
            waypoint: new Waypoint("", 0, 0, 0, 1.0, 0.0, 1.0, true, false, false, false, false)
        }
    }
}).requireArea("Garden").setAction(() => { 
    for (let uuid in pests) {
        pests[uuid].entity = undefined;
        pests[uuid].waypoint.hide();  
        delete pests[uuid];     
    }
    pests = {};
});

// pest tracker
var vacuum_player_position = undefined;
var vacuum_end_segment = undefined;
var vacuum_positions = [];
var vacuum_color = undefined;

var vacuum_last_positions = [];
var vacuum_last_end_segment = undefined;
const VACUUM_GREEN_VALUE = {
    "RED": 0.0, "YELLOW": 1.0, "ORANGE": 0.5
};

var vacuum_on_cooldown = false;

var vacuum_particle_trigger = register("spawnParticle", (particle, type) => {
    if (type.toString() !== "REDSTONE") return;
    if (!vacuum_player_position) return;
    
    const color = particle.getColor();
    if (!color) return;
    // if it has blue or a low amount of red, probably a rune or pet particle
    if (color.getBlue() !== 0 || color.getRed() < 100) return;

    if (color.getGreen() === 0) vacuum_color = "RED";
    else if (color.getGreen() / color.getRed() > 0.65) 
         vacuum_color = "YELLOW";
    else vacuum_color = "ORANGE";

    const particle_position = {x: particle.getX(), y: particle.getY(), z: particle.getZ()};
    const last_position = vacuum_positions.length > 0 ? vacuum_positions[vacuum_positions.length - 1] : vacuum_player_position;
    const distance_sq = (particle_position.x - last_position.x)**2 + (particle_position.y - last_position.y)**2 + (particle_position.z - last_position.z)**2;
    
    if (distance_sq > 4) return;

    vacuum_positions.push({x: particle_position.x, y: particle_position.y, z: particle_position.z});
    
    const diff = {x: particle_position.x - last_position.x, y: particle_position.y - last_position.y, z: particle_position.z - last_position.z};
    const length = Math.sqrt((diff.x * diff.x) + (diff.z * diff.z))
    if (length == 0) return;
    const vacuum_orientation = {x: diff.x / length, y: diff.y / length, z: diff.z / length};

    let particle_height = particle_position.y - 67;
    let last_segment_length = 500;
    if (vacuum_orientation.y < 0 && particle_height > 0) {
        last_segment_length = -particle_height / vacuum_orientation.y;
    }

    vacuum_end_segment = {
        x: vacuum_orientation.x * last_segment_length, 
        y: vacuum_orientation.y * last_segment_length, 
        z: vacuum_orientation.z * last_segment_length
    };
});
vacuum_particle_trigger.unregister();

function vacuumResetState() {
    vacuum_player_position = undefined;
    vacuum_end_segment = undefined;
    vacuum_positions = [];
    vacuum_color = undefined;
    
    vacuum_last_positions = [];
    vacuum_last_end_segment = undefined;
    
    vacuum_on_cooldown = false;

    vacuum_particle_trigger.unregister();
}

Settings.registerSetting("Trace Pest Tracker Line", "worldUnload", vacuumResetState);

Settings.registerSetting("Trace Pest Tracker Line", "entityDeath", (entity) => {
    if (!entity) return;
    if (!(entity.entity instanceof Java.type("net.minecraft.entity.monster.EntitySilverfish") || 
          entity.entity instanceof Java.type("net.minecraft.entity.passive.EntityBat")))
    {
        return;
    }
    vacuumResetState();
}).requireArea("Garden");

Settings.registerSetting("Trace Pest Tracker Line", "clicked", (x, y, button) => {
    if (vacuum_on_cooldown) return;

    const item = Player?.getHeldItem();
    if (!item) return false;

    const item_id = item.getNBT()?.toObject()?.tag?.ExtraAttributes?.id;
    if (item_id === undefined ||
        !["SKYMART_TURBO_VACUUM", "SKYMART_HYPER_VACUUM",
          "INFINI_VACUUM", "INFINI_VACUUM_HOOVERIUS"].includes(item_id) )
    {
        return;
    }
    
    if (vacuum_positions.length > 0 && vacuum_end_segment) {
        vacuum_last_positions = vacuum_positions;
        vacuum_last_end_segment = vacuum_end_segment;
    }
    else {
        vacuum_last_positions = [];
        vacuum_last_end_segment = undefined;
    }
    vacuum_player_position = {x: Player.getX(), y: Player.getY(), z: Player.getZ()};
    
    vacuum_positions = [];

    if (button !== 0) return;

    vacuum_particle_trigger.register();
    setTimeout(() => { vacuum_particle_trigger.unregister() }, 3_000);
    vacuum_on_cooldown = true;
    setTimeout(() => { vacuum_on_cooldown = false; }, 1_000);
}).requireArea("Garden");

Settings.registerSetting("Trace Pest Tracker Line", "renderWorld", (partial_ticks) => {
    GL11.glLineWidth(3);
    GL11.glDisable(GL11.GL_TEXTURE_2D);
    Tessellator.disableLighting();

    GlStateManager.func_179094_E(); // pushMatrix()
    
    if (vacuum_end_segment && vacuum_positions.length > 0) {
        let g = vacuum_color ? VACUUM_GREEN_VALUE[vacuum_color] : 0.0;
        
        for (let i = 0; i < vacuum_positions.length - 1; i++) {
            Tessellator.begin(3);
            Tessellator.colorize(1.0, g, 0.1);
            Tessellator.translate(vacuum_positions[i].x, vacuum_positions[i].y, vacuum_positions[i].z);
            Tessellator.pos(0, 0, 0);
            Tessellator.pos(vacuum_positions[i + 1].x - vacuum_positions[i].x, vacuum_positions[i + 1].y - vacuum_positions[i].y, vacuum_positions[i + 1].z - vacuum_positions[i].z);
            Tessellator.draw();
        }
        Tessellator.begin(3);
        Tessellator.colorize(1.0, g, 0.1);
        Tessellator.translate(vacuum_positions[vacuum_positions.length - 1].x, vacuum_positions[vacuum_positions.length - 1].y, vacuum_positions[vacuum_positions.length - 1].z);
        Tessellator.pos(0, 0, 0);
        Tessellator.pos(vacuum_end_segment.x, vacuum_end_segment.y, vacuum_end_segment.z);
        Tessellator.draw();

        Tessellator.disableDepth();
        for (let i = 0; i < vacuum_positions.length - 1; i++) {
            Tessellator.begin(3);
            Tessellator.colorize(1.0, g, 0.1, 0.4);
            Tessellator.translate(vacuum_positions[i].x, vacuum_positions[i].y, vacuum_positions[i].z);
            Tessellator.pos(0, 0, 0);
            Tessellator.pos(vacuum_positions[i + 1].x - vacuum_positions[i].x, vacuum_positions[i + 1].y - vacuum_positions[i].y, vacuum_positions[i + 1].z - vacuum_positions[i].z);
            Tessellator.draw();
        }
        Tessellator.begin(3);
        Tessellator.colorize(1.0, g, 0.1, 0.4);
        Tessellator.translate(vacuum_positions[vacuum_positions.length - 1].x, vacuum_positions[vacuum_positions.length - 1].y, vacuum_positions[vacuum_positions.length - 1].z);
        Tessellator.pos(0, 0, 0);
        Tessellator.pos(vacuum_end_segment.x, vacuum_end_segment.y, vacuum_end_segment.z);
        Tessellator.draw();
        Tessellator.enableDepth();
    }
    
    if (Settings.garden_pest_keep_previous_line && vacuum_last_end_segment && vacuum_last_positions.length > 0) {
        for (let i = 0; i < vacuum_last_positions.length - 1; i++) {
            Tessellator.begin(3);
            Tessellator.colorize(0.0, 0.5, 1.0);
            Tessellator.translate(vacuum_last_positions[i].x, vacuum_last_positions[i].y, vacuum_last_positions[i].z);
            Tessellator.pos(0, 0, 0);
            Tessellator.pos(vacuum_last_positions[i + 1].x - vacuum_last_positions[i].x, vacuum_last_positions[i + 1].y - vacuum_last_positions[i].y, vacuum_last_positions[i + 1].z - vacuum_last_positions[i].z);
            Tessellator.draw();
        }
        Tessellator.begin(3);
        Tessellator.colorize(0.0, 0.5, 1.0);
        Tessellator.translate(vacuum_last_positions[vacuum_last_positions.length - 1].x, vacuum_last_positions[vacuum_last_positions.length - 1].y, vacuum_last_positions[vacuum_last_positions.length - 1].z);
        Tessellator.pos(0, 0, 0);
        Tessellator.pos(vacuum_last_end_segment.x, vacuum_last_end_segment.y, vacuum_last_end_segment.z);
        Tessellator.draw();

        Tessellator.disableDepth();
        for (let i = 0; i < vacuum_last_positions.length - 1; i++) {
            Tessellator.begin(3);
            Tessellator.colorize(0.0, 0.5, 1.0, 0.4);
            Tessellator.translate(vacuum_last_positions[i].x, vacuum_last_positions[i].y, vacuum_last_positions[i].z);
            Tessellator.pos(0, 0, 0);
            Tessellator.pos(vacuum_last_positions[i + 1].x - vacuum_last_positions[i].x, vacuum_last_positions[i + 1].y - vacuum_last_positions[i].y, vacuum_last_positions[i + 1].z - vacuum_last_positions[i].z);
            Tessellator.draw();
        }
        Tessellator.begin(3);
        Tessellator.colorize(0.0, 0.5, 1.0, 0.4);
        Tessellator.translate(vacuum_last_positions[vacuum_last_positions.length - 1].x, vacuum_last_positions[vacuum_last_positions.length - 1].y, vacuum_last_positions[vacuum_last_positions.length - 1].z);
        Tessellator.pos(0, 0, 0);
        Tessellator.pos(vacuum_last_end_segment.x, vacuum_last_end_segment.y, vacuum_last_end_segment.z);
        Tessellator.draw();
        Tessellator.enableDepth();
    }

    Tessellator.enableLighting();
    GlStateManager.func_179121_F(); // popMatrix()
    GL11.glEnable(GL11.GL_TEXTURE_2D);
}).requireArea("Garden");