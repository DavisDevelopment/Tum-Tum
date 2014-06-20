
class CoffeeScript {
	private static var mod:Dynamic = untyped __js__("require('coffee-script')");
	public static function compile( code:String, options:Dynamic, moduleName:String ):String {
		options.module = true;
		var lines:Array<String> = [for (line in code.split('\n')) StringTools.trim(line)];
		for (line in lines) {
			if (line.substring(0, 2) == "#@") {
				var val:Bool = true;
				if (line.substring(0, 3) == "#@!") {
					val = false;
					Reflect.setProperty(options, line.substring(3), val);
				} else {
					Reflect.setProperty(options, line.substring(2), val);
				}
			} else {
				break;
			}
		}
		var jsCode:String = mod.compile(code, options);
		if (!options.module) return jsCode;
		return 'var $moduleName = (function() {
		var exports = {};
		$jsCode
		return exports;
		}());';
	}
}