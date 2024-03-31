import { Label, Button, Checkbox, GuiMenu } from "./menu_gui";

const IMPORT_NAME = "TimyAddons/data"
const LOCATION_DATA_FILE = "moveable_gui_locations.json"

const GRAB_EDGE_THRESHOLD = 6;

export class MoveableGui {
    constructor(name, draw_func = () => {}, init_x = 10, init_y = 10, init_width = 10, init_height = 10, init_scale_x = 1.0, init_scale_y = undefined) {
        this.name = name;

        this.init_x = init_x;
        this.init_y = init_y;
        this.init_scale_x = init_scale_x;
        this.init_scale_y = init_scale_y ?? init_scale_x;
        this.x = init_x;
        this.y = init_y;
        this.scale_x = init_scale_x;
        this.scale_y = this.init_scale_y;
        this.safeLoad(init_x, init_y, init_scale_x, this.init_scale_y);
        
        this.width = init_width;
        this.height = init_height;

        this.grab_area = undefined;
        this.mouse_grab_loc = undefined;

        this.last_x = this.x;
        this.last_y = this.y;
        this.opposite_corner_x = this.x + this.width * this.scale_x;
        this.opposite_corner_y = this.y + this.height * this.scale_y;
        this.grab_edge_x = 0;
        this.grab_edge_y = 0;

        this.visual_aligning_x = undefined;
        this.visual_aligning_y = undefined;

        this.key_functions = {};

        this.draw_func = draw_func;
        this.draw = (...args) => {
            if (this.gui.isOpen()) return;
            Renderer.retainTransforms(true);
            Renderer.translate(this.x, this.y);
            Renderer.scale(this.scale_x, this.scale_y);
            this.draw_func(this.x, this.y, this.size_x, this.size_y, ...args);
            Renderer.retainTransforms(false);
        }

        this.tooltip = new GuiMenu();
        this.tooltip_content = [
            new Label("§6[R]&r"), new Button(" §cReset\n", () => { this.reset(); }), 
        ];

        this.gui = new Gui();
        
        this.gui.registerDraw((mouse_x, mouse_y) => { this.selectedDraw(mouse_x, mouse_y); });
        this.gui.registerClosed(() => {
            this.save();
        });
        this.gui.registerMouseDragged((...args) => { this.mouseDragged(...args); });
        this.gui.registerClicked((...args) => { this.mouseClicked(...args); });
        this.gui.registerMouseReleased((...args) => { this.mouseReleased(...args); });
        this.gui.registerKeyTyped((...args) => { this.keyTyped(...args); });
    }

    selectedDraw(mouse_x, mouse_y, r = 1.0, g = 1.0, b = 1.0) {
        Renderer.retainTransforms(true);
        Renderer.translate(this.x, this.y);
        Renderer.scale(this.scale_x, this.scale_y);
        this.draw_func(this.x, this.y, this.size_x, this.size_y);
        Renderer.retainTransforms(false);
    
        const scale_string = this.scale_x == this.scale_y 
                                ? `scale: ${this.scale_x.toFixed(2)}` 
                                : `scale x: ${this.scale_x.toFixed(2)}, scale y: ${this.scale_y.toFixed(2)}`
        
        let corners = this.getCorners();

        this.tooltip.setContent([
            new Label(`x: ${this.x.toFixed(1)}, y: ${this.y.toFixed(1)}, ${scale_string}\n`),
            ...this.tooltip_content
        ]);
        
        let tooltip_x = this.x < 0 ? 0 : ( this.x < Renderer.screen.getWidth() - this.tooltip.width ? this.x : Renderer.screen.getWidth() - this.tooltip.width );
        if (this.y > Renderer.screen.getHeight() / 2) {
            this.tooltip.setPosition(tooltip_x, this.y - 1);
            this.tooltip.setAlign(0.0, 1.0);
        }
        else {
            this.tooltip.setPosition(tooltip_x, corners[3][1] + 4);
            this.tooltip.setAlign(0.0, 0.0);
        }

        this.tooltip.draw(mouse_x, mouse_y);

        Renderer.drawShape(Renderer.color(Math.floor(230 * r), Math.floor(230 * g), Math.floor(230 * b), 230), corners, 2);
        corners.forEach((corner) => {
            Renderer.drawRect(Renderer.color(Math.floor(255 * r), Math.floor(255 * g), Math.floor(255 * b), 255), corner[0] - 2, corner[1] - 2, 4, 4);
        });

        if (this.visual_aligning_x)
            Renderer.drawLine(Renderer.color(127, 200, 255, 127), this.visual_aligning_x, 0, this.visual_aligning_x, Renderer.screen.getHeight(), 1);
        if (this.visual_aligning_y)
            Renderer.drawLine(Renderer.color(127, 200, 255, 127), 0, this.visual_aligning_y, Renderer.screen.getWidth(), this.visual_aligning_y, 1);
    }
    
    deselectedDraw(r = 1.0, g = 1.0, b = 1.0) {
        Renderer.retainTransforms(true);
        Renderer.translate(this.x, this.y);
        Renderer.scale(this.scale_x, this.scale_y);
        this.draw_func(this.x, this.y, this.size_x, this.size_y);
        Renderer.retainTransforms(false);

        let corners = this.getCorners();
        Renderer.drawShape(Renderer.color(Math.floor(130 * r), Math.floor(130 * g), Math.floor(130 * b), 130), corners, 2);
    }

    mouseDragged(mouse_x, mouse_y, button, point_aligns = [], x_axis_aligns = [], y_axis_aligns = []) {
        if (!this.mouse_grab_loc) return;
        // drag
        if (this.grab_edge_x === 0 && this.grab_edge_y === 0) {
            let new_x = mouse_x - this.mouse_grab_loc.x;
            let new_y = mouse_y - this.mouse_grab_loc.y;

            this.visual_aligning_x = undefined;
            this.visual_aligning_y = undefined;
            
            if (this.gui.isShiftDown()) {
                if (Math.abs( new_x - this.last_x ) > Math.abs( new_y - this.last_y ))
                    new_y = this.last_y;
                else
                    new_x = this.last_x;
            }
            else {
                const SNAP_DISTANCE = 5;
                let closest_distance_sq = SNAP_DISTANCE**2;
                let closest_point_align = undefined;
                point_aligns?.forEach((point_align) => {
                    const distance_sq = (new_x - point_align.x)**2 + (new_y - point_align.y)**2;
                    if (distance_sq < closest_distance_sq) {
                        closest_distance_sq = distance_sq;
                        closest_point_align = point_align;
                    }
                });
                if (closest_point_align) {
                    new_x = closest_point_align.x;
                    new_y = closest_point_align.y;
                    this.visual_aligning_x = closest_point_align.x;
                    this.visual_aligning_y = closest_point_align.y;
                }
                else {
                    let closest_x_distance = SNAP_DISTANCE;
                    let closest_x_axis_align = undefined;
                    x_axis_aligns?.forEach((x_axis_align) => {
                        const distance = Math.abs(new_x - x_axis_align);
                        if (distance < closest_x_distance) {
                            closest_x_distance = distance;
                            closest_x_axis_align = x_axis_align;
                        }
                    })
                    if (closest_x_axis_align) {
                        new_x = closest_x_axis_align;
                        this.visual_aligning_x = closest_x_axis_align;
                    }
                    
                    let closest_y_distance = SNAP_DISTANCE;
                    let closest_y_axis_align = undefined;
                    y_axis_aligns?.forEach((y_axis_align) => {
                        const distance = Math.abs(new_y - y_axis_align);
                        if (distance < closest_y_distance) {
                            closest_y_distance = distance;
                            closest_y_axis_align = y_axis_align;
                        }
                    })
                    if (closest_y_axis_align) {
                        new_y = closest_y_axis_align;
                        this.visual_aligning_y = closest_y_axis_align;
                    }
                }
            }
            if (this.gui.isControlDown()) {
                new_x = (new_x * 0.1) + (this.last_x * 0.9);
                new_y = (new_y * 0.1) + (this.last_y * 0.9);
            }

            this.x = new_x;
            this.y = new_y;
            return;
        }
        
        // scale
        let scale_x = 0;
        let scale_y = 0;
        if (this.grab_edge_x) {
            scale_x = this.grab_edge_x === 1 
                ? (mouse_x - this.x) / this.width 
                :(-mouse_x + this.opposite_corner_x) / this.width;
            if (scale_x < 0.1) scale_x = 0.1;
        }
        if (this.grab_edge_y) {
            scale_y = this.grab_edge_y === 1 
                ? (mouse_y - this.y) / this.height 
                :(-mouse_y + this.opposite_corner_y) / this.height;
            if (scale_y < 0.1) scale_y = 0.1;
        }

        if (this.gui.isShiftDown()) {
            this.scale_x = scale_x ? scale_x : this.scale_x;
            this.scale_y = scale_y ? scale_y : this.scale_y;
        }
        else {
            const aspect_ratio = this.scale_x / this.scale_y;
            if (scale_x > scale_y * aspect_ratio) {
                this.scale_x = scale_x;
                this.scale_y = scale_x / aspect_ratio;
            }
            else {
                this.scale_x = scale_y * aspect_ratio;
                this.scale_y = scale_y;
            }
        }

        if (this.grab_edge_x === -1) 
            this.x = this.opposite_corner_x - (this.width * this.scale_x);
        if (this.grab_edge_y === -1)
            this.y = this.opposite_corner_y - (this.height * this.scale_y);
        
    }

    mouseClicked(mouse_x, mouse_y, button) {
        if (this.inTooltip(mouse_x, mouse_y)) {
            this.tooltip.clicked(mouse_x, mouse_y, button);
            return true;
        }

        this.setGrabArea();
        
        this.last_x = this.x;
        this.last_y = this.y;
        this.opposite_corner_x = this.x + this.width * this.scale_x;
        this.opposite_corner_y = this.y + this.height * this.scale_y;
        this.grab_edge_x = 0;
        this.grab_edge_y = 0;

        const relative_x = mouse_x - this.x;
        const relative_y = mouse_y - this.y;
        
        if (this.grab_area && (relative_x < this.grab_area.x.min || relative_x > this.grab_area.x.max ||
            relative_y < this.grab_area.y.min || relative_y > this.grab_area.y.max))
        {
            if (relative_y >= this.grab_area.y.min -GRAB_EDGE_THRESHOLD && relative_y <= (this.grab_area.y.max) + GRAB_EDGE_THRESHOLD) {
                if (relative_x < this.grab_area.x.min && relative_x >= this.grab_area.x.min - GRAB_EDGE_THRESHOLD)
                    this.grab_edge_x = -1;
                if (relative_x > this.grab_area.x.max && relative_x <= (this.grab_area.x.max) + GRAB_EDGE_THRESHOLD)
                    this.grab_edge_x = 1;
            }
            if (relative_x >= this.grab_area.x.min -GRAB_EDGE_THRESHOLD && relative_x <= (this.grab_area.x.max) + GRAB_EDGE_THRESHOLD) {
                if (relative_y < this.grab_area.y.min && relative_y >= this.grab_area.y.min - GRAB_EDGE_THRESHOLD)
                    this.grab_edge_y = -1;
                if (relative_y > this.grab_area.y.max && relative_y <= (this.grab_area.y.max) + GRAB_EDGE_THRESHOLD)
                    this.grab_edge_y = 1;
            }

            if (this.grab_edge_x === 0 && this.grab_edge_y === 0) return false;
        }
        this.mouse_grab_loc = {
            x: relative_x,
            y: relative_y
        };
        return true;
    }

    inTooltip(x, y) {
        return this.tooltip !== undefined && this.tooltip.inArea(x, y);
    }

    mouseReleased(mouse_x, mouse_y, button) {
        this.mouse_grab_loc = undefined;
        this.visual_aligning_x = undefined;
        this.visual_aligning_y = undefined;
    }

    keyTyped(char, key) {
        const aspect_ratio = this.scale_x / this.scale_y;
        switch (key) {
            case 19: // r (reset)
                this.reset();
                break;
            case 200: this.y = Math.floor(this.y - 1); break; // up
            case 208: this.y = Math.floor(this.y + 1); break; // down
            case 205: this.x = Math.floor(this.x + 1); break; // right
            case 203: this.x = Math.floor(this.x - 1); break; // left
            case 12: // minus (scale)
                this.scale_x -= 0.1;
                if (this.scale_x < 0.1) this.scale_x = 0.1;
                this.scale_y = this.scale_x / aspect_ratio;
                break; 
            case 13: // plus (scale)
                this.scale_x += 0.1;
                if (this.scale_x < 0.1) this.scale_x = 0.1;
                this.scale_y = this.scale_x / aspect_ratio;
                break;
            default:
                if (this.key_functions[key])
                    this.key_functions[key]();
        }
    }

    addKeyFunction(key, invoke_func) {
        this.key_functions[key] = invoke_func;
    }

    safeLoad(init_x = 10, init_y = 10, init_scale_x = 1.0, init_scale_y = init_scale_x) {
        let location_file = FileLib.exists(IMPORT_NAME, LOCATION_DATA_FILE) 
                                ? FileLib.read(IMPORT_NAME, LOCATION_DATA_FILE)
                                : undefined;
        let saved_data = {};
        if (location_file)
            saved_data = JSON.parse(location_file);
        
        if (this.name in saved_data) {
            this.x = saved_data[this.name].x ?? init_x;
            this.y = saved_data[this.name].y ?? init_y;
            this.scale_x = saved_data[this.name].scale_x ?? init_scale_x;
            this.scale_y = saved_data[this.name].scale_y ?? init_scale_y;
        }
        else {
            saved_data[this.name] = {x: init_x, y: init_y, scale_x: init_scale_x, scale_y: init_scale_y};
            FileLib.write(IMPORT_NAME, LOCATION_DATA_FILE, JSON.stringify(saved_data));
        }
    }
    
    save() {
        let location_file = FileLib.read(IMPORT_NAME, LOCATION_DATA_FILE);
        let saved_data = {};
        if (location_file)
            saved_data = JSON.parse(location_file);

        saved_data[this.name] = {x: this.x, y: this.y, scale_x: this.scale_x, scale_y: this.scale_y};
        FileLib.write(IMPORT_NAME, LOCATION_DATA_FILE, JSON.stringify(saved_data));
    }

    edit() {
        this.gui.open();
        this.setGrabArea();
    }

    reset() {
        this.x = this.init_x;
        this.y = this.init_y;
        this.scale_x = this.init_scale_x;
        this.scale_y = this.init_scale_y;
    }

    setGrabArea(x_min = undefined, y_min = undefined, x_max = undefined, y_max = undefined) {
        this.grab_area = {
            x: {min: x_min ?? GRAB_EDGE_THRESHOLD / 2, max: x_max ?? (this.width * this.scale_x) - (GRAB_EDGE_THRESHOLD / 2)},
            y: {min: y_min ?? GRAB_EDGE_THRESHOLD / 2, max: y_max ?? (this.height * this.scale_y) - (GRAB_EDGE_THRESHOLD / 2)}
        }
    }

    inArea(x, y) {
        const relative_x = x - this.x;
        const relative_y = y - this.y;
        let opposite_corner_x = this.width * this.scale_x;
        let opposite_corner_y = this.height * this.scale_y;
        return relative_x >= 0 && relative_x <= opposite_corner_x && relative_y >= 0 && relative_y <= opposite_corner_y;
    }
    
    setRenderLoc(renderX, renderY) {
        this.x = renderX;
        this.y = renderY;
    }
    setRenderX(renderX) {
        this.x = renderX;
    }
    setRenderY(renderY) {
        this.y = renderY;
    }
    
    setHeight(height) {
        this.height = height;
    }
    setWidth(width) {
        this.width = width;
    }
    getRelativePos(x, y) {
        return {x: (x / this.scale_x) - (this.x / this.scale_x), y: (y / this.scale_y) - (this.y / this.scale_y)};
    }

    getCorners() {
        return [
            [this.x, this.y], 
            [this.x + this.width * this.scale_x, this.y], 
            [this.x + this.width * this.scale_x, this.y + this.height * this.scale_y], 
            [this.x, this.y + this.height * this.scale_y]
        ];
    }

    addTooltipContent(content) {
        this.tooltip_content = [...this.tooltip_content, ...content];
        return this;
    }
}

export default { MoveableGui, Button, Checkbox, GuiMenu };