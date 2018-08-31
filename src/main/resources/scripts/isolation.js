/**
 * isolation.js
 * global variable execution -- the execution API scope...
 * global variable tahara -- the tahara API scope...
 * global variable logger -- the logger...
 */

var init = function () {
	logger.info('[isolation.init]')
}

var check = function () {
	logger.info('[isolation.check]')
	
	var wipno = execution.getVariable('wipno')
	
	logger.info('[isolation.check] wipno : {}', wipno)
	
	var cnt = tahara
				.find('quality', 'defectrecord')
				.eq('wipno', wipno)
				.count()
	
	logger.info('[isolation.check] cnt : {}', cnt)
				
	execution.setVariable('approved', cnt > 0)
}

var beforeAcceptEnd = function () {
	logger.info('[isolation.beforeAcceptEnd]')
}

var beforeRejectEnd = function () {
	logger.info('[isolation.beforeRejectEnd]')
}
