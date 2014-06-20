
class Six {
	private static var mod:Dynamic = untyped __js__("require('six')");
	public static function compile( code:String, options:Dynamic, moduleName:String="Module" ):String {
		var inlining:Bool = false;
		if (StringTools.trim(code.split('\n')[0]) == "//- wrapped = false") inlining = true;
		var jsCode:String = cast(mod.compile(code, options), String);
		if (!inlining) {
			return 'var $moduleName = (function() {
			var exports = {};
			$jsCode
			return exports;
			}());';
		} else {
			return jsCode;
		}
	}
}