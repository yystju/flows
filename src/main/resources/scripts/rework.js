/**
 * rework.js
 * global variable execution -- the execution API scope...
 * global variable tahara -- the tahara API scope...
 * global variable logger -- the logger...
 */

var init = function () {
	logger.info('[rework.init]')
}

var check = function () {
	logger.info('[rework.check]')
	execution.setVariable('approved', false)
}

var beforeAcceptEnd = function () {
	logger.info('[rework.beforeAcceptEnd]')
}

var beforeRejectEnd = function () {
	logger.info('[rework.beforeRejectEnd]')
}
