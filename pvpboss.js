import Developer from "./utils/settings/developer";
Developer.registerSetting("Or PVP Boss", "attackEntity", () => {
    if (Math.random() > 0.2) return;
    Client.showTitle("或者PVP老大", "Or PVP Boss", 0, 20, 10);
});