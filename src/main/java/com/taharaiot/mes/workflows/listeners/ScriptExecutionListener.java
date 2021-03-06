package com.taharaiot.mes.workflows.listeners;

import java.io.File;
import java.io.FileReader;

import javax.script.Bindings;
import javax.script.Compilable;
import javax.script.CompiledScript;
import javax.script.Invocable;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.SimpleScriptContext;

import org.activiti.engine.delegate.DelegateExecution;
import org.activiti.engine.delegate.ExecutionListener;
import org.activiti.engine.delegate.Expression;
import org.codehaus.groovy.util.StringUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;

import com.taharaiot.mes.workflows.services.FakeTaharaAPIServiceImpl;

public class ScriptExecutionListener implements ExecutionListener {
	private static final long serialVersionUID = -3542712693377315182L;
	
	private static Logger logger = LoggerFactory.getLogger(ScriptExecutionListener.class); 
	
	private static ScriptEngineManager scriptEngineManager = new ScriptEngineManager();
	
	private Expression scriptPathName;

	private Expression functionName;
	
	public ScriptExecutionListener() {
		logger.info("[<ScriptExecutionListener.init>]");
	}

	@Override
	public void notify(DelegateExecution execution) throws Exception {
		logger.info("[ScriptExecutionListener.notify] event : {}", execution.getEventName());
		
		String pathName = scriptPathName != null ? (String)scriptPathName.getValue(execution) : null;
		String function = functionName != null ? (String)functionName.getValue(execution) : null;
		
		if(StringUtils.isEmpty(function)) {
			function = execution.getCurrentActivityId();
		}

		logger.info("pathName : {}", pathName);
		logger.info("function : {}", function);
		
		File scriptFolder = new File("./src/main/resources/scripts");
		
		File script = new File(scriptFolder, pathName);
		
		if(script.exists()) {
			logger.info("script : {}", script);
			
			try {
				long start = System.currentTimeMillis();
				
				ScriptEngine engine = scriptEngineManager.getEngineByName("nashorn");
				Compilable compilable = (Compilable) engine;
				Invocable invocable = (Invocable) engine;
				
				ScriptContext context = new SimpleScriptContext();
				Bindings bindings = context.getBindings(ScriptContext.ENGINE_SCOPE);
				
				bindings.put("execution", execution);
				bindings.put("logger", logger);
				
				bindings.put("tahara", new FakeTaharaAPIServiceImpl()); // Fake...
				
				FileReader reader = new FileReader(script);
				
				CompiledScript compiled = compilable.compile(reader);
				
				compiled.eval(bindings);
				
				reader.close();
				
				logger.info("invocable : {}", invocable);
				engine.setContext(context);
				
				invocable.invokeFunction(function, new Object[] {});
				
				logger.info("TOTAL INTERVAL : {}", System.currentTimeMillis() - start);
			} catch (Exception ex) {
				logger.error(ex.getMessage(), ex);
			}
		}
	}
}
