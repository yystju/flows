package shi.quan.workflow.v2;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

class FakeTaharaAPI implements TaharaAPISkeletion {
	@Override
	public List<Object> findByDefinition(String definitionName, Map<String, Object> params) {
		List<Object> ret = new ArrayList<Object>();
		
		for(int i = 0; i < 100; ++i) {
			ret.add(String.format("item%d", i));
		}
		
		return ret;
	}
}