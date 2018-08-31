package com.taharaiot.mes.workflows.services;

import java.util.List;

import com.taharaiot.mes.workflows.api.TaharaAPIService;

public class FakeTaharaAPIServiceImpl implements TaharaAPIService {
	List<Object> data = null;
	
	public FakeTaharaAPIServiceImpl(List<Object> data) {
		this.data = data;
	}
	
	public Criteria find(String pluginName, String modelName) {
        return new CriteriaImpl(this.data);
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

        public List<Object> find() {
        	return this.data;
        }
    }
}
