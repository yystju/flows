/**
 * rework.js
 * global variable execution -- the execution API scope...
 * global variable tahara -- the tahara API scope...
 * global variable logger -- the logger...
 */

function init() {
	logger.info('[rework.init]')
}

function check() {
	logger.info('[rework.check]')
	execution.setVariable('approval', true)
}

function beforeAcceptEnd() {
	logger.info('[rework.beforeAcceptEnd]')
}

function beforeRejectEnd() {
	logger.info('[rework.beforeRejectEnd]')
}

