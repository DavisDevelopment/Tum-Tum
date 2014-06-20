
typedef Settings = {
	var compile:Bool;
};

class Preprocessor {
	public var options:Map<String, String>;
	public var entryPoint:String;
	public var settings:Settings;
	public var defs:Dynamic;
	
	public function new( path:String, ?opts:Dynamic ) {
		if ( opts == null ) opts = {};
		this.options = (opts.defs != null) ? opts.defs : new Map();
		this.defs = {};
		this.entryPoint = path;
		this.settings = {
			"compile": (opts != null && opts.compile != null) ? opts.compile : true
		};
	}
	public function compile( path:String, inlining:Bool = false ):String {
		var ext:String = Path.extname(path);
		var content:String = gscript.FileSystem.getString(path)+'';
		switch (ext) {
			case ".js": return content;
			case ".jsh":
				HeaderFile.compile(this, content);
				return "";
			case ".coffee": return CoffeeScript.compile(content, {}, Path.basename(path, ".coffee"));
			case ".six": return Six.compile(content, {}, Path.basename(path, ".six"));
			default:
				return content;
		}
	}
	public function handleIncludes( path:String, topLevel:String ):String {
		var pattern:Reg = new Reg("#include <(.+)>", "g");
		var cwd = untyped __js__("process.cwd()");
		var realPath:String = "";
		if ( path == topLevel ) {
			realPath = path;
		} else {
			var dir:String = Path.dirname(topLevel);
			realPath = Path.join([dir, path]);
		}
		if (!gscript.FileSystem.exists(realPath)) throw 'IOError: $realPath could not be read.';
		var input:String = compile(realPath);
		var result:String = input;
		if (pattern.test(input)) {
			var includes:Array<Array<String>> = pattern.matches(input);
			for ( include in includes ) {
				var pth:String = include[1];
				var content:String = handleIncludes( pth, this.entryPoint );
				result = StringTools.replace(result, include[0], content);
			}
		}
		return result;
	}
	
	public function handleDefs( input:String ):String {
		var pattern:Reg = new Reg("#def (.+) (.+)", "g");
		var result:String = input;
		
		if ( pattern.test(result) ) {
			var defs = pattern.matches(result);
			for ( def in defs ) {
				if ( def[1] == "compile" ) {
					var comp:Bool = this.settings.compile;
					if ( def[2] == "true" ) comp = true;
					else if ( def[2] == "false" ) comp = false;
					this.settings.compile = comp;
					result = StringTools.replace(result, def[0], "");
					continue;
				}
				if ( this.settings.compile ) {
					this.options.set(def[1], def[2]);
					result = StringTools.replace(result, def[0], "");
				} else {
					var repr:String = 'var ${def[1]} = ${def[2]};';
					result = StringTools.replace(result, def[0], repr);
				}
			}
		}
		
		return result;
	}
	
	public function handleConditionals( input:String ):String {
		var ifPattern:Reg = new Reg("#if (.+)", "g");
		var elseifPattern:Reg = new Reg("#elseif (.+)", "g");
		var elsePattern:Reg = new Reg("#else", "g");
		var endPattern:Reg = new Reg("#end", "g");
		var result:String = input;
		
		for ( cond in ifPattern.matches(result) ) {
			var ref:String = cond[1];
			var jsIf:String = 'if ( $ref ) {';
			result = StringTools.replace(result, cond[0], jsIf);
		}
		for ( cond in elseifPattern.matches(result) ) {
			var ref:String = cond[1];
			var jsElseIf:String = '} else if ( $ref ) {';
			result = StringTools.replace(result, cond[0], jsElseIf);
		}
		
		result = StringTools.replace(result, "#else", "} else {");
		result = StringTools.replace(result, "#end", "}");
		
		return result;
	}
	
	public function preprocess( path:String ):String {
		var me = this;
		var result = handleIncludes(this.entryPoint, this.entryPoint);
		result = handleDefs(result);
		result = handleConditionals(result);
		
		var defsObj = (function() {
			var temp = me.defs;
			for ( key in me.options.keys() ) {
				Reflect.setProperty(temp, key, haxe.Json.parse(me.options.get(key)));
			}
			return temp;
		}());
		var sett = {
			"fromString": true,
			"mangle": true,
			"compress": {
				"global_defs": defsObj
			}
		};
		if ( this.settings.compile == true ) {
			result = UglifyJS.minify( result, sett ).code;
		}
		
		return result;
	}
}