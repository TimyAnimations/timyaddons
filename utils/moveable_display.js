import { MoveableGui } from "./moveable_gui";
export class MoveableDisplay extends MoveableGui {
    constructor(name, init_x = 10, init_y = 10, init_width = 10, init_height = 10, init_scale = 1.0) {
        super(name, () => {}, init_x, init_y, init_width, init_height, init_scale);
        this.lines = [];
        this.render_trigger = register("renderOverlay", () => { this.draw(); });
        this.draw_func = () => {
            // ChatLib.chat("test");
            // ChatLib.chat(this.lines.join('\n'));
            Renderer.drawString(this.lines.join('\n'), 0, 0);
        }
    }
    addLine(line) {
        this.lines.push(line);
        this.calculateSize();
    };
    // addLines = this.display.addLines;
    clearLines() {
        this.lines = [];
    };
    // getAlign = this.display.getAlign;
    // getBackground = this.display.getBackground;
    // getBackgroundColor = this.display.getBackgroundColor;
    // getHeight = this.display.getHeight;
    // getLine = this.display.getLine;
    // getLines = this.display.getLines;
    // getMinWidth = this.display.getMinWidth;
    // getOrder = this.display.getOrder;
    // getRegisterType = this.display.getRegisterType;
    // getRenderX = this.display.getRenderX;
    // getRenderY = this.display.getRenderY;
    // getTextColor = this.display.getTextColor;
    // getWidth = this.display.getWidth;
    // removeLine = this.display.removeLine;
    // render = this.display.render;
    // setAlign = this.display.setAlign;
    // setBackground = this.display.setBackground;
    // setBackgroundColor = this.display.setBackgroundColor;
    setLine(index, line) {
        if (this.lines.length < index + 1)
            this.lines.length = index + 1;
        this.lines[index] = line;

        this.calculateSize();
    }

    hide() { this.render_trigger.unregister(); }
    show() { this.render_trigger.register(); }

    calculateSize() {
        let longest_width = 0;
        this.lines.forEach((line) => {
            let width = Renderer.getStringWidth(line);
            if (longest_width < width) longest_width = width;
        });

        this.setWidth(longest_width);
        this.setHeight(this.lines.length * 9);
    }
    // setLines = this.display.setLines;
    // setMinWidth = this.display.setMinWidth;
    // setOrder = this.display.setOrder;
    // setRegisterType = this.display.setRegisterType;
    // setTextColor = this.display.setTextColor;
    // toString = this.display.toString;
}