
class Path {
	public static var pmod:Dynamic = untyped __js__("require('path')");
	public static function join( paths:Array <String> ):String {
		var join = pmod.join;
		var pathList = [for ( x in paths ) cast(x, String)];
		var ret = Reflect.callMethod(null, join, pathList);
		return cast(ret, String);
	}
	public static function dirname( path:String ):String {
		return cast(pmod.dirname(path), String);
	}
	public static function extname( path:String ):String {
		return cast(pmod.extname(path), String);
	}
	public static function basename( path:String, ?ext:String ):String {
		return cast(pmod.basename(path, ext), String);
	}
}