/**
 * isolation.js
 * global variable execution -- the execution API scope...
 * global variable tahara -- the tahara API scope...
 * global variable logger -- the logger...
 */

logger.info(this)

var init = function () {
	logger.info('[isolation.init]')
}

var check = function () {
	logger.info('[isolation.check]')
	
	tahara.findByDefinition('isolation', null).forEach(function(i) {
		logger.info('[isolation] i : {}', i)
	})
	
	execution.setVariable('approved', true)
}

var beforeAcceptEnd = function () {
	logger.info('[isolation.beforeAcceptEnd]')
}

var beforeRejectEnd = function () {
	logger.info('[isolation.beforeRejectEnd]')
}
