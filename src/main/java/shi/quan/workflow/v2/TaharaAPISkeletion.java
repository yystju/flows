package shi.quan.workflow.v2;

import java.util.List;
import java.util.Map;

public interface TaharaAPISkeletion {
	public List<Object> findByDefinition(String definitionName, Map<String, Object> params);
}
