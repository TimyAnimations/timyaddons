import Settings from "./settings/main";

export function drawOutlinedBox(x, y, z, r, g, b, size_x = 1, size_y = 1, size_z = 1, internal_alpha = 0.15, offset = 0.001) {
    Tessellator.begin();
    Tessellator.colorize(r, g, b, internal_alpha);
    Tessellator.translate(x, y, z);
    Tessellator.pos(size_x + offset, -offset, -offset);
    Tessellator.pos(-offset, -offset, -offset);
    Tessellator.pos(-offset, size_y + offset, -offset);
    Tessellator.pos(size_x + offset, size_y + offset, -offset);
    
    Tessellator.pos(-offset, -offset, size_z + offset);
    Tessellator.pos(size_x + offset, -offset, size_z + offset);
    Tessellator.pos(size_x + offset, size_y + offset, size_z + offset);
    Tessellator.pos(-offset, size_y + offset, size_z + offset);

    Tessellator.pos(-offset, -offset, -offset);
    Tessellator.pos(size_x + offset, -offset, -offset);
    Tessellator.pos(size_x + offset, -offset, size_z + offset);
    Tessellator.pos(-offset, -offset, size_z + offset);
    
    Tessellator.pos(size_x + offset, size_y + offset, -offset);
    Tessellator.pos(-offset, size_y + offset, -offset);
    Tessellator.pos(-offset, size_y + offset, size_z + offset);
    Tessellator.pos(size_x + offset, size_y + offset, size_z + offset);

    Tessellator.pos(-offset, size_y + offset, -offset);
    Tessellator.pos(-offset, -offset, -offset);
    Tessellator.pos(-offset, -offset, size_z + offset);
    Tessellator.pos(-offset, size_y + offset, size_z + offset);
    
    Tessellator.pos(size_x + offset, -offset, -offset);
    Tessellator.pos(size_x + offset, size_y + offset, -offset);
    Tessellator.pos(size_x + offset, size_y + offset, size_z + offset);
    Tessellator.pos(size_x + offset, -offset, size_z + offset);
    Tessellator.draw();
    
    Tessellator.begin(3);
    Tessellator.colorize(r, g, b, 1.0);
    Tessellator.translate(x, y, z);
    Tessellator.pos(-offset, -offset, -offset);
    Tessellator.pos(size_x + offset, -offset, -offset);
    Tessellator.pos(size_x + offset, size_y + offset, -offset);
    Tessellator.pos(-offset, size_y + offset, -offset);
    Tessellator.pos(-offset, -offset, -offset);
    Tessellator.pos(-offset, -offset, size_z + offset);
    Tessellator.pos(size_x + offset, -offset, size_z + offset);
    Tessellator.pos(size_x + offset, size_y + offset, size_z + offset);
    Tessellator.pos(-offset, size_y + offset, size_z + offset);
    Tessellator.pos(-offset, -offset, size_z + offset);
    Tessellator.draw();

    Tessellator.begin(2);
    Tessellator.colorize(r, g, b, 1.0);
    Tessellator.translate(x, y, z);
    Tessellator.pos(-offset, size_y + offset, -offset);
    Tessellator.pos(-offset, size_y + offset, size_z + offset);
    Tessellator.draw();

    Tessellator.begin(2);
    Tessellator.colorize(r, g, b, 1.0);
    Tessellator.translate(x, y, z);
    Tessellator.pos(size_x + offset, size_y + offset, -offset);
    Tessellator.pos(size_x + offset, size_y + offset, size_z + offset);
    Tessellator.draw();

    Tessellator.begin(2);
    Tessellator.colorize(r, g, b, 1.0);
    Tessellator.translate(x, y, z);
    Tessellator.pos(size_x + offset, -offset, -offset);
    Tessellator.pos(size_x + offset, -offset, size_z + offset);
    Tessellator.draw();
}

export function drawOutlinedPlane(x, y, z, r, g, b, size_x = 1, size_z = 1, internal_alpha = 0.15, offset = 0.001) {
    Tessellator.begin();
    Tessellator.colorize(r, g, b, internal_alpha);
    Tessellator.translate(x, y, z);
    Tessellator.pos(size_x + offset, offset, -offset);
    Tessellator.pos(-offset, offset, -offset);
    Tessellator.pos(-offset, offset, size_z + offset);
    Tessellator.pos(size_x + offset, offset, size_z + offset);
    Tessellator.draw();
    
    Tessellator.begin(2);
    Tessellator.colorize(r, g, b, 1.0);
    Tessellator.translate(x, y, z);
    Tessellator.pos(size_x + offset, offset, -offset);
    Tessellator.pos(-offset, offset, -offset);
    Tessellator.pos(-offset, offset, size_z + offset);
    Tessellator.pos(size_x + offset, offset, size_z + offset);
    Tessellator.draw();
}

export function drawWorldString(string, x, y, z, size = 1.0, increase = true, show_distance = true, height_offset = 0) {
    const distance_sq = (Player.getRenderX() - x)**2 + (Player.getRenderY() + 1 - y)**2 + (Player.getRenderZ() - z)**2;
    const distance = Math.sqrt(distance_sq);
    let multiplier = 0.025;
    if (increase) {
        multiplier = 0.45 * distance / 120;
        if (multiplier < 0.025) multiplier = 0.025;
        if (multiplier > 1.125) multiplier = 1.125;
        if (distance > 300) {
            x -= Player.getRenderX();
            y -= Player.getRenderY();
            z -= Player.getRenderZ();
            x *= 300 / distance;
            y *= 300 / distance;
            z *= 300 / distance;
            x += Player.getRenderX();
            y += Player.getRenderY();
            z += Player.getRenderZ();
        }
    }
    size *= multiplier;
    Tessellator.disableDepth();
    const lines = string.split("\n");
    lines.forEach((line, idx) => {
        Tessellator.drawString(line, x, y + (height_offset + (lines.length - idx - 1) * 10 * size), z, 0xFFFFFF, Settings.waypoint_show_box, size, false);
    });
    if (show_distance)
        Tessellator.drawString(`§e${Math.floor(distance)}m`, x, y + ((height_offset - 1) * 10 * size), z, 0xFFFFFF, Settings.waypoint_show_box, size, false);
    Tessellator.enableDepth();
}

export function drawCheckbox(x, y, value) {
    Renderer.drawShape(Renderer.color(255, 255, 255, 225), [
        [x + 0, y + 0],
        [x + 7, y + 0],
        [x + 7, y + 7],
        [x + 0, y + 7]
    ], 2);
    if (value)
        Renderer.drawRect(Renderer.color(255, 255, 255, 190), x + 1, y + 1, 5, 5);
}