/**
 * scrapping_approval.js
 * global variable execution -- the execution API scope...
 * global variable tahara -- the tahara API scope...
 * global variable logger -- the logger...
 */

var init = function () {
	logger.info('[scrapping_approval.init]')
	execution.setVariable('reviewType', 'A')
}

var thresholdCheck = function () {
	logger.info('[scrapping_approval.thresholdCheck] currentuser : {}', tahara.currentUser())
	
	var wipno = execution.getVariable('wipno')
	
	logger.info('[scrapping_approval.thresholdCheck] wipno : {}', wipno)
	
	var cnt = tahara
				.find('workflows', 'inbasket')
				.eq('owner', tahara.currentUser())
				.count()
	
	logger.info('[scrapping_approval.thresholdCheck] cnt : {}', cnt)
	
	execution.setVariable('approved', cnt == 0)
	execution.setVariable('threshold', cnt == 0)
}

var counterApproveCheck = function () {
	logger.info('[scrapping_approval.counterApproveCheck] currentuser : {}', tahara.currentUser())
	
	var wipno = execution.getVariable('wipno')
	
	logger.info('[scrapping_approval.counterApproveCheck] wipno : {}', wipno)
	
	var cnt = tahara
				.find('workflows', 'inbasket')
				.eq('owner', tahara.currentUser())
				.count()
	
	logger.info('[scrapping_approval.counterApproveCheck] cnt : {}', cnt)
	
	execution.setVariable('approved', cnt > 0)
}

var beforeTypeBApprovedEnd = function () {
	logger.info('[scrapping_approval.beforeAcceptEnd]')
	tahara
		.find('workflows', 'inbasket')
		.eq('owner', tahara.currentUser())
		.list()
		.forEach(function(entity) {
			//...
			tahara.save(entity)
		})
}

var beforeTypeAApprovedEnd = function () {
	logger.info('[scrapping_approval.beforeAcceptEnd]')
	tahara
		.find('workflows', 'inbasket')
		.eq('owner', tahara.currentUser())
		.list()
		.forEach(function(entity) {
			//...
			tahara.save(entity)
		})
}

var beforeRejectEnd = function () {
	logger.info('[scrapping_approval.beforeRejectEnd]')
}
