import gscript.FileSystem;

class TumTum {
	public static function expose( name:String, what:Dynamic ):Void {
		var env = untyped __js__("(typeof exports != 'undefined') ? exports : window");
		Reflect.setProperty(env, name, what);
	}
	public static function main() {
		var dargv:Array < Dynamic > = cast(untyped __js__("process.argv"), Array<Dynamic>);
		var argv:Array <String> = [for ( x in dargv ) cast(x, String)];
		var cwd = untyped __js__("process.cwd()");
		var outputPath:String = "";
		var inputPath:String = "";
		var settings = {
			"defs": new Map<String, String>(),
			"compile": false
		};
		#if bin
			var defPattern = new Reg("-D(.+)=(.+)", "");
			var lookingForOutput:Bool = false;
			for ( arg in argv ) {
				if ( arg == "-c" ) Reflect.setProperty(settings, "compile", true);
				else if ( arg == "-o" ) lookingForOutput = true;
				else if ( lookingForOutput ) outputPath = Path.join([cwd, arg]);
				else if (defPattern.test(arg)) {
					var def = defPattern.matches(arg)[0];
					trace( def );
					settings.defs.set(def[1], def[2]);
				}
				else {
					inputPath = arg;
				}
			}
			var proc:Preprocessor = new Preprocessor(inputPath, settings);
			var compiledCode:String = proc.preprocess( inputPath );
			#if js
				if ( js.Browser.supported ) {
					throw 'Error: File writing is unsupported in the Browser environment!';
				} else {
					var fs:Dynamic = untyped __js__('require("fs")');
					fs.writeFileSync( outputPath, compiledCode );
				}
			#else
				sys.io.File.saveContent( outputPath, compiledCode );
			#end
		#else
			expose("Preprocessor", Preprocessor);
		#end
	}
}