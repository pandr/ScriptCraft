package net.walterhiggins.scriptcraft;

import java.io.InputStreamReader;
import javax.script.*;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Field;

import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.command.*;
import org.bukkit.event.Listener;
import org.bukkit.Bukkit;
import org.bukkit.plugin.SimplePluginManager;
import org.bukkit.plugin.Plugin;

public class ScriptCraftPlugin extends JavaPlugin implements Listener
{
    // right now all ops share the same JS context/scope
    // need to look at possibly having context/scope per operator
    //protected Map<CommandSender,ScriptCraftEvaluator> playerContexts = new HashMap<CommandSender,ScriptCraftEvaluator>();
    private String NO_JAVASCRIPT_MESSAGE = "No JavaScript Engine available. ScriptCraft will not work without Javascript.";
    protected ScriptEngine engine = null;
    @Override
        public void onEnable()
    {
        try{
            ScriptEngineManager factory = new ScriptEngineManager();
            this.engine = factory.getEngineByName("JavaScript");
	    if (this.engine == null){
		this.getLogger().severe(NO_JAVASCRIPT_MESSAGE);
	    } else { 
		Invocable inv = (Invocable)this.engine;
		this.engine.eval(new InputStreamReader(this.getResource("boot.js")));
		inv.invokeFunction("__scboot", this, engine);
	    }
        }catch(Exception e){
            e.printStackTrace();
            this.getLogger().severe(e.getMessage());
        }
    }

    public void registerCommand(String... aliases)
    {
        PluginCommand command = getCommand(aliases[0], this);

	command.setAliases(Arrays.asList(aliases));
	getCommandMap().register(this.getDescription().getName(), command);
    }

    private static PluginCommand getCommand(String name, Plugin plugin)
    {
        PluginCommand command = null;

	try {
		Constructor<PluginCommand> c = PluginCommand.class.getDeclaredConstructor(String.class, Plugin.class);
		c.setAccessible(true);

		command = c.newInstance(name, plugin);
	}
	catch (SecurityException e) {
		e.printStackTrace();
	}
	catch (IllegalArgumentException e) {
		e.printStackTrace();
	}
	catch (IllegalAccessException e) {
		e.printStackTrace();
	}
	catch (InstantiationException e) {
		e.printStackTrace();
	}
	catch (InvocationTargetException e) {
		e.printStackTrace();
	}
	catch (NoSuchMethodException e) {
		e.printStackTrace();
	}

	return command;
    }


    private static CommandMap getCommandMap()
    {
        CommandMap commandMap = null;

	try {
	    if (Bukkit.getPluginManager() instanceof SimplePluginManager) {
	        Field f = SimplePluginManager.class.getDeclaredField("commandMap");
		f.setAccessible(true);
		commandMap = (CommandMap) f.get(Bukkit.getPluginManager());
	    }
	}
	catch (NoSuchFieldException e) {
	    e.printStackTrace();
	}
	catch (SecurityException e) {
	    e.printStackTrace();
	}
	catch (IllegalArgumentException e) {
	    e.printStackTrace();
	}
	catch (IllegalAccessException e) {
	    e.printStackTrace();
	}

	return commandMap;
    }
 


    public List<String> onTabComplete(CommandSender sender, Command cmd,
                                      String alias,
                                      String[] args)
    {
        List<String> result = new ArrayList<String>();
	if (this.engine == null){
	    this.getLogger().severe(NO_JAVASCRIPT_MESSAGE);
	    return null;
	}
        try {
            Invocable inv = (Invocable)this.engine;
            inv.invokeFunction("__onTabComplete", result, sender, cmd, alias, args);
        }catch (Exception e){
            sender.sendMessage(e.getMessage());
            e.printStackTrace();
        }
        return result;
    }
    
    public boolean onCommand(CommandSender sender, Command cmd, String label, String[] args)
    {
        boolean result = false;
        String javascriptCode = "";
        Object jsResult = null;
	if (this.engine == null){
	    this.getLogger().severe(NO_JAVASCRIPT_MESSAGE);
	    return false;
	}
        try { 
            jsResult = ((Invocable)this.engine).invokeFunction("__onCommand", sender, cmd, label, args);
        }catch (Exception se){
            this.getLogger().severe(se.toString());
            se.printStackTrace();
            sender.sendMessage(se.getMessage());
        }
        if (jsResult != null){
            return ((Boolean)jsResult).booleanValue();
        }
        return result;
    }
}
