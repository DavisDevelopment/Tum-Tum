(function() {
	#def debug true
	#def inlin true
	function print(x) {
		if (debug) {
			console.log(x);
		}
	}
	if (inlin) {
		#include <inline.js>
	}
}());