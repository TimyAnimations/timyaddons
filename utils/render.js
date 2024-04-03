import { longestStringWidth, stringWidth } from "./format";
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

// export function drawWorldString(string, x, y, z, size = 1.0, increase = true, show_distance = true, height_offset = 0) {
//     const distance_sq = (Player.getRenderX() - x)**2 + (Player.getRenderY() + 1 - y)**2 + (Player.getRenderZ() - z)**2;
//     const distance = Math.sqrt(distance_sq);
//     let multiplier = 0.025;
//     if (increase) {
//         multiplier = 0.45 * distance / 120;
//         if (multiplier < 0.025) multiplier = 0.025;
//         if (multiplier > 1.125) multiplier = 1.125;
//         if (distance > 300) {
//             x -= Player.getRenderX();
//             y -= Player.getRenderY();
//             z -= Player.getRenderZ();
//             x *= 300 / distance;
//             y *= 300 / distance;
//             z *= 300 / distance;
//             x += Player.getRenderX();
//             y += Player.getRenderY();
//             z += Player.getRenderZ();
//         }
//     }
//     size *= multiplier;
//     Tessellator.disableDepth();
//     const lines = string.split("\n");
//     lines.forEach((line, idx) => {
//         Tessellator.drawString(line, x, y + (height_offset + (lines.length - idx - 1) * 10 * size), z, 0xFFFFFF, Settings.waypoint_show_box, size, false);
//     });
//     if (show_distance)
//         Tessellator.drawString(`§e${Math.floor(distance)}m`, x, y + ((height_offset - 1) * 10 * size), z, 0xFFFFFF, Settings.waypoint_show_box, size, false);
//     Tessellator.enableDepth();
// }

export function drawWorldString(string, x, y, z, size = 1.0, increase = true, show_distance = true, height_offset = 0) {
    const fontRenderer = Renderer.getFontRenderer();
    
    drawInWorld(x, y, z, () => {
        const lines = string.split("\n");
        if (show_distance) {
            const distance_sq = (Player.getRenderX() - x)**2 + (Player.getRenderY() + 1 - y)**2 + (Player.getRenderZ() - z)**2;
            const distance = Math.sqrt(distance_sq);
            lines.push(`§e${Math.floor(distance)}m`);
        }
        lines.forEach((line, idx) => {
            const width = stringWidth(line);
            const [x, y] = [-width / 2, height_offset + (idx * 9)];
            if (Settings.waypoint_show_box) {
                Renderer.drawRect(Renderer.color(0, 0, 0, 63), x - 1, y - 1, width + 2, 9);
            }
            fontRenderer.func_175065_a(line, x, y, Renderer.WHITE, false);
        });
    }, size, increase);
}

export function drawInWorld(x, y, z, draw_func, size = 1.0, increase = true) {
    let multiplier = 0.025;
    if (increase) {
        const camera = getCameraLocation();
        x -= camera.x;
        y -= camera.y;
        z -= camera.z;
        const distance = Math.sqrt(x**2 + y**2 + z**2);
        multiplier = 0.45 * distance / 120;
        if (multiplier < 0.025) multiplier = 0.025;
        if (multiplier > 1.125) multiplier = 1.125;
        if (distance > 300) {
            x *= 300 / distance;
            y *= 300 / distance;
            z *= 300 / distance;
        }
        x += camera.x;
        y += camera.y;
        z += camera.z;
    }
    size *= multiplier;

    const fov = Client.settings.getFOV();
    size *= 25 / ((-50.0 / 80) * (fov - 40) + 70);

    
    const renderManager = Renderer.getRenderManager();
    Renderer.retainTransforms(true);
    GlStateManager.func_179094_E(); // pushMatrix()
    Tessellator.translate(x - Player.getRenderX(), y - Player.getRenderY(), z - Player.getRenderZ());
    Tessellator.rotate(-getCameraRotationY(), 0.0, 1.0, 0.0);
    Tessellator.rotate(getCameraRotationX(), 1.0, 0.0, 0.0);
    Tessellator.scale(-size, -size, size);
    Tessellator.disableLighting();
    Tessellator.disableDepth();
    Tessellator.enableBlend();
    Tessellator.blendFunc(770, 771);

    draw_func();

    Renderer.retainTransforms(false);

    Tessellator.enableDepth();
    GlStateManager.func_179121_F(); // popMatrix()
}

export function drawCheckbox(x, y, value, box_color = Renderer.color(255, 255, 255), check_color = Renderer.color(10, 10, 10)) {
    GlStateManager.func_179094_E(); // pushMatrix()
    const scale = Renderer.screen.getScale();

    GL11.glLineWidth(scale);

    Renderer.drawShape(box_color, [
        [x + 0, y + 0],
        [x + 7, y + 0],
        [x + 7, y + 7],
        [x + 0, y + 7]
    ], 2);
    if (value) {
        Renderer.drawRect(box_color, x, y, 7, 7);
        GL11.glLineWidth(scale + 1);
        Renderer.drawShape(check_color, [
            [x + 1, y + 4],
            [x + 3, y + 6],
            [x + 6, y + 1],
        ], 3);
    }

    GlStateManager.func_179121_F(); // popMatrix()
}

var ActiveRenderInfo = Java.type("net.minecraft.client.renderer.ActiveRenderInfo");
export function getCameraLocation() {
    const camera_offset = ActiveRenderInfo.func_178804_a();

    let offset_y = 0;
    // if (Client.settings.video.getBobbing()) {
    //     offset_y = (last_motion_y + (Player.getMotionY() - last_motion_y) * Tessellator.partialTicks) / 19;
    // }

    return {
        x: Client.camera.getX() + camera_offset.field_72450_a, 
        y: Client.camera.getY() + camera_offset.field_72448_b + offset_y, 
        z: Client.camera.getZ() + camera_offset.field_72449_c
    };
}

export function getCameraLookVector() {
    return eulerAngleToVector(getCameraRotationX(), getCameraRotationY());
}

export function eulerAngleToVector(x, y) {
    const cos_x = Math.cos(x * Math.PI / 180.0);
    const sin_x = Math.sin(x * Math.PI / 180.0);
    const cos_y = Math.cos(y * Math.PI / 180.0);
    const sin_y = Math.sin(y * Math.PI / 180.0);
    return {
        x: -(sin_y * cos_x),
        y: -sin_x,
        z: cos_y * cos_x
    }
}

export function getCameraRotationAxis() {
    const [x, y] = [getCameraRotationX(), getCameraRotationY()];
    const cos_x = Math.cos(x * Math.PI / 180.0);
    const sin_x = Math.sin(x * Math.PI / 180.0);
    const cos_y = Math.cos(y * Math.PI / 180.0);
    const sin_y = Math.sin(y * Math.PI / 180.0);
    return {
        right: {
            x: -cos_y,
            y: 0.0,
            z: -sin_y
        },
        up: {
            x: -(sin_y * sin_x),
            y: cos_x,
            z: cos_y * sin_x
        },
        forward: {
            x: -(sin_y * cos_x),
            y: -sin_x,
            z: cos_y * cos_x
        }
    }
}

var last_motion_y = 0;
register("tick", () => {
    if (!Player) return;
    last_motion_y = Player.getMotionY();
});

export function getCameraRotationX() {
    let bobbing_offset = 0;
    if (Client.settings.video.getBobbing()) {
        const player = Player.getPlayer();
        const partial_ticks = Tessellator.partialTicks;
        const distance_walked = player.field_70140_Q;
        const prev_distance_walked = player.field_70141_P;
        const camera_yaw = player.field_71109_bG;
        const prev_camera_yaw = player.field_71107_bF;

        const f1 = -(distance_walked + (distance_walked - prev_distance_walked) * partial_ticks);
        const f2 = prev_camera_yaw + (camera_yaw - prev_camera_yaw) * partial_ticks;
        bobbing_offset =   (Math.abs(Math.cos(f1 * Math.PI - 0.2) * f2) * 5.0) + (-Math.abs(Math.cos(f1 * Math.PI) * f2))
                         - ((last_motion_y + (Player.getMotionY() - last_motion_y) * Tessellator.partialTicks) * 2.75);
    }

    if (Client.settings.getSettings().field_74320_O == 2)
        return -Renderer.getRenderManager().field_78732_j + bobbing_offset;
    return Renderer.getRenderManager().field_78732_j + bobbing_offset;
}

export function getCameraRotationY() {
    return Renderer.getRenderManager().field_78735_i;
}

export function worldToScreen(x, y, z) {
    const camera = getCameraLocation();
    const axis = getCameraRotationAxis();

    const width = Renderer.screen.getWidth();
    const height = Renderer.screen.getHeight();
    const aspect_ratio = width / height;
    const fovy = Client.settings.getFOV();
    const py = Math.tan(fovy * Math.PI / 360.0);
    
    const fovx = 2 * Math.atan( py * aspect_ratio );
    const px = Math.tan(fovx / 2.0);
    
    const xc = width / 2.0;
    const yc = height / 2.0;

    let transform = {
        x: x - camera.x,
        y: y - camera.y,
        z: z - camera.z
    }

    let zd = dotProduct(transform, axis.forward);
    let infront = zd > 0;
    if (!infront) {
        zd *= -1;
    }

    return {
        x: xc + dotProduct(transform, axis.right) * xc / (zd * px),
        y: yc - dotProduct(transform, axis.up) * yc / (zd * py),
        infront: infront
    }
}

function dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

export function getOffscreenPositionAndDirection(x, y, z, offset = 40) {
    let position = worldToScreen(x, y, z);
    const scale = Renderer.screen.getScale();
    offset /= scale;
    
    const width = Renderer.screen.getWidth();
    const height = Renderer.screen.getHeight();
    const offscreen_distance = width > height ? height / 2 - offset : width / 2 - offset;

    const xc = width / 2.0;
    const yc = height / 2.0;

    let direction = {
        x: position.x - xc,
        y: position.y - yc,
    }
    const magnitude = Math.sqrt(direction.x**2 + direction.y**2);
    direction.x /= magnitude;
    direction.y /= magnitude;

    if (magnitude <= offscreen_distance && position.infront)
        return undefined;

    position.x = direction.x * offscreen_distance + xc;
    position.y = direction.y * offscreen_distance + yc;
    return {
        position: position,
        direction: direction
    };
}

export function drawOffscreenPointer(x, y, z, r, g, b, string = undefined, show_distance = true, show_arrow = true) {
    const scale = Renderer.screen.getScale();
    const size = string ? 10 : 5;
    GL11.glLineWidth(5);

    let offscreen = getOffscreenPositionAndDirection(x, y, z);
    if (!offscreen)
        return false;

    Renderer.retainTransforms(true);
    Renderer.translate(offscreen.position.x, offscreen.position.y);
    if (Settings.waypoint_arrow_gui_scale)
        Renderer.scale(Settings.waypoint_arrow_gui_scale / scale);
    if (string) {
        const fontRenderer = Renderer.getFontRenderer();
        const lines = string.split("\n");
        if (show_distance) {
            const distance_sq = (Player.getRenderX() - x)**2 + (Player.getRenderY() + 1 - y)**2 + (Player.getRenderZ() - z)**2;
            const distance = Math.sqrt(distance_sq);
            lines.push(`§e${Math.floor(distance)}m`);
        }
        const longest_width = longestStringWidth(lines);
        lines.forEach((line, idx) => {
            const width = stringWidth(line);
            const x = (-longest_width * ((offscreen.direction.x + 1) / 2) + (-offscreen.direction.x * size * 2)) + (- width / 2) + (longest_width / 2);
            const y = (-offscreen.direction.y * size * 2) + (-offscreen.direction.y * lines.length * 2.25) - (lines.length * 4.5) + (idx * 9)
            if (Settings.waypoint_show_box) {
                Renderer.drawRect(Renderer.color(0, 0, 0, 63), x - 1, y - 1, width + 2, 9);
            }
            fontRenderer.func_175065_a(line, x, y, Renderer.WHITE, false);
        });
    }

    if (show_arrow) {
        Renderer.rotate(Math.atan2(offscreen.direction.y, offscreen.direction.x) * 180.0 / Math.PI);
    
        if (isNaN(r)) r = 0;
        if (isNaN(g)) g = 0;
        if (isNaN(b)) b = 0;
        Renderer.drawShape(Renderer.color(Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)), [
            [-size, -size],
            [0, 0],
            [-size, size]
        ], 3)
    }
    
    Renderer.retainTransforms(false);

    return string !== undefined;
}