import renderBeaconBeam2 from "../../BeaconBeam/index";
import { drawWorldString, drawOutlinedBox } from "./render";
import Settings from "./settings/main";

export function drawWaypoint(name, x, y, z, r, g, b, depth_check, beacon = true) {

    const distance_sq = (Player.getRenderX() - (x + 0.5))**2 + (Player.getRenderZ() - (z + 0.5))**2;
    if (beacon && Settings.waypoint_show_beacon) {
        const alpha = distance_sq > 25.0 ? 1.0 : distance_sq / 25.0;
        renderBeaconBeam2(x, y + 1, z, r, g, b, alpha, depth_check || !Settings.waypoint_infront);
    }

    GL11.glLineWidth(2);
    GL11.glDisable(GL11.GL_TEXTURE_2D);

    GlStateManager.func_179094_E(); // pushMatrix()
    if (depth_check || !Settings.waypoint_infront) 
        Tessellator.enableDepth();
    else 
        Tessellator.disableDepth();
    Tessellator.disableLighting();

    drawOutlinedBox(x, y, z, r, g, b);

    Tessellator.enableDepth()
    Tessellator.enableLighting();

    GlStateManager.func_179121_F(); // popMatrix()
    GL11.glEnable(GL11.GL_TEXTURE_2D);

    if (name !== "") {
        // let distance = Math.sqrt(distance_sq);
        // if (distance_sq > 90_000) {
        //     x = (x + 0.5) - Player.getRenderX();
        //     z = (z + 0.5) - Player.getRenderZ();
        //     x *= 300 / distance;
        //     z *= 300 / distance;
        // }
        // let size = 0.45 * distance / 120;
        // if (size < 0.025) size = 0.025;
        // Tessellator.drawString(name, x + 0.5, y + 2.0, z + 0.5, 0xFFFFFF, true, size, false);
        drawWorldString(name, x + 0.5, y + 2.0, z + 0.5, 1.0, true, Settings.waypoint_show_distance);
    }
};

export class Waypoint {

    render_trigger = register("renderWorld", (partial_ticks) => {
        this.render(partial_ticks);
    });

    tick_trigger = register("tick", () => {
        this.tick();
    });

    visible = false;
    smooth = false;
    tick = this.tickInstant;
    constructor(name = "", x = 0, y = 0, z = 0, r = 1.0, g = 1.0, b = 1.0, depth_check = false, aligned = true, beacon = true) {
        this.name = name;
        this.x = Math.floor(x);
        this.y = Math.floor(y);
        this.z = Math.floor(z);
        this.current_x = this.x;
        this.current_y = this.y;
        this.current_z = this.z;
        this.last_x = this.x;
        this.last_y = this.y;
        this.last_z = this.z;
        this.r = r;
        this.g = g;
        this.b = b;
        this.depth_check = depth_check;
        this.aligned = aligned;
        this.beacon = beacon;
        this.render_trigger.unregister();
        this.tick_trigger.unregister();
    }

    destructor() {
        this.render_trigger.unregister();
        this.tick_trigger.unregister();
        this = undefined;
    }

    setColor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
        return this;
    }

    setPosition(x, y, z) {
        this.x = this.aligned ? Math.floor(x) : x - 0.5;
        this.y = this.aligned ? Math.floor(y) : y - 0.5;
        this.z = this.aligned ? Math.floor(z) : z - 0.5;
        return this;
    }

    setVisualPosition(x, y, z) {
        this.current_x = this.aligned ? Math.floor(x) : x - 0.5;
        this.current_y = this.aligned ? Math.floor(y) : y - 0.5;
        this.current_z = this.aligned ? Math.floor(z) : z - 0.5;
        return this;
    }

    attachToEntity(entity, offset_x = 0, offset_y = 0, offset_z = 0) {
        this.current_x = entity.getX() - 0.5 + offset_x;
        this.current_y = entity.getY() - 3.0 + offset_y;
        this.current_z = entity.getZ() - 0.5 + offset_z;
        this.last_x = entity.getLastX() - 0.5 + offset_x;
        this.last_y = entity.getLastY() - 3.0 + offset_y;
        this.last_z = entity.getLastZ() - 0.5 + offset_z;
        this.setPosition(
            this.current_x,
            this.current_y,
            this.current_z
        )
        return this;
    }

    hide() {
        if (!this.visible) return this;
        this.visible = false;
        this.render_trigger.unregister();
        this.tick_trigger.unregister();
        return this;
    }
    unregister = this.hide;
    show(tick_update = true) {
        if (this.visible) return this;
        this.visible = true;
        this.current_x = this.x;
        this.current_y = this.y;
        this.current_z = this.z;
        this.last_x = this.x;
        this.last_y = this.y;
        this.last_z = this.z;
        this.render_trigger.register();
        if (tick_update) this.tick_trigger.register();
        return this;
    }
    register = this.show;

    render(partial_ticks) {
        drawWaypoint(
            this.name, 
            this.last_x + (this.current_x - this.last_x) * partial_ticks, 
            this.last_y + (this.current_y - this.last_y) * partial_ticks, 
            this.last_z + (this.current_z - this.last_z) * partial_ticks, 
            this.r, this.g, this.b, this.depth_check, this.beacon
        );
    }

    makeMovementInstant() {
        this.smooth = false;
        this.tick = this.tickInstant;
    }

    tickInstant() {
        this.last_x = this.current_x;
        this.last_y = this.current_y;
        this.last_z = this.current_z;
        this.current_x = this.x;
        this.current_y = this.y;
        this.current_z = this.z;
    }

    makeMovementSmooth() {
        this.smooth = true;
        this.velocity_x = 0;
        this.velocity_y = 0;
        this.velocity_z = 0;
        this.speed = 20;
        this.acceleration = 0.5;
        this.damp = 0.5;
        this.tick = this.tickSmooth;
    }

    tickSmooth() {
        this.last_x = this.current_x;
        this.last_y = this.current_y;
        this.last_z = this.current_z;

        let goal_velocity_x = this.x - this.current_x;
        let goal_velocity_y = this.y - this.current_y;
        let goal_velocity_z = this.z - this.current_z;
        let length_sq = (goal_velocity_x)**2 + (goal_velocity_y)**2 + (goal_velocity_z)**2;
        if (length_sq > this.speed**2) {
            let length = Math.sqrt(length_sq);
            goal_velocity_x *= this.speed / length;
            goal_velocity_y *= this.speed / length;
            goal_velocity_z *= this.speed / length;
        }
        
        let acc_x = (goal_velocity_x - this.velocity_x) * this.acceleration;
        let acc_y = (goal_velocity_y - this.velocity_y) * this.acceleration;
        let acc_z = (goal_velocity_z - this.velocity_z) * this.acceleration;
        
        this.velocity_x += acc_x;
        this.velocity_y += acc_y;
        this.velocity_z += acc_z;

        this.velocity_x *= this.damp;
        this.velocity_y *= this.damp;
        this.velocity_z *= this.damp;

        // let length_sq = (this.velocity_x)**2 + (this.velocity_y)**2 + (this.velocity_z)**2;
        // if (length_sq > this.speed**2) {
        //     let length = Math.sqrt(length_sq);
        //     this.velocity_x *= this.speed / length;
        //     this.velocity_y *= this.speed / length;
        //     this.velocity_z *= this.speed / length;
        // }

        this.current_x += this.velocity_x;
        this.current_y += this.velocity_y;
        this.current_z += this.velocity_z;

    }

    getTriggers() {
        return [this.render_trigger, this.tick_trigger];
    }

    atPosition(x, y, z) {
        if (this.aligned)
            return this.x == Math.floor(x) && this.y == Math.floor(y) && this.z == Math.floor(z)
    
        return Math.floor(this.x) == Math.floor(x) && Math.floor(this.y) == Math.floor(y) && Math.floor(this.z) == Math.floor(z)
    }

}

// var test = new Waypoint("test", 0, 70, 0, 1, 1, 1, false, true, false);
// test.show();