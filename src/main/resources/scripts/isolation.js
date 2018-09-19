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
	logger.info('[isolation.check] currentuser : {}', tahara.currentUser())
	
	var wipno = execution.getVariable('wipno')
	
	logger.info('[isolation.check] wipno : {}', wipno)
	
	var cnt = tahara
				.find('workflows', 'inbasket')
				.eq('taskId', execution.getId())
				.count()
	
	logger.info('[isolation.check] cnt : {}', cnt)
				
	execution.setVariable('approved', cnt > 0)
}

var beforeAcceptEnd = function () {
	logger.info('[isolation.beforeAcceptEnd]')
	tahara
		.find('quality', 'defectrecord')
		.eq('id', 1)
		.list()
		.forEach(function(entity) {
			//...
			tahara.save(entity)
		})
}

var beforeRejectEnd = function () {
	logger.info('[isolation.beforeRejectEnd]')
}
