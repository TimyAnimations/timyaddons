export var HUB_GRASS_HEIGHTMAP = JSON.parse(FileLib.read("TimyAddons", "./constant/hub_grass_heightmap.json"));

export function getGrassHeight(x, z) {
    x_idx = Math.floor(x) - HUB_GRASS_HEIGHTMAP.min[0];
    z_idx = Math.floor(z) - HUB_GRASS_HEIGHTMAP.min[1];
    if (x_idx < 0 || x_idx > HUB_GRASS_HEIGHTMAP.size[0]) return undefined;
    if (z_idx < 0 || z_idx > HUB_GRASS_HEIGHTMAP.size[1]) return undefined;

    return HUB_GRASS_HEIGHTMAP.height[x_idx][z_idx] > 0 ? HUB_GRASS_HEIGHTMAP.height[x_idx][z_idx] : undefined;
}

export function setGrassHeight(x, y, z) {
    x_idx = Math.floor(x) - HUB_GRASS_HEIGHTMAP.min[0];
    z_idx = Math.floor(z) - HUB_GRASS_HEIGHTMAP.min[1];

    if (x_idx < 0 || x_idx > HUB_GRASS_HEIGHTMAP.size[0]) return undefined;
    if (z_idx < 0 || z_idx > HUB_GRASS_HEIGHTMAP.size[1]) return undefined;

    HUB_GRASS_HEIGHTMAP.height[x_idx][z_idx] = y;
}

export function saveGrassHeightMap() {
    FileLib.write("TimyAddons", "./constant/hub_grass_heightmap.json", JSON.stringify(HUB_GRASS_HEIGHTMAP));
}

export function getGrassCoord(x, z, backup_y = undefined) {
    let y = getGrassHeight(x, z) ?? backup_y;
    if (!y) return undefined;
    return {x: x, y: y, z: z};
}

export function getGrassCoordAlongRay(x_pos, z_pos, x_dir, z_dir, max_search = 250) {
    let ret = getGrassCoord(x_pos, z_pos);
    if (ret) return ret;

    let larger_side = Math.abs(x_dir) > Math.abs(z_dir) ? Math.abs(x_dir) : Math.abs(z_dir)
    let x_inc = x_dir / larger_side, z_inc = z_dir / larger_side;
    for (let i = 1; !ret && i < max_search; i++) {
        let x_upper = x_pos + (i * x_inc);
        let z_upper = z_pos + (i * z_inc);
        ret = getGrassCoord(x_upper, z_upper);
        
        if (ret) continue;
        
        let x_lower = x_pos - (i * x_inc);
        let z_lower = z_pos - (i * z_inc);
        ret = getGrassCoord(x_lower, z_lower);
    }

    return ret;
}