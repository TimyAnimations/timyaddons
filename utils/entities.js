import { Vector3 } from "./vector";
export function getNearEntitiesOfType(x, y, z, type) {
    let block_pos = { x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) };
    
    const chunk = World.getChunk(block_pos.x, block_pos.y, block_pos.z);
    let entities = chunk.getAllEntitiesOfType(type);
    
    let x_edge = 0, z_edge = 0;
    if (block_pos.x == chunk.getMinBlockX() + 15) x_edge =  1;
    else if (block_pos.x == chunk.getMinBlockX()) x_edge = -1;
    if (block_pos.z == chunk.getMinBlockZ() + 15) z_edge =  1;
    else if (block_pos.z == chunk.getMinBlockZ()) z_edge = -1;
    
    if (x_edge !== 0) {
        entities = entities.concat(
            World.getChunk(block_pos.x + x_edge, block_pos.y, block_pos.z)
                .getAllEntitiesOfType(Java.type("net.minecraft.entity.item.EntityArmorStand"))
        );
    }
    if (z_edge !== 0) {
        entities = entities.concat(
            World.getChunk(block_pos.x, block_pos.y, block_pos.z + z_edge)
                .getAllEntitiesOfType(Java.type("net.minecraft.entity.item.EntityArmorStand"))
        );
    }
    if (x_edge !== 0 && z_edge !== 0) {
        entities = entities.concat(
            World.getChunk(block_pos.x + x_edge, block_pos.y, block_pos.z + z_edge)
                .getAllEntitiesOfType(Java.type("net.minecraft.entity.item.EntityArmorStand"))
        );
    }

    return entities;
}

export function getClosestEntityOfType(x, y, z, type) {
    let entities = getNearEntitiesOfType(x, y, z, type);
    const pos = new Vector3(x, y, z);
    
    let closest = undefined;
    let closest_distance_sq = undefined;

    entities.forEach((entity) => {
        const distance_sq = pos.distanceSq(entity.getX(), entity.getY(), entity.getZ());
        if (!closest_distance_sq || distance_sq < closest_distance_sq) {
            closest = entity;
            closest_distance_sq = distance_sq;
        }
    });

    return closest;
}