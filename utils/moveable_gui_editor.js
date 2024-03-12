export function editMovableGuis(guis) {
    var selected_idx = 0;
    const gui = new Gui();

    gui.registerDraw(() => {
        for (let i = 0; i < guis.length; i++) {
            if (i === selected_idx)
                guis[i].selectedDraw();
            else
                guis[i].deselectedDraw();
        }
    });

    gui.registerClicked((mouse_x, mouse_y, button) => {
        for (let i = 0; i < guis.length; i++) {
            if (guis[i].inArea(mouse_x, mouse_y))
                selected_idx = i;
        }
        guis[selected_idx].mouseClicked(mouse_x, mouse_y, button);
    });

    gui.registerMouseDragged((mouse_x, mouse_y, button) => {
        guis[selected_idx].mouseDragged(mouse_x, mouse_y, button);
    });
    
    gui.registerMouseReleased((mouse_x, mouse_y, button) => {
        for (let i = 0; i < guis.length; i++) {
            guis[i].mouseReleased(mouse_x, mouse_y, button);
        }
    });

    gui.registerKeyTyped((char, key) => {
        guis[selected_idx].keyTyped(char, key);
    });

    gui.registerClosed(() => {
        for (let i = 0; i < guis.length; i++) {
            guis[i].save();
        }
    });

    for (let i = 0; i < guis.length; i++) {
        guis[i].setGrabArea();
    }

    gui.open();
}