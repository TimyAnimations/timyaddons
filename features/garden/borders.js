import Settings from "../../utils/settings/main";

Settings.registerSetting("Show Plot Borders", "renderWorld", (partial_ticks) => {
    let plot_x = Math.floor( (Player.getX() + 48) / 96 );
    let plot_z = Math.floor( (Player.getZ() + 48) / 96 );

    let r = 0.0, g = 1.0, b = 0.0;

    plot_x = ( plot_x < -2 ? -2 : ( plot_x > 2 ? 2 : plot_x ) ) * 96;
    plot_z = ( plot_z < -2 ? -2 : ( plot_z > 2 ? 2 : plot_z ) ) * 96;

    GL11.glLineWidth(2);
    GL11.glDisable(GL11.GL_TEXTURE_2D);
    GlStateManager.func_179094_E(); // pushMatrix()
    Tessellator.disableLighting();

    Tessellator.begin();
    Tessellator.colorize(r, g, b, 0.15);
    Tessellator.translate(plot_x, 67, plot_z);
    Tessellator.pos(-47.995,  0, -47.995);
    Tessellator.pos( 47.995,  0, -47.995);
    Tessellator.pos( 47.995, 12, -47.995);
    Tessellator.pos(-47.995, 12, -47.995);
    
    Tessellator.pos(-47.995, 12,  47.995);
    Tessellator.pos( 47.995, 12,  47.995);
    Tessellator.pos( 47.995,  0,  47.995);
    Tessellator.pos(-47.995,  0,  47.995);

    Tessellator.pos(-47.995,  0, -47.995);
    Tessellator.pos(-47.995, 12, -47.995);
    Tessellator.pos(-47.995, 12,  47.995);
    Tessellator.pos(-47.995,  0,  47.995);
    
    Tessellator.pos( 47.995,  0,  47.995);
    Tessellator.pos( 47.995, 12,  47.995);
    Tessellator.pos( 47.995, 12, -47.995);
    Tessellator.pos( 47.995,  0, -47.995);
    
    Tessellator.draw();

    Tessellator.begin(2);
    Tessellator.colorize(r, g, b, 1.0);
    Tessellator.translate(plot_x, 67, plot_z);
    Tessellator.pos(-47.990, 0.01, -47.990);
    Tessellator.pos( 47.990, 0.01, -47.990);
    Tessellator.pos( 47.990, 12.0, -47.990);
    Tessellator.pos(-47.990, 12.0, -47.990);
    Tessellator.draw();
    
    Tessellator.begin(2);
    Tessellator.colorize(r, g, b, 1.0);
    Tessellator.translate(plot_x, 67, plot_z);
    Tessellator.pos(-47.990, 0.01,  47.990);
    Tessellator.pos( 47.990, 0.01,  47.990);
    Tessellator.pos( 47.990, 12.0,  47.990);
    Tessellator.pos(-47.990, 12.0,  47.990);
    Tessellator.draw();
    
    Tessellator.begin(2);
    Tessellator.colorize(r, g, b, 1.0);
    Tessellator.translate(plot_x, 67, plot_z);
    Tessellator.pos(-47.990, 0.01, -47.990);
    Tessellator.pos( 47.990, 0.01, -47.990);
    Tessellator.pos( 47.990, 0.01,  47.990);
    Tessellator.pos(-47.990, 0.01,  47.990);
    Tessellator.draw();
    
    Tessellator.begin(2);
    Tessellator.colorize(r, g, b, 1.0);
    Tessellator.translate(plot_x, 67, plot_z);
    Tessellator.pos(-47.990, 12.0, -47.990);
    Tessellator.pos( 47.990, 12.0, -47.990);
    Tessellator.pos( 47.990, 12.0,  47.990);
    Tessellator.pos(-47.990, 12.0,  47.990);
    Tessellator.draw();
    
    Tessellator.enableLighting();
    GlStateManager.func_179121_F(); // popMatrix()
    GL11.glEnable(GL11.GL_TEXTURE_2D);
}).requireArea("Garden");