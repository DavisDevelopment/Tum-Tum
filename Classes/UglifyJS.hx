
class UglifyJS {
	private static var mod:Dynamic = untyped __js__('require("./ugly/tools/node.js")');
	
	public static function minify( content:String, options:Dynamic ) {
		return mod.minify(content, options);
	}
}