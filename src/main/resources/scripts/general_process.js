/**
 * general_process.js global variable execution -- the execution API scope...
 * global variable tahara -- the tahara API scope... global variable logger --
 * the logger...
 */

// -------------------- INITIALIZATION -------------------------

var WORKFLOW = 'workflows';
var STORAGE = 'storage';

var QUALITY = 'quality';

var ISOLATE = 'defectIsolate';
var ISOLATEDETAIL = 'DefectIsolatedDetail';

var REMANUFACTURE = 'IsolatedReManufacture';
var REMANUFACTUREDETAIL = 'IsolatedReManufactureDetail';

var SCRAP = 'IsolatedScrap';
var SCRAPDETAIL = 'IsolatedScrapDetail';

var init = function () {
	logger.info('[general_process.init]')
	
	var processId = execution.getProcessInstanceId()
	
	logger.info('processId : {}', processId)
	
	var taskId = execution.getId()
	
	logger.info('taskId : {}', taskId)
	
	var type = execution.getVariable('type')
		
	logger.info('type : {}', type)
	
	var entity = tahara.create(WORKFLOW, STORAGE)
	
	entity.setField("processId", processId)
	entity.setField("var1", type)                            // var1 -> 审批类型
	entity.setField('owner', tahara.currentUser())
		
	logger.info('entity : {}', entity)
	
	tahara.save(WORKFLOW, STORAGE, entity)
	
	logger.info('[general_process.init] done.')
}

// -------------------- GATEWAYS -------------------------

var firstlevel_approval_result_gateway = function() {
	logger.info('[general_process.firstlevel_approval_result_gateway]')
	
	// 从数据库ApprovalProcess获得一级审批结果。
	
	var result = true
	
	var processId = execution.getProcessInstanceId()
	
	logger.info('processId : {}', processId)
	
	var storage = tahara.find(WORKFLOW, STORAGE).eq('processId', processId).uniqueResult()
	
	if(storage) {
		result = new Boolean(storage.getStringField('var2')) // var2 ->
																// 一级审批结果
	}
	
	logger.info('result : {}', result)
	
	execution.setVariable('firstlevelapproval', result)
}

var secondlevel_trigger_gateway = function() {
	logger.info('[general_process.secondlevel_trigger_gateway]')
	
	// 获取阈值
	// 查看报废审批明细：累计报废同产品子板条码数[20，50]?
	
	var result = true
	
	var processId = execution.getProcessInstanceId()
	
	logger.info('processId : {}', processId)
	
	var storage = tahara.find(WORKFLOW, STORAGE).eq('processId', processId).uniqueResult();
	
	if(storage) {
		var pcbCount =  new Number(storage.getStringField('var3')) // var3 ->
																	// 累计报废同产品子板条码数
		
		result = (pcbCount >= 20)
	}
	
	logger.info('result : {}', result)
	
	execution.setVariable('secondleveltriggerred', result)
}

var secondlevel_approval_result_gateway = function() {
	logger.info('[general_process.secondlevel_approval_result_gateway]')
	
	// 从数据库ApprovalProcess获得二级审批结果。
	
	var result = true
	
	var processId = execution.getProcessInstanceId()
	
	logger.info('processId : {}', processId)
	
	var storage = tahara.find(WORKFLOW, STORAGE).eq('processId', processId).uniqueResult();
	
	if(storage) {
		result = new Boolean(storage.getStringField('var4')) // var4 ->
																// 二级审批结果
	}
	
	logger.info('result : {}', result)
	
	execution.setVariable('secondlevelapproval', result)
}

var thirdlevel_trigger_gateway = function() {
	logger.info('[general_process.thirdlevel_trigger_gateway]')
	
	// 获取阈值
	// 查看报废审批明细：累计报废同产品子板条码数>50?
	
	var result = true
	
	var processId = execution.getProcessInstanceId()
	
	logger.info('processId : {}', processId)
	
	var storage = tahara.find(WORKFLOW, STORAGE).eq('processId', processId).uniqueResult()
	
	if(storage) {
		var pcbCount =  new Number(storage.getStringField('var3')) // var3 ->
																	// 累计报废同产品子板条码数
		
		result = (pcbCount >= 50)
	}
	
	logger.info('result : {}', result)
	
	execution.setVariable('thirdleveltriggerred', result)
}

var thirdlevel_approval_result_gateway = function() {
	logger.info('[general_process.thirdlevel_approval_result_gateway]')
	
	// 从数据库ApprovalProcess获得三级审批结果。
	
	var result = true
	
	var processId = execution.getProcessInstanceId()
	
	logger.info('processId : {}', processId)
	
	var storage = tahara.find(WORKFLOW, STORAGE).eq('processId', processId).uniqueResult()
	
	if(storage) {
		result = new Boolean(storage.getStringField('var5')) // var5 ->
																// 三级审批结果
	}
	
	logger.info('result : {}', result)
	
	execution.setVariable('thirdlevelapproval', result)
}

var isolation_approval_result_gateway = function() {
	logger.info('[general_process.isolation_approval_result_gateway]')
	
	// 从数据库获得隔离审批各并发任务的审批结果。
	
	var result = true
	
	var processId = execution.getProcessInstanceId()
	
	logger.info('processId : {}', processId)
	
	logger.info('tahara.find(WORKFLOW, STORAGE) : {}', tahara.find(WORKFLOW, STORAGE))
	
	var storage = tahara.find(WORKFLOW, STORAGE).eq('processId', processId).uniqueResult()
	
	logger.info('storage : {}', storage)
	
	if(storage) {
		var var2 = storage.getStringField('var2') // var2 -> 隔离审批结果1
		
		logger.info('var2 : {}', var2)
		
		if(result) {
			result = result && ('true' == var2)
		}
		
		var var3 = storage.getStringField('var3') // var3 -> 隔离审批结果2
		
		logger.info('var3 : {}', var3)
		
		if(result) {
			result = result && ('true' == var3)
		}
	}
	
	logger.info('result : {}', result)
	
	execution.setVariable('isoliationapproval', result.toString())
}

var rework_approval_result_gateway = function() {
	logger.info('[general_process.rework_approval_result_gateway]')
	
	// 从数据库获得返工审批各并发任务的审批结果。
	
	var result = true
	
	var processId = execution.getProcessInstanceId()
	
	logger.info('processId : {}', processId)
	
	var storage = tahara.find(WORKFLOW, STORAGE).eq('processId', processId).uniqueResult()
	
	if(storage) {
		var var2 = storage.getStringField('var2') // var2 -> 返工审批结果1
		
		logger.info('var2 : {}', var2)
		
		if(result) {
			result = result && ('true' == var2)
		}
		
		var var3 = storage.getStringField('var3') // var3 -> 返工审批结果2
		
		logger.info('var3 : {}', var3)
		
		if(result) {
			result = result && ('true' == var3)
		}
	}
	
	logger.info('result : {}', result)
	
	execution.setVariable('reworkapproval', result.toString())
}

var isolation_approval_role1_task = function() {
	logger.info('[general_process.isolation_approval_role1_task]')
	
	var approved = execution.getVariable('approved')
	logger.info('approved : {}', approved)
	
	var processId = execution.getProcessInstanceId()
	logger.info('processId : {}', processId)
	
	var storage = tahara.find(WORKFLOW, STORAGE).eq('processId', processId).uniqueResult()
	
	logger.info('storage : {}', storage)
	
	if(storage) {
        // var2 -> 隔离审批结果1
		storage.setField('var2', '' + approved)
		tahara.save(WORKFLOW, STORAGE, storage)
	}
}

var isolation_approval_role2_task = function() {
	logger.info('[general_process.isolation_approval_role2_task]')
	
	var approved = execution.getVariable('approved')
	logger.info('approved : {}', approved)
	
	var processId = execution.getProcessInstanceId()
	logger.info('processId : {}', processId)
	
	var storage = tahara.find(WORKFLOW, STORAGE).eq('processId', processId).uniqueResult()
	
	logger.info('storage : {}', storage)
	
	if(storage) {
        // var3 -> 隔离审批结果2
		storage.setField('var3', '' + approved)
		tahara.save(WORKFLOW, STORAGE, storage)
	}
}

var rework_approval_role1_task = function() {
	logger.info('[general_process.rework_approval_role1_task]')
	
	var approved = execution.getVariable('approved')
	logger.info('approved : {}', approved)
	
	var processId = execution.getProcessInstanceId()
	logger.info('processId : {}', processId)
	
	var storage = tahara.find(WORKFLOW, STORAGE).eq('processId', processId).uniqueResult()
	
	logger.info('storage : {}', storage)
	
	if(storage) {
        // var2 -> 返工审批结果1
		storage.setField('var2', '' + approved)
		tahara.save(WORKFLOW, STORAGE, storage)
	}
}

var rework_approval_role2_task = function() {
	logger.info('[general_process.rework_approval_role2_task]')
	
	var approved = execution.getVariable('approved')
	logger.info('approved : {}', approved)
	
	var processId = execution.getProcessInstanceId()
	logger.info('processId : {}', processId)
	
	var storage = tahara.find(WORKFLOW, STORAGE).eq('processId', processId).uniqueResult()
	
	logger.info('storage : {}', storage)
	
	if(storage) {
        // var3 -> 返工审批结果2
		storage.setField('var3', '' + approved)
		tahara.save(WORKFLOW, STORAGE, storage)
	}
}

// -------------------- END EVENTS -------------------------

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
	
	var processId = execution.getProcessInstanceId()
	logger.info('processId : {}', processId)
	
	var isolation = tahara.find('quality', 'DefectIsolate').eq('processid', processId).uniqueResult()
	
	logger.info('isolation : {}', isolation)
	
	isolation.setField('approvedstate', '2')
	
	tahara.save('quality', 'DefectIsolate', isolation)
	
	finalizeForRejection()
	finalize()
}

var isolation_accepted_end = function() {
	logger.info('[general_process.isolation_accepted_end]')
	
	var processId = execution.getProcessInstanceId()
	logger.info('processId : {}', processId)
	
	var approvalProcess = tahara.find('quality', 'ApprovalProcess').eq('processid', processId).uniqueResult()
	
	logger.info('approvalProcess : {}', approvalProcess)
	
	var isolation = tahara.find('quality', 'DefectIsolate').eq('code', approvalProcess.getStringField('code')).uniqueResult()
	
	logger.info('isolation : {}', isolation)
	
	isolation.setField('approvedstate', '1')
	
	tahara.save('quality', 'DefectIsolate', isolation)
	
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

// -------------------- BUZZ ACTIONS -------------------------

var doScrapping = function() {
	logger.info('[general_process.doScrapping]')
	// 写入报废表Scraps
	// 更新制品信息表(状态，品质)
	// FinishedProduct{...,"3"，"1",..}
	// 删除在制品表wip
	// 更新隔离报废一览审批状态为“通过”
	
	// TODO: Add implementations...
}

var finalizeForRejection = function() {
	logger.info('[general_process.finalizeForRejection]')
	// 更新隔离报废一览审批状态为“未通过”
	
	// TODO: Add implementations...
}

var finalizeForApproved = function() {
	logger.info('[general_process.finalizeForApproved]')
	// 更新隔离一览审批状态为“通过”
	
	// TODO: Add implementations...
}

var finalize = function() {
	logger.info('[general_process.finalizeForApproved]')
	
	var processId = execution.getProcessInstanceId()
	
	logger.info('processId : {}', processId)
	
	var taskId = execution.getId()
	
	logger.info('taskId : {}', taskId)
	
	var storage = tahara.find(WORKFLOW, STORAGE).eq('processId', processId).uniqueResult()
	
	if(storage) {
		logger.info('Delete storage with processId = {}.', processId)
		tahara.delete(WORKFLOW, STORAGE, storage)
	}
	
	// 删除审批流ApprovalProcess
	// 写入审批履历ApprovalHistory
	
	// TODO: Add implementations...
}
