/**
 * general_process.js
 * global variable execution -- the execution API scope...
 * global variable tahara -- the tahara API scope...
 * global variable logger -- the logger...
 */

//-------------------- INITIALIZATION -------------------------

var PLUGIN = 'workflows';
var DEFINITION = 'storage';

var init = function () {
	logger.info('[general_process.init]')
	
	var processId = execution.getProcessInstanceId()
	
	logger.info('processId : {}', processId)
	
	var taskId = execution.getId()
	
	logger.info('taskId : {}', taskId)
	
	//TODO: Where to get the type??
	var type = 'isolation'
	//var type = 'scrapping'
	//var type = 'rework'
		
	logger.info('type : {}', type)
	
	execution.setVariable('type', type)
	
	var entity = tahara.create(PLUGIN, DEFINITION)
	
	entity.setField("processId", processId)
	entity.setField("var1", type)                            // var1 -> 审批类型
	entity.setField('owner', tahara.currentUser())
		
	logger.info('entity : {}', entity)
	
	tahara.save(PLUGIN, DEFINITION, entity)
}

//-------------------- GATEWAYS -------------------------

var firstlevel_approval_result_gateway = function() {
	logger.info('[general_process.firstlevel_approval_result_gateway]')
	
	//从数据库ApprovalProcess获得一级审批结果。
	
	var result = true
	
	var processId = execution.getProcessInstanceId()
	
	logger.info('processId : {}', processId)
	
	var storage = tahara.find(PLUGIN, DEFINITION).eq('processId', processId).uniqueResult()
	
	if(storage) {
		result = new Boolean(storage.getStringField('var2')) // var2 -> 一级审批结果
	}
	
	logger.info('result : {}', result)
	
	execution.setVariable('firstlevelapproval', result)
}

var secondlevel_trigger_gateway = function() {
	logger.info('[general_process.secondlevel_trigger_gateway]')
	
	//获取阈值
	//查看报废审批明细：累计报废同产品子板条码数[20，50]?
	
	var result = true
	
	var processId = execution.getProcessInstanceId()
	
	logger.info('processId : {}', processId)
	
	var storage = tahara.find(PLUGIN, DEFINITION).eq('processId', processId).uniqueResult();
	
	if(storage) {
		var pcbCount =  new Number(storage.getStringField('var3')) //var3 -> 累计报废同产品子板条码数
		
		result = (pcbCount >= 20)
	}
	
	logger.info('result : {}', result)
	
	execution.setVariable('secondleveltriggerred', result)
}

var secondlevel_approval_result_gateway = function() {
	logger.info('[general_process.secondlevel_approval_result_gateway]')
	
	//从数据库ApprovalProcess获得二级审批结果。
	
	var result = true
	
	var processId = execution.getProcessInstanceId()
	
	logger.info('processId : {}', processId)
	
	var storage = tahara.find(PLUGIN, DEFINITION).eq('processId', processId).uniqueResult();
	
	if(storage) {
		result = new Boolean(storage.getStringField('var4')) // var4 -> 二级审批结果
	}
	
	logger.info('result : {}', result)
	
	execution.setVariable('secondlevelapproval', result)
}

var thirdlevel_trigger_gateway = function() {
	logger.info('[general_process.thirdlevel_trigger_gateway]')
	
	//获取阈值
	//查看报废审批明细：累计报废同产品子板条码数>50?
	
	var result = true
	
	var processId = execution.getProcessInstanceId()
	
	logger.info('processId : {}', processId)
	
	var storage = tahara.find(PLUGIN, DEFINITION).eq('processId', processId).uniqueResult()
	
	if(storage) {
		var pcbCount =  new Number(storage.getStringField('var3')) //var3 -> 累计报废同产品子板条码数
		
		result = (pcbCount >= 50)
	}
	
	logger.info('result : {}', result)
	
	execution.setVariable('thirdleveltriggerred', result)
}

var thirdlevel_approval_result_gateway = function() {
	logger.info('[general_process.thirdlevel_approval_result_gateway]')
	
	//从数据库ApprovalProcess获得三级审批结果。
	
	var result = true
	
	var processId = execution.getProcessInstanceId()
	
	logger.info('processId : {}', processId)
	
	var storage = tahara.find(PLUGIN, DEFINITION).eq('processId', processId).uniqueResult()
	
	if(storage) {
		result = new Boolean(storage.getStringField('var5')) // var5 -> 三级审批结果
	}
	
	logger.info('result : {}', result)
	
	execution.setVariable('thirdlevelapproval', result)
}

var isolation_approval_result_gateway = function() {
	logger.info('[general_process.isolation_approval_result_gateway]')
	
	//从数据库获得隔离审批各并发任务的审批结果。
	
	var result = true
	
	var processId = execution.getProcessInstanceId()
	
	logger.info('processId : {}', processId)
	
	var storage = tahara.find(PLUGIN, DEFINITION).eq('processId', processId).uniqueResult()
	
	if(storage) {
		var var2 = storage.getStringField('var2') // var2 -> 隔离审批结果1
		
		if(result && var2) {
			result = result && new Boolean(var2)
		}
		
		var var3 = storage.getStringField('var2') // var3 -> 隔离审批结果2
		
		if(result && var3) {
			result = result && new Boolean(var3)
		}
	}
	
	logger.info('result : {}', result)
	
	execution.setVariable('isoliationapproval', result)
}

var rework_approval_result_gateway = function() {
	logger.info('[general_process.rework_approval_result_gateway]')
	
	//从数据库获得返工审批各并发任务的审批结果。
	
	var result = true
	
	var processId = execution.getProcessInstanceId()
	
	logger.info('processId : {}', processId)
	
	var storage = tahara.find(PLUGIN, DEFINITION).eq('processId', processId).uniqueResult()
	
	if(storage) {
		var var2 = storage.getStringField('var2') // var2 -> 返工审批结果1
		
		if(result && var2) {
			result = result && new Boolean(var2)
		}
		
		var var3 = storage.getStringField('var2') // var3 -> 返工审批结果2
		
		if(result && var3) {
			result = result && new Boolean(var3)
		}
	}
	
	logger.info('result : {}', result)
	
	execution.setVariable('reworkapproval', result)
}

//-------------------- END EVENTS -------------------------

var firstlevel_reject_end = function() {
	logger.info('[general_process.firstlevel_reject_end]')
	finalizeForRejection()
	finalize()
}

var firstlevel_accepted_end = function() {
	logger.info('[general_process.firstlevel_accepted_end]')
	doScrapping()
	finalizeForApproved()
	finalize()
}

var secondlevel_reject_end = function() {
	logger.info('[general_process.secondlevel_reject_end]')
	finalizeForRejection()
	finalize()
}

var secondlevel_accepted_end = function() {
	logger.info('[general_process.secondlevel_accepted_end]')
	doScrapping()
	finalizeForApproved()
	finalize()
}

var thirdlevel_reject_end = function() {
	logger.info('[general_process.thirdlevel_reject_end]')
	finalizeForRejection()
	finalize()
}

var thirdlevel_accepted_end = function() {
	logger.info('[general_process.thirdlevel_accepted_end]')
	doScrapping()
	finalizeForApproved()
	finalize()
}

var isolation_reject_end = function() {
	logger.info('[general_process.isolation_reject_end]')
	finalizeForRejection()
	finalize()
}

var isolation_accepted_end = function() {
	logger.info('[general_process.isolation_accepted_end]')
	finalizeForApproved()
	finalize()
}

var rework_reject_end = function() {
	logger.info('[general_process.rework_reject_end]')
	finalizeForRejection()
	finalize()
}

var rework_accepted_end = function() {
	logger.info('[general_process.rework_accepted_end]')
	finalizeForApproved()
	finalize()
}

//-------------------- BUZZ ACTIONS -------------------------

var doScrapping = function() {
	logger.info('[general_process.doScrapping]')
	//写入报废表Scraps
	//更新制品信息表(状态，品质)
	//FinishedProduct{...,"3"，"1",..}
	//删除在制品表wip
	//更新隔离报废一览审批状态为“通过”
	
	//TODO: Add implementations...
}

var finalizeForRejection = function() {
	logger.info('[general_process.finalizeForRejection]')
	//更新隔离报废一览审批状态为“未通过”
	
	//TODO: Add implementations...
}

var finalizeForApproved = function() {
	logger.info('[general_process.finalizeForApproved]')
	//更新隔离一览审批状态为“通过”
	
	//TODO: Add implementations...
}

var finalize = function() {
	logger.info('[general_process.finalizeForApproved]')
	
	var processId = execution.getProcessInstanceId()
	
	logger.info('processId : {}', processId)
	
	var taskId = execution.getId()
	
	logger.info('taskId : {}', taskId)
	
	var storage = tahara.find(PLUGIN, DEFINITION).eq('processId', processId).uniqueResult()
	
	if(storage) {
		logger.info('Delete storage with processId = {}.', processId)
		tahara.delete(PLUGIN, DEFINITION, storage)
	}
	
	//删除审批流ApprovalProcess
	//写入审批履历ApprovalHistory
	
	//TODO: Add implementations...
}
