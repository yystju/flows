package com.taharaiot.mes.workflows.api;

import java.util.List;

public interface TaharaAPIService {
	String currentUser();
	List<String> currentUserRoles();
	Criteria find(String pluginName, String modelName);
	Object save(String pluginName, String modelName, Object entity);
	Object create(String pluginName, String modelName);
	boolean delete(String pluginName, String modelName, Object entity);
	
	interface Criteria {
		Criteria eq(String key, Object value);
        Criteria ne(String key, Object value);
        Criteria lt(String key, Object value);
        Criteria gt(String key, Object value);
        Criteria le(String key, Object value);
        Criteria ge(String key, Object value);
        Criteria between(String key, Object value1, Object value2);
        Criteria belongs2(String key, String pluginIdentifier, String modelName, long id);
        int count();
        List<Object> list();
        Object uniqueResult();
	}
}
