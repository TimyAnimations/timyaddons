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
@Vigilant("TimyAddons/data/developer", "Timy Addons (1.0.0)", {
    getCategoryComparator: () => (a, b) => {
        const categories = [
            "General", "Crimson Isles", "Crystal Hollows", 
            "Garden", "Slayer", "Dungeons", "Kuudra", 
            "Bestiary", "Combat", "Fishing", "Mythological", 
            "Waypoint", "Items"
        ];

        return categories.indexOf(a.name) - categories.indexOf(b.name);
    }
})
class Settings {
    constructor() {
        this.initialize(this);
    }
    @SwitchProperty({
        name: "Display Arrow and Spade Lines",
        description: "These lines are used to triangulate the position of the next burrow",
        category: "Mythological",
    })
    mythological_dev_lines = false;
    @SwitchProperty({
        name: "Display Individual Technique Guesses",
        description: "The guess waypoint takes the average position of these locations, but useful if you want to see the prediction individual techiques came up with",
        category: "Mythological",
    })
    mythological_dev_positions = false;
    @SwitchProperty({
        name: "Display Burrow Detection Info",
        description: "Display's information about the burrow detection system, like particle count, and confirmed position",
        category: "Mythological",
    })
    mythological_dev_burrow_particle = false;
}

export default new Settings();