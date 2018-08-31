package shi.quan.workflow.v2;

import java.io.File;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.script.Bindings;
import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

import org.activiti.engine.delegate.DelegateExecution;
import org.activiti.engine.delegate.ExecutionListener;
import org.activiti.engine.delegate.Expression;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ScriptExecutionListener implements ExecutionListener {
	private static final long serialVersionUID = -3542712693377315182L;
	
	private static Logger logger = LoggerFactory.getLogger(ScriptExecutionListener.class); 
	
	private static ScriptEngineManager scriptEngineManager = new ScriptEngineManager();
	
	private Expression scriptPathName;

	private Expression functionName;
	
	public ScriptExecutionListener() {
		
	}

	@Override
	public void notify(DelegateExecution execution) throws Exception {
		String pathName = (String)scriptPathName.getValue(execution);
		String function = (String)functionName.getValue(execution);

		File scriptFolder = new File("./src/main/resources/scripts");
		
		File script = new File(scriptFolder, pathName);
		
		if(script.exists()) {
			ScriptEngine engine = scriptEngineManager.getEngineByName("nashorn");
			
			Bindings bindings = engine.createBindings();
			
			bindings.put("execution", execution);
			bindings.put("logger", logger);
			
			bindings.put("tahara", new TaharaAPISkeletion() {
				@Override
				public List<Object> findByDefinition(String definitionName, Map<String, Object> params) {
					return new ArrayList<Object>();
				}
			}); // Fake...
			
			FileReader reader = new FileReader(script);
			
			engine.eval(reader, bindings);
			
			reader.close();
			
			Invocable invocable = (Invocable) engine;
			invocable.invokeFunction(function);
		}
	}
}
