package com.taharaiot.mes.workflows.services;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.script.Bindings;
import javax.script.Compilable;
import javax.script.CompiledScript;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.SimpleScriptContext;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.taharaiot.mes.workflows.api.TaharaAPIService;

public class FakeTaharaAPIServiceImpl implements TaharaAPIService {
	private static Logger logger = LoggerFactory.getLogger(FakeTaharaAPIServiceImpl.class); 
	
	Map<String, Object> data = null;
	
	@SuppressWarnings("unchecked")
	public FakeTaharaAPIServiceImpl() throws Exception {
		String script = System.getProperty("fake.data.preparation.script");
		
		ScriptEngineManager scriptEngineManager = new ScriptEngineManager();
		
		ScriptEngine engine = scriptEngineManager.getEngineByName("nashorn");
		
		Compilable compilable = (Compilable) engine;
		
		ScriptContext context = new SimpleScriptContext();
		Bindings bindings = context.getBindings(ScriptContext.ENGINE_SCOPE);
		
		CompiledScript compiled = compilable.compile(script);
		
		Object ret = compiled.eval(bindings);
		
		logger.info("ret : {}", ret);
		
		if (ret instanceof Bindings) {
			Bindings b = (Bindings)ret;
			
			Object o = bindingsToJava(b);
			
			logger.info("o : {}", o);
			
			if(o instanceof Map<?, ?>) {
				data = ((Map<String, Object>)o);
			}
			
			logger.info("data : {}", data);
		}
	}
	
	private Object bindingsToJava(Bindings b) {
		Map<String, Object> ret = new HashMap<String, Object>();
		
		for(String key : b.keySet()) {
			Object value = b.get(key);
			
			if(value instanceof Bindings) {
				value = bindingsToJava((Bindings)value);
			}
			
			ret.put(key, value);
		}
		
		boolean isArray = true;
		
		for(String k : ret.keySet()) {
			isArray = isArray && isInteger(k);
		}
		
		if(isArray) {
			Object[] list = new Object[ret.size()];
			for(String k : ret.keySet()) {
				int index = Integer.parseInt(k);
				list[index] = ret.get(k);
			}
			
			return Arrays.asList(list);
		}
		
		return ret;
	}
	
	private boolean isInteger(String s) {
	    try { 
	        Integer.parseInt(s); 
	    } catch(NumberFormatException e) { 
	        return false; 
	    } catch(NullPointerException e) {
	        return false;
	    }
	    
	    return true;
	}
	
	public FakeTaharaAPIServiceImpl(Map<String, Object> data) {
		this.data = data;
	}
	
	@SuppressWarnings({ "unchecked", "rawtypes" })
	public Criteria find(String pluginName, String modelName) {
		String key = String.format("%s_%s", pluginName.trim(), modelName.trim()).toLowerCase();
		
		Object value = this.data.get(key);
		
		if(value instanceof List) {
			return new CriteriaImpl((List)value);
		} else {
			return null;
		}
    }
	
	@Override
	public Object save(String pluginName, String modelName, Object entity) {
		return entity;
	}

    public static class CriteriaImpl implements TaharaAPIService.Criteria {
    	List<Object> data = null;
    	
        public CriteriaImpl(List<Object> data) {
        	this.data = data;
        }

        public Criteria eq(String key, Object value) {
            return this;
        }

        public Criteria ne(String key, Object value) {
            return this;
        }

        public Criteria lt(String key, Object value) {
            return this;
        }

        public Criteria gt(String key, Object value) {
            return this;
        }

        public Criteria le(String key, Object value) {
            return this;
        }

        public Criteria ge(String key, Object value) {
            return this;
        }

        public Criteria between(String key, Object value1, Object value2) {
            return this;
        }

        public Criteria belongs2(String key, String pluginIdentifier, String modelName, long id) {
            return this;
        }

        public int count() {
        	return this.data != null ? this.data.size() : 0;
        }

        public List<Object> list() {
        	return this.data;
        }

		@Override
		public Object uniqueResult() {
			return this.data.get(0);
		}
    }

	@Override
	public String currentUser() {
		return "user1";
	}
	
	public static class FakeEntity {
		private HashMap<String, Object> data;
		private String pluginName;
		private String modelName;
		
		public FakeEntity(String pluginName, String modelName) {
			this.pluginName = pluginName;
			this.modelName = modelName;
			this.data = new HashMap<>();
		}
		
		public void setField(String name, Object value) {
			this.data.put(name, value);
		}
	}

	@Override
	public Object create(String pluginName, String modelName) {
		return new FakeEntity(pluginName, modelName);
	}
}
