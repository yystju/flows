/**
 * isolation.js
 * global variable execution -- the execution API scope...
 * global variable tahara -- the tahara API scope...
 * global variable logger -- the logger...
 */

function init() {
	logger.info('[isolation.init]')
}

function check() {
	logger.info('[isolation.check]')
	
	for(var i in tahara.findByDefinition('isolation', null)) {
		logger.info('[isolation] i : {}', i)
	}
	
	execution.setVariable('approval', true)
}

function beforeAcceptEnd() {
	logger.info('[isolation.beforeAcceptEnd]')
}

function beforeRejectEnd() {
	logger.info('[isolation.beforeRejectEnd]')
}
