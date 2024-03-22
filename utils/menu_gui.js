import { stringWidth } from "./format";
import { drawCheckbox } from "./render";

const HEIGHT = 9;
export class Button {
    constructor(text, invoke_func = undefined, background_color = undefined) {
        this.text = text;
        this.x = 0;
        this.y = 0;
        this.invoke_func = invoke_func;
        this.endline = /.*\n$/.test(text);
        this.width = 0;
        this.background_color = background_color;
    }

    draw(mouse_x, mouse_y, parent_x = 0, parent_y = 0) {
        if (this.background_color)
            Renderer.drawRect(
                this.background_color, 
                this.getX() - 1 + parent_x, this.getY() - 1 + parent_y, 
                this.width, HEIGHT
            );
        if (this.invoke_func && this.inArea(mouse_x - parent_x, mouse_y - parent_y)) {
            Renderer.drawRect(
                Renderer.color(255, 255, 255, 64), 
                this.getX() - 1 + parent_x, this.getY() - 1 + parent_y, 
                this.width, HEIGHT
            );
        }
    }

    clicked(mouse_x, mouse_y, mouse_button, parent_x = 0, parent_y = 0) {
        if (this.invoke_func && this.inArea(mouse_x - parent_x, mouse_y - parent_y)) {
            World.playSound("gui.button.press", 1.0, 1.0);
            this.invoke_func(mouse_x, mouse_y, mouse_button)
        }
    }

    calculateWidth() {
        this.width = stringWidth(this.text);
        return this.width;
    }

    inArea(x, y) {
        return (x >= this.getX() && x < this.getX() + this.width &&
                y >= this.getY() && y < this.getY() + HEIGHT);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
}

export class Checkbox extends Button {
    constructor(text, invoke_func = () => {}, read_func = () => false) {
        super(`    ${text}`, invoke_func);
        this.padding = 0;
        text.match(/^\s*/).forEach((match) => {
            this.padding += match.length;
        });
        this.read_func = read_func;
    }

    draw(mouse_x, mouse_y, parent_x = 0, parent_y = 0) {
        super.draw(mouse_x, mouse_y, parent_x, parent_y);
        drawCheckbox(this.getX() + (this.padding * 3) + parent_x, this.getY() + parent_y, this.read_func());
    }
}

export class GuiMenu {
    constructor(x = 0, y = 0, content = []) {
        this.x = x;
        this.y = y;
        this.width = 0;
        this.height = 0;
        this.string = "";
        this.buttons = [];
        this.anchor_x = 0.0;
        this.anchor_y = 0.0;
        this.align_x = 0.0;
        this.align_y = 0.0;
        this.setContent(content);
    }

    draw(mouse_x, mouse_y) {
        Renderer.drawRect(Renderer.color(0, 0, 0, 127), this.getX() - 1, this.getY() - 1, this.width, this.height);
        this.buttons.forEach((button) => {
            button.draw(mouse_x, mouse_y, this.getX(), this.getY());
        })
        Renderer.drawString(this.string, this.getX(), this.getY());
    }

    clicked(mouse_x, mouse_y, mouse_button) {
        this.buttons.forEach((button) => {
            button.clicked(mouse_x, mouse_y, mouse_button, this.getX(), this.getY())
        });
    }

    addContent(content = []) {
        this.setContent([...this.content, ...content]);
    }

    changeContentText(idx, text) {
        if (idx < 0 || idx > content.length) return;
        if (typeof this.content[idx] === "string")
            this.content[idx] = text;
        if (element instanceof Button || element instanceof Checkbox)
            this.content[idx].text = text;

        this.setContent(this.content);
    }

    setContent(content = []) {
        this.content = content;
        let current_x = 0
        let current_y = 0;
        this.width = 0;
        this.string = "";
        this.buttons = [];
        content.forEach((element, idx) => {
            if (typeof element === "string") {
                this.string += element;
                current_x += stringWidth(element);
                if (/.*\n$/.test(element) || idx == content.length - 1) {
                    if (this.width < current_x + 1)
                        this.width = current_x + 1;
                    current_x = 0;
                    current_y += 9;
                }
            }
            if (element instanceof Button || element instanceof Checkbox) {
                this.string += element.text;
                this.buttons.push(element);
                element.setPosition(current_x, current_y);
                let current_width = element.calculateWidth(this.width);
                current_x += current_width;
                if (element.endline || idx == content.length - 1) {
                    element.endline = true;
                    if (this.width < current_x + 1)
                        this.width = current_x + 1;
                    current_x = 0;
                    current_y += 9;
                }
            }
        })
        this.height = current_y;
        this.buttons.forEach((button) => {
            if (button.endline)
                button.width = this.width - button.x;
        })
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    getX() {
        return (Renderer.screen.width * this.anchor_x) + this.x - (this.align_x * this.width);
    }
    getY() {
        return (Renderer.screen.height * this.anchor_y) + this.y - (this.align_y * this.height);
    }

    inArea(x, y) {
        return (x >= this.getX() && x < this.getX() + this.width &&
                y >= this.getY() && y < this.getY() + this.height);
    }

    setAnchor(x, y) {
        this.anchor_x = x;
        this.anchor_y = y;
    }
    setAlign(x, y) {
        this.align_x = x;
        this.align_y = y;
    }
}

// let test_bool = false;
// let test_bool2 = true;
// let test = new GuiMenu(10, 200, [
//     "Example:\n", 
//     new Button("BUTTON 1 ", () => { ChatLib.chat("CLICKED 1"); }),
//     new Button("BUTTON 2\n", () => { ChatLib.chat("CLICKED 2"); }),
//     new Button("BUTTON 3\n", () => { ChatLib.chat("CLICKED 3"); }),
//     "Example 2: ",
//     new Button("BUTTON 4\n", () => { ChatLib.chat("CLICKED 4"); }),
//     "Example 3:\n",
//     new Button("BUTTON 5\n", () => { ChatLib.chat("CLICKED 5"); }),
//     new Checkbox("CHECKBOX 1\n", () => { test_bool = !test_bool }, () => test_bool ),
//     new Checkbox("   CHECKBOX 2\n", () => { test_bool2 = !test_bool2 }, () => test_bool2 )
// ]);

// register("guiRender", (mouse_x, mouse_y) => {
//     GlStateManager.func_179140_f();
//     test.draw(mouse_x, mouse_y);
// })

// register("guiMouseClick", (mouse_x, mouse_y, button) => {
//     test.clicked(mouse_x, mouse_y, button);
// })
