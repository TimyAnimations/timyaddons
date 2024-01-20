import { drawOutlinedBox } from "../../utils/render";
import Settings from "../../utils/settings/main";

const SAFESPOTS = {
    square: [
        {x: -141, y: 76, z: -90}, 
        {x: -141, y: 77, z: -91}
    ],
    triangle: [
        {x: -86, y: 77, z: -129},
        {x: -87, y: 77, z: -129},
        {x: -88, y: 77, z: -129},
        {x: -90, y: 77, z: -128}
    ]
}

const SAFE_COLOR = {r: 0.0, g: 1.0, b: 0.5};
const SEMISAFE_COLOR = {r: 0.0, g: 0.5, b: 1.0};

Settings.registerSetting("Highlight Safe Spots", "renderWorld", () => {
    GL11.glLineWidth(2);
    GL11.glDisable(GL11.GL_TEXTURE_2D);
    GlStateManager.func_179094_E(); // pushMatrix()
    Tessellator.disableLighting();
    
    // triangle
    drawOutlinedBox(-88,    77.01, -129, 
        SEMISAFE_COLOR.r, SEMISAFE_COLOR.g, SEMISAFE_COLOR.b, 2.99, 0.99, 0.99);
    drawOutlinedBox(-89.99, 77.01, -128, 
        SEMISAFE_COLOR.r, SEMISAFE_COLOR.g, SEMISAFE_COLOR.b, 0.98, 0.99, 0.99);
    
        
    // square
    drawOutlinedBox(-141, 76, -90, SAFE_COLOR.r, SAFE_COLOR.g, SAFE_COLOR.b, 0.99, 1, 0.99);
    drawOutlinedBox(-141, 77, -90.99, SAFE_COLOR.r, SAFE_COLOR.g, SAFE_COLOR.b, 0.99, 1, 0.99);

    // insta-stun
    drawOutlinedBox(-154, 29, -172, SEMISAFE_COLOR.r, SEMISAFE_COLOR.g, SEMISAFE_COLOR.b);
    // safe-stun
    drawOutlinedBox(-174, 22, -170, SAFE_COLOR.r, SAFE_COLOR.g, SAFE_COLOR.b);
        
    // Tessellator.drawString("Triangle Safe Spot", -88 + 0.5, 78 + 2.0, -128 + 0.5);
    // Tessellator.drawString("Square Safe Spot", -140 + 0.5, 78 + 2.0, -91 + 0.5);
    
    Tessellator.enableLighting();
    GlStateManager.func_179121_F(); // popMatrix()
    GL11.glEnable(GL11.GL_TEXTURE_2D);
}).requireArea("Kuudra");

/*
Settings.registerSetting("Highlight Safe Spots", "renderWorld", () => {
    GL11.glLineWidth(2);
    GL11.glDisable(GL11.GL_TEXTURE_2D);
    GlStateManager.func_179094_E(); // pushMatrix()
    Tessellator.disableLighting();

    var r = 0.0, g = 1.0, b = 0.5;
    
    Tessellator.begin(6);
    Tessellator.colorize(r, g, b, 0.15);
    Tessellator.translate(0, 0, 0);
    Tessellator.pos(-101.0, 6.01, -105.0);
    Tessellator.pos(-109.0, 6.01, -100.0);
    Tessellator.pos(-106.0, 6.01, -100.0);
    Tessellator.pos(-106.0, 6.01, -98.0);
    Tessellator.pos(-99.0, 6.01, -98.0);
    Tessellator.pos(-99.0, 6.01, -99.0);
    Tessellator.pos(-95.0, 6.01, -99.0);
    Tessellator.pos(-95.0, 6.01, -102.0);
    Tessellator.pos(-93.0, 6.01, -102.0);
    Tessellator.pos(-93.0, 6.01, -109.0);
    Tessellator.pos(-95.0, 6.01, -109.0);
    Tessellator.pos(-95.0, 6.01, -113.0);
    Tessellator.pos(-99.0, 6.01, -113.0);
    Tessellator.pos(-99.0, 6.01, -114.0);
    Tessellator.pos(-106.0, 6.01, -114.0);
    Tessellator.pos(-106.0, 6.01, -111.0);
    Tessellator.pos(-109.0, 6.01, -111.0);
    Tessellator.pos(-109.0, 6.01, -100.0);
    Tessellator.draw();

    Tessellator.begin(3);
    Tessellator.colorize(r, g, b, 1.0);
    Tessellator.translate(0, 0, 0);
    Tessellator.pos(-109.0, 6.01, -100.0);
    Tessellator.pos(-106.0, 6.01, -100.0);
    Tessellator.pos(-106.0, 6.01, -98.0);
    Tessellator.pos(-99.0, 6.01, -98.0);
    Tessellator.pos(-99.0, 6.01, -99.0);
    Tessellator.pos(-95.0, 6.01, -99.0);
    Tessellator.pos(-95.0, 6.01, -102.0);
    Tessellator.pos(-93.0, 6.01, -102.0);
    Tessellator.pos(-93.0, 6.01, -109.0);
    Tessellator.pos(-95.0, 6.01, -109.0);
    Tessellator.pos(-95.0, 6.01, -113.0);
    Tessellator.pos(-99.0, 6.01, -113.0);
    Tessellator.pos(-99.0, 6.01, -114.0);
    Tessellator.pos(-106.0, 6.01, -114.0);
    Tessellator.pos(-106.0, 6.01, -111.0);
    Tessellator.pos(-109.0, 6.01, -111.0);
    Tessellator.pos(-109.0, 6.01, -100.0);
    Tessellator.draw();
   
    r = 0.0, g = 0.5, b = 1.0;

    Tessellator.begin(3);
    Tessellator.colorize(r, g, b, 1.0);
    Tessellator.translate(0, 0, 0);
    Tessellator.pos(-109.0, 6.011, -110.0);
    Tessellator.pos(-107.0, 6.011, -110.0);
    Tessellator.pos(-107.0, 6.011, -113.0);
    Tessellator.pos(-102.0, 6.011, -113.0);
    Tessellator.pos(-102.0, 6.011, -114.0);
    Tessellator.pos(-98.0, 6.011, -114.0);
    Tessellator.pos(-98.0, 6.011, -112.0);
    Tessellator.pos(-95.0, 6.011, -112.0);
    Tessellator.pos(-95.0, 6.011, -108.0);
    Tessellator.pos(-93.0, 6.011, -108.0);
    Tessellator.pos(-93.0, 6.011, -104.0);
    Tessellator.pos(-95.0, 6.011, -104.0);
    Tessellator.pos(-95.0, 6.011, -99.0);
    Tessellator.pos(-98.0, 6.011, -99.0);
    Tessellator.pos(-98.0, 6.011, -97.0);
    Tessellator.pos(-102.0, 6.011, -97.0);
    Tessellator.pos(-102.0, 6.011, -98.0);
    Tessellator.pos(-107.0, 6.011, -98.0);
    Tessellator.pos(-107.0, 6.011, -101.0);
    Tessellator.pos(-109.0, 6.011, -101.0);
    Tessellator.pos(-109.0, 6.011, -110.0);
    Tessellator.draw();

    Tessellator.begin(3);
    Tessellator.colorize(r, g, b, 1.0);
    Tessellator.translate(0, 0, 0);
    Tessellator.pos(-113.0, 6.011, -114.0);
    Tessellator.pos(-111.0, 6.011, -114.0);
    Tessellator.pos(-111.0, 6.011, -113.0);
    Tessellator.pos(-108.0, 6.011, -113.0);
    Tessellator.pos(-108.0, 6.011, -115.0);
    Tessellator.pos(-109.0, 6.011, -115.0);
    Tessellator.pos(-109.0, 6.011, -116.0);
    Tessellator.pos(-108.0, 6.011, -116.0);
    Tessellator.pos(-108.0, 6.011, -117.0);
    Tessellator.pos(-106.0, 6.011, -117.0);
    Tessellator.pos(-106.0, 6.011, -118.0);
    Tessellator.pos(-104.0, 6.011, -118.0);
    Tessellator.pos(-104.0, 6.011, -119.0);
    Tessellator.pos(-99.0, 6.011, -119.0);
    Tessellator.pos(-99.0, 6.011, -116.0);
    Tessellator.pos(-98.0, 6.011, -116.0);
    Tessellator.pos(-98.0, 6.011, -117.0);
    Tessellator.pos(-97.0, 6.011, -117.0);
    Tessellator.pos(-97.0, 6.011, -119.0);
    Tessellator.pos(-95.0, 6.011, -119.0);
    Tessellator.pos(-95.0, 6.011, -118.0);
    Tessellator.pos(-93.0, 6.011, -118.0);
    Tessellator.pos(-93.0, 6.011, -117.0);
    Tessellator.pos(-91.0, 6.011, -117.0);
    Tessellator.pos(-91.0, 6.011, -115.0);
    Tessellator.pos(-90.0, 6.011, -115.0);
    Tessellator.pos(-90.0, 6.011, -114.0);
    Tessellator.pos(-89.0, 6.011, -114.0);
    Tessellator.pos(-89.0, 6.011, -111.0);
    Tessellator.pos(-90.0, 6.011, -111.0);
    Tessellator.pos(-90.0, 6.011, -110.0);
    Tessellator.pos(-92.0, 6.011, -110.0);
    Tessellator.pos(-92.0, 6.011, -109.0);
    Tessellator.pos(-88.0, 6.011, -109.0);
    Tessellator.pos(-88.0, 6.011, -106.0);
    Tessellator.pos(-89.0, 6.011, -106.0);
    Tessellator.pos(-89.0, 6.011, -105.0);
    Tessellator.pos(-90.0, 6.011, -105.0);
    Tessellator.pos(-90.0, 6.011, -104.0);
    Tessellator.pos(-92.0, 6.011, -104.0);
    Tessellator.pos(-92.0, 6.011, -103.0);
    Tessellator.pos(-90.0, 6.011, -103.0);
    Tessellator.pos(-90.0, 6.011, -100.0);
    Tessellator.pos(-91.0, 6.011, -100.0);
    Tessellator.pos(-91.0, 6.011, -98.0);
    Tessellator.pos(-92.0, 6.011, -98.0);
    Tessellator.pos(-92.0, 6.011, -96.0);
    Tessellator.pos(-93.0, 6.011, -96.0);
    Tessellator.pos(-93.0, 6.011, -95.0);
    Tessellator.pos(-95.0, 6.011, -95.0);
    Tessellator.pos(-95.0, 6.011, -96.0);
    Tessellator.pos(-97.0, 6.011, -96.0);
    Tessellator.pos(-97.0, 6.011, -94.0);
    Tessellator.pos(-96.0, 6.011, -94.0);
    Tessellator.pos(-96.0, 6.011, -92.0);
    Tessellator.pos(-102.0, 6.011, -92.0);
    Tessellator.pos(-102.0, 6.011, -93.0);
    Tessellator.pos(-103.0, 6.011, -93.0);
    Tessellator.pos(-103.0, 6.011, -92.0);
    Tessellator.pos(-104.0, 6.011, -92.0);
    Tessellator.pos(-104.0, 6.011, -93.0);
    Tessellator.pos(-109.0, 6.011, -93.0);
    Tessellator.pos(-109.0, 6.011, -94.0);
    Tessellator.pos(-111.0, 6.011, -94.0);
    Tessellator.pos(-111.0, 6.011, -96.0);
    Tessellator.pos(-110.0, 6.011, -96.0);
    Tessellator.pos(-110.0, 6.011, -99.0);
    Tessellator.pos(-113.0, 6.011, -99.0);
    Tessellator.pos(-113.0, 6.011, -101.0);
    Tessellator.pos(-114.0, 6.011, -101.0);
    Tessellator.pos(-114.0, 6.011, -104.0);
    Tessellator.pos(-115.0, 6.011, -104.0);
    Tessellator.pos(-115.0, 6.011, -106.0);
    Tessellator.pos(-112.0, 6.011, -106.0);
    Tessellator.pos(-112.0, 6.011, -107.0);
    Tessellator.pos(-113.0, 6.011, -107.0);
    Tessellator.pos(-113.0, 6.011, -108.0);
    Tessellator.pos(-115.0, 6.011, -108.0);
    Tessellator.pos(-115.0, 6.011, -109.0);
    Tessellator.pos(-114.0, 6.011, -109.0);
    Tessellator.pos(-114.0, 6.011, -113.0);
    Tessellator.pos(-113.0, 6.011, -113.0);
    Tessellator.pos(-113.0, 6.011, -114.0);
    Tessellator.draw();
    

    Tessellator.enableLighting();
    GlStateManager.func_179121_F(); // popMatrix()
    GL11.glEnable(GL11.GL_TEXTURE_2D);
}).requireArea("Kuudra");
// });
// */