import { drawEntityHitbox} from "../../utils/render";
import { Vector3 } from "../../utils/vector";
import Settings from "../../utils/settings/main";

bosses = {};
Settings.registerSetting("Boss Hitbox", "tick", () => {
    for (let uuid in bosses) {
        if (bosses[uuid].entity.isDead()) {
            bosses[uuid].entity = undefined;
            bosses[uuid].boss_entity = undefined;
            delete bosses[uuid];       
        }
        else {
            bosses[uuid].boss_entity = findClosestBoss(
                bosses[uuid].entity.getX(), bosses[uuid].entity.getY(), 
                bosses[uuid].entity.getZ(), bosses[uuid].entity.getTicksExisted()
            );
        }
    }  
    let armor_stands = World.getAllEntitiesOfType(Java.type("net.minecraft.entity.item.EntityArmorStand"));
    for (let i = 0; i < armor_stands.length; i++) {
        let name = armor_stands[i].getName();
        if (!/§eSpawned by: §.\w*/.test(name)) continue;
        let username = name.replace(/§eSpawned by: §./, "");
        let mine = username === Player.getName();

        let uuid = armor_stands[i].getUUID().toString();
        if (uuid in bosses) continue;

        bosses[uuid] = {
            entity: armor_stands[i],
            boss_entity: undefined,
            color : {r: mine ? 1.0 : 0.0, g: mine ? 0.0 : 1.0, b: 0.0}
        }
    }
}).setAction(() => {
    for (let uuid in bosses) {
        bosses[uuid].entity = undefined;
        bosses[uuid].waypoint.hide();  
        delete bosses[uuid];     
    }
    bosses = {};
});

Settings.registerSetting("Boss Hitbox", "renderWorld", (partial_tick) => {
    GL11.glLineWidth(2);
    GL11.glDisable(GL11.GL_TEXTURE_2D);

    GlStateManager.func_179094_E(); // pushMatrix()
    Tessellator.enableDepth();
    Tessellator.disableLighting();

    for (let uuid in bosses) {
        let entity = bosses[uuid].boss_entity ?? bosses[uuid].entity;
        switch (entity.getClassName()) {
            case "EntityArmorStand":
                drawEntityHitbox(entity, bosses[uuid].color.r, bosses[uuid].color.g, bosses[uuid].color.b, 0.15, 0.5, 0, -1.0, 0);
                break;
            default:
                drawEntityHitbox(entity, bosses[uuid].color.r, bosses[uuid].color.g, bosses[uuid].color.b, 0.15, 0.1, 0, 0.1, 0);
        }
    }

    Tessellator.enableDepth()
    Tessellator.enableLighting();

    GlStateManager.func_179121_F(); // popMatrix()
    GL11.glEnable(GL11.GL_TEXTURE_2D);
});

function findClosestBoss(x, y, z, tick) {
    let closest = undefined;
    let closest_distance_sq = undefined;

    entities = [];

    entities.push(...World.getAllEntitiesOfType(Java.type("net.minecraft.entity.monster.EntityZombie"))
        .filter((entity) => Math.abs(entity.getTicksExisted() - tick) < 2));
    entities.push(...World.getAllEntitiesOfType(Java.type("net.minecraft.entity.monster.EntitySpider"))
        .filter((entity) => {
            return entity.getClassName() !== "EntityCaveSpider" && Math.abs(entity.getTicksExisted() - tick) < 2
        }));
    entities.push(...World.getAllEntitiesOfType(Java.type("net.minecraft.entity.passive.EntityWolf"))
        .filter((entity) => Math.abs(entity.getTicksExisted() - tick) < 2));
    entities.push(...World.getAllEntitiesOfType(Java.type("net.minecraft.entity.monster.EntityEnderman"))
        .filter((entity) => Math.abs(entity.getTicksExisted() - tick) < 2));
    entities.push(...World.getAllEntitiesOfType(Java.type("net.minecraft.entity.monster.EntityBlaze"))
        .filter((entity) => Math.abs(entity.getTicksExisted() - tick) < 2));

    entities.forEach((entity) => {
        const distance_sq = Vector3.distanceSq({x: x, y: y, z: z}, {x: entity.getX(), y: entity.getY(), z: entity.getZ()});
        if (!closest_distance_sq || distance_sq < closest_distance_sq) {
            closest = entity;
            closest_distance_sq = distance_sq;
        }
    });

    return closest;
}