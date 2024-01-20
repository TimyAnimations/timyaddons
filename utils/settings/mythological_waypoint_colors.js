import { 
    @Vigilant, 
    @ButtonProperty 
    @SwitchProperty, 
    @SelectorProperty, 
    @SliderProperty, 
    @TextProperty, 
    @CheckboxProperty, 
    @ColorProperty, 
    @PercentSliderProperty,
    Color 
} from "Vigilance";
import { @Triggable } from "./triggerable_settings";

@Triggable()
@Vigilant("TimyAddons/data/mythological_waypoint_colors", "Mythological Waypoint Colors")
class Settings {
    constructor() {
        this.initialize(this);
    }

    @ColorProperty({
        name: "Guess Waypoint Color",
        description: "",
        category: "Mythological"
    })
    color_guess = new Color(0.0, 1.0, 1.0);
    @ColorProperty({
        name: "Burrow Waypoint Color",
        description: "",
        category: "Mythological"
    })
    color_burrow = new Color(0.5, 1.0, 0.0);
    @ColorProperty({
        name: "Mob Burrow Waypoint Color",
        description: "",
        category: "Mythological"
    })
    color_mob = new Color(0.0, 0.5, 1.0);
    @ColorProperty({
        name: "Treasure Burrow Waypoint Color",
        description: "",
        category: "Mythological"
    })
    color_treasure = new Color(1.0, 0.5, 0.0);

    @ButtonProperty ({
        name: "Reset to Default",
        description: "",
        category: "Mythological"
    })
    reset_colors = () => {
        this.updateValue("Guess Waypoint Color", new Color(0.0, 1.0, 1.0));
        this.updateValue("Burrow Waypoint Color", new Color(0.5, 1.0, 0.0));
        this.updateValue("Mob Burrow Waypoint Color", new Color(0.0, 0.5, 1.0));
        this.updateValue("Treasure Burrow Waypoint Color", new Color(1.0, 0.5, 0.0));
        this.openGUI();
    };
}

export default new Settings();