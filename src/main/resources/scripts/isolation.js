/**
 * isolation.js
 * global variable execution -- the execution API scope...
 * global variable tahara -- the tahara API scope...
 * global variable logger -- the logger...
 */

logger.info(this)

var init = function () {
	logger.info('[isolation.init]')
	logger.info('>> {}', tahara.findByDefinition('isolation', null))
}

var check = function () {
	logger.info('[isolation.check]')
	execution.setVariable('approved', true)
}

var beforeAcceptEnd = function () {
	logger.info('[isolation.beforeAcceptEnd]')
}

var beforeRejectEnd = function () {
	logger.info('[isolation.beforeRejectEnd]')
}
