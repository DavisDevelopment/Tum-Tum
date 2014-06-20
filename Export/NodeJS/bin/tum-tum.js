(function () { "use strict";
var $hxClasses = {},$estr = function() { return js.Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var CoffeeScript = function() { };
$hxClasses["CoffeeScript"] = CoffeeScript;
CoffeeScript.__name__ = ["CoffeeScript"];
CoffeeScript.compile = function(code,options,moduleName) {
	var lines;
	var _g = [];
	var _g1 = 0;
	var _g2 = code.split("\n");
	while(_g1 < _g2.length) {
		var line = _g2[_g1];
		++_g1;
		_g.push(StringTools.trim(line));
	}
	lines = _g;
	var _g11 = 0;
	while(_g11 < lines.length) {
		var line1 = lines[_g11];
		++_g11;
		if(line1.substring(0,2) == "#@") {
			var val = true;
			if(line1.substring(0,3) == "#@!") {
				val = false;
				Reflect.setProperty(options,line1.substring(3),val);
			} else Reflect.setProperty(options,line1.substring(2),val);
		} else break;
	}
	var jsCode = CoffeeScript.mod.compile(code,options);
	if(!options.module) return jsCode;
	return "var " + moduleName + " = (function() {\r\n\t\tvar exports = {};\r\n\t\t" + jsCode + "\r\n\t\treturn exports;\r\n\t\t}());";
};
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
$hxClasses["EReg"] = EReg;
EReg.__name__ = ["EReg"];
EReg.prototype = {
	match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,matched: function(n) {
		if(this.r.m != null && n >= 0 && n < this.r.m.length) return this.r.m[n]; else throw "EReg::matched";
	}
	,matchedPos: function() {
		if(this.r.m == null) throw "No string matched";
		return { pos : this.r.m.index, len : this.r.m[0].length};
	}
	,matchSub: function(s,pos,len) {
		if(len == null) len = -1;
		if(this.r.global) {
			this.r.lastIndex = pos;
			this.r.m = this.r.exec(len < 0?s:HxOverrides.substr(s,0,pos + len));
			var b = this.r.m != null;
			if(b) this.r.s = s;
			return b;
		} else {
			var b1 = this.match(len < 0?HxOverrides.substr(s,pos,null):HxOverrides.substr(s,pos,len));
			if(b1) {
				this.r.s = s;
				this.r.m.index += pos;
			}
			return b1;
		}
	}
	,map: function(s,f) {
		var offset = 0;
		var buf = new StringBuf();
		do {
			if(offset >= s.length) break; else if(!this.matchSub(s,offset)) {
				buf.add(HxOverrides.substr(s,offset,null));
				break;
			}
			var p = this.matchedPos();
			buf.add(HxOverrides.substr(s,offset,p.pos - offset));
			buf.add(f(this));
			if(p.len == 0) {
				buf.add(HxOverrides.substr(s,p.pos,1));
				offset = p.pos + 1;
			} else offset = p.pos + p.len;
		} while(this.r.global);
		if(!this.r.global && offset > 0 && offset < s.length) buf.add(HxOverrides.substr(s,offset,null));
		return buf.b;
	}
	,__class__: EReg
};
var GryffinScriptRuntime = function() {
	this.parser = new gscript.Parser();
	this.parser.allowJSON = true;
	this.interp = new gscript.Interp();
};
$hxClasses["GryffinScriptRuntime"] = GryffinScriptRuntime;
GryffinScriptRuntime.__name__ = ["GryffinScriptRuntime"];
GryffinScriptRuntime.prototype = {
	getModule: function(path) {
		var code = "";
		if(gscript.FileSystem.exists(path + ".gryf")) code = gscript.FileSystem.getString(path + ".gryf"); else throw "Error: could not load module " + path;
		var vm = new GryffinScriptRuntime();
		vm.bindBuiltins();
		vm.runString(code);
		return vm.interp.variables.get("exports");
	}
	,bindBuiltins: function() {
		var me = this;
		var interp = this.interp;
		var value = new gscript.typesystem.GSObject();
		interp.variables.set("exports",value);
		var gsrequire = new gscript.typesystem.GSFunction(true,function(data) {
			var modulePath = Std.string(data.args[0]);
			return me.getModule(modulePath);
		});
		interp.variables.set("require",gsrequire);
		var range = new gscript.typesystem.GSFunction(true,function(data1) {
			var firstArg = data1.args[0];
			var secondArg = data1.args[1];
			if(firstArg.type == "number" && secondArg.type == "number") {
				var start = Math.round(firstArg.value);
				var end = Math.round(secondArg.value);
				var holder = new gscript.typesystem.GSArray();
				var _g = start;
				while(_g < end) {
					var x = _g++;
					holder.push(new gscript.typesystem.GSNumber(x));
				}
				return holder;
			} else {
				throw "TypeError: 'range' take two arguments, both of which are numbers, you supplied [" + firstArg.type + ", " + secondArg.type + "]";
				return null;
			}
		});
		interp.variables.set("range",range);
		var callable = new gscript.typesystem.GSFunction(true,function(data2) {
			var thing = data2.args[0];
			return interp.callable(thing);
		});
		interp.variables.set("callable",callable);
		var type = new gscript.typesystem.GSFunction(true,function(data3) {
			var thing1 = data3.args[0];
			var type1 = "unknown";
			if(thing1 == null) type1 = "undefined";
			if(Reflect.getProperty(thing1,"type") != null) type1 = Reflect.getProperty(thing1,"type");
			return new gscript.typesystem.GSString(type1);
		});
		interp.variables.set("type",type);
	}
	,runString: function(code) {
		var program = this.parser.parseString(code);
		this.bindBuiltins();
		return this.interp.execute(program);
	}
	,loadValue: function(key) {
		return gscript.gsbind.GryffinBind.toNative(this.interp.variables.get(key));
	}
	,bindValue: function(key,value) {
		var gsValue = gscript.gsbind.GryffinBind.fromNative(value);
		this.interp.variables.set(key,gsValue);
	}
	,bindValueAsPointer: function(key,value) {
		var ptr = new gscript.typesystem.GSNativePointer(value,this.interp);
		this.interp.variables.set(key,ptr);
		return ptr;
	}
	,bindClass: function(key,value) {
		var gsClass = gscript.gsbind.GryffinBind.bindClass(value);
		this.interp.variables.set(key,gsClass);
	}
	,__class__: GryffinScriptRuntime
};
var HeaderFile = function() { };
$hxClasses["HeaderFile"] = HeaderFile;
HeaderFile.__name__ = ["HeaderFile"];
HeaderFile.compile = function(prep,content) {
	var vm = new GryffinScriptRuntime();
	vm.bindBuiltins();
	vm.runString(content);
	var defs = vm.loadValue("exports");
	var _g = 0;
	var _g1 = Reflect.fields(defs);
	while(_g < _g1.length) {
		var key = _g1[_g];
		++_g;
		Reflect.setProperty(prep.defs,key,Reflect.getProperty(defs,key));
	}
};
var HxOverrides = function() { };
$hxClasses["HxOverrides"] = HxOverrides;
HxOverrides.__name__ = ["HxOverrides"];
HxOverrides.dateStr = function(date) {
	var m = date.getMonth() + 1;
	var d = date.getDate();
	var h = date.getHours();
	var mi = date.getMinutes();
	var s = date.getSeconds();
	return date.getFullYear() + "-" + (m < 10?"0" + m:"" + m) + "-" + (d < 10?"0" + d:"" + d) + " " + (h < 10?"0" + h:"" + h) + ":" + (mi < 10?"0" + mi:"" + mi) + ":" + (s < 10?"0" + s:"" + s);
};
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
HxOverrides.indexOf = function(a,obj,i) {
	var len = a.length;
	if(i < 0) {
		i += len;
		if(i < 0) i = 0;
	}
	while(i < len) {
		if(a[i] === obj) return i;
		i++;
	}
	return -1;
};
HxOverrides.remove = function(a,obj) {
	var i = HxOverrides.indexOf(a,obj,0);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
};
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
var Lambda = function() { };
$hxClasses["Lambda"] = Lambda;
Lambda.__name__ = ["Lambda"];
Lambda.has = function(it,elt) {
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(x == elt) return true;
	}
	return false;
};
Lambda.indexOf = function(it,v) {
	var i = 0;
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var v2 = $it0.next();
		if(v == v2) return i;
		i++;
	}
	return -1;
};
var List = function() { };
$hxClasses["List"] = List;
List.__name__ = ["List"];
List.prototype = {
	iterator: function() {
		return { h : this.h, hasNext : function() {
			return this.h != null;
		}, next : function() {
			if(this.h == null) return null;
			var x = this.h[0];
			this.h = this.h[1];
			return x;
		}};
	}
	,__class__: List
};
var IMap = function() { };
$hxClasses["IMap"] = IMap;
IMap.__name__ = ["IMap"];
IMap.prototype = {
	__class__: IMap
};
Math.__name__ = ["Math"];
var Path = function() { };
$hxClasses["Path"] = Path;
Path.__name__ = ["Path"];
Path.join = function(paths) {
	var join = Path.pmod.join;
	var pathList;
	var _g = [];
	var _g1 = 0;
	while(_g1 < paths.length) {
		var x = paths[_g1];
		++_g1;
		_g.push(js.Boot.__cast(x , String));
	}
	pathList = _g;
	var ret = join.apply(null,pathList);
	return js.Boot.__cast(ret , String);
};
Path.dirname = function(path) {
	return js.Boot.__cast(Path.pmod.dirname(path) , String);
};
Path.extname = function(path) {
	return js.Boot.__cast(Path.pmod.extname(path) , String);
};
Path.basename = function(path,ext) {
	return js.Boot.__cast(Path.pmod.basename(path,ext) , String);
};
var Preprocessor = function(path,opts) {
	if(opts == null) opts = { };
	if(opts.defs != null) this.options = opts.defs; else this.options = new haxe.ds.StringMap();
	this.defs = { };
	this.entryPoint = path;
	this.settings = { compile : opts != null && opts.compile != null?opts.compile:true};
};
$hxClasses["Preprocessor"] = Preprocessor;
Preprocessor.__name__ = ["Preprocessor"];
Preprocessor.prototype = {
	compile: function(path,inlining) {
		if(inlining == null) inlining = false;
		var ext = Path.extname(path);
		var content = gscript.FileSystem.getString(path) + "";
		switch(ext) {
		case ".js":
			return content;
		case ".jsh":
			HeaderFile.compile(this,content);
			return "";
		case ".coffee":
			return CoffeeScript.compile(content,{ },Path.basename(path,".coffee"));
		case ".six":
			return Six.compile(content,{ },Path.basename(path,".six"));
		default:
			return content;
		}
	}
	,handleIncludes: function(path,topLevel) {
		var pattern = new Reg("#include <(.+)>","g");
		var cwd = process.cwd();
		var realPath = "";
		if(path == topLevel) realPath = path; else {
			var dir = Path.dirname(topLevel);
			realPath = Path.join([dir,path]);
		}
		if(!gscript.FileSystem.exists(realPath)) throw "IOError: " + realPath + " could not be read.";
		var input = this.compile(realPath);
		var result = input;
		if(pattern.test(input)) {
			var includes = pattern.matches(input);
			var _g = 0;
			while(_g < includes.length) {
				var include = includes[_g];
				++_g;
				var pth = include[1];
				var content = this.handleIncludes(pth,this.entryPoint);
				result = StringTools.replace(result,include[0],content);
			}
		}
		return result;
	}
	,handleDefs: function(input) {
		var pattern = new Reg("#def (.+) (.+)","g");
		var result = input;
		if(pattern.test(result)) {
			var defs = pattern.matches(result);
			var _g = 0;
			while(_g < defs.length) {
				var def = defs[_g];
				++_g;
				if(def[1] == "compile") {
					var comp = this.settings.compile;
					if(def[2] == "true") comp = true; else if(def[2] == "false") comp = false;
					this.settings.compile = comp;
					result = StringTools.replace(result,def[0],"");
					continue;
				}
				if(this.settings.compile) {
					this.options.set(def[1],def[2]);
					result = StringTools.replace(result,def[0],"");
				} else {
					var repr = "var " + def[1] + " = " + def[2] + ";";
					result = StringTools.replace(result,def[0],repr);
				}
			}
		}
		return result;
	}
	,handleConditionals: function(input) {
		var ifPattern = new Reg("#if (.+)","g");
		var elseifPattern = new Reg("#elseif (.+)","g");
		var elsePattern = new Reg("#else","g");
		var endPattern = new Reg("#end","g");
		var result = input;
		var _g = 0;
		var _g1 = ifPattern.matches(result);
		while(_g < _g1.length) {
			var cond = _g1[_g];
			++_g;
			var ref = cond[1];
			var jsIf = "if ( " + ref + " ) {";
			result = StringTools.replace(result,cond[0],jsIf);
		}
		var _g2 = 0;
		var _g11 = elseifPattern.matches(result);
		while(_g2 < _g11.length) {
			var cond1 = _g11[_g2];
			++_g2;
			var ref1 = cond1[1];
			var jsElseIf = "} else if ( " + ref1 + " ) {";
			result = StringTools.replace(result,cond1[0],jsElseIf);
		}
		result = StringTools.replace(result,"#else","} else {");
		result = StringTools.replace(result,"#end","}");
		return result;
	}
	,preprocess: function(path) {
		var me = this;
		var result = this.handleIncludes(this.entryPoint,this.entryPoint);
		result = this.handleDefs(result);
		result = this.handleConditionals(result);
		var defsObj = (function() {
			var temp = me.defs;
			var $it0 = me.options.keys();
			while( $it0.hasNext() ) {
				var key = $it0.next();
				Reflect.setProperty(temp,key,JSON.parse(me.options.get(key)));
			}
			return temp;
		})();
		var sett = { fromString : true, mangle : true, compress : { global_defs : defsObj}};
		if(this.settings.compile == true) result = UglifyJS.minify(result,sett).code;
		return result;
	}
	,__class__: Preprocessor
};
var Reflect = function() { };
$hxClasses["Reflect"] = Reflect;
Reflect.__name__ = ["Reflect"];
Reflect.field = function(o,field) {
	try {
		return o[field];
	} catch( e ) {
		return null;
	}
};
Reflect.getProperty = function(o,field) {
	var tmp;
	if(o == null) return null; else if(o.__properties__ && (tmp = o.__properties__["get_" + field])) return o[tmp](); else return o[field];
};
Reflect.setProperty = function(o,field,value) {
	var tmp;
	if(o.__properties__ && (tmp = o.__properties__["set_" + field])) o[tmp](value); else o[field] = value;
};
Reflect.callMethod = function(o,func,args) {
	return func.apply(o,args);
};
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
};
Reflect.isFunction = function(f) {
	return typeof(f) == "function" && !(f.__name__ || f.__ename__);
};
Reflect.isObject = function(v) {
	if(v == null) return false;
	var t = typeof(v);
	return t == "string" || t == "object" && v.__enum__ == null || t == "function" && (v.__name__ || v.__ename__) != null;
};
Reflect.deleteField = function(o,field) {
	if(!Object.prototype.hasOwnProperty.call(o,field)) return false;
	delete(o[field]);
	return true;
};
Reflect.makeVarArgs = function(f) {
	return function() {
		var a = Array.prototype.slice.call(arguments);
		return f(a);
	};
};
var Reg = function(pattern,options) {
	this.regex = new EReg(pattern,options);
};
$hxClasses["Reg"] = Reg;
Reg.__name__ = ["Reg"];
Reg.prototype = {
	test: function(text) {
		return this.regex.match(text);
	}
	,matches: function(text) {
		var matches = [];
		var result = this.regex.map(text,function(e) {
			var parts = [];
			var i = 0;
			var matched = true;
			while(matched) {
				try {
					e.matched(i);
				} catch( e1 ) {
					if( js.Boot.__instanceof(e1,String) ) {
						matched = false;
						break;
					} else throw(e1);
				}
				parts.push(e.matched(i));
				i++;
			}
			matches.push(parts);
			return "";
		});
		return matches;
	}
	,__class__: Reg
};
var Six = function() { };
$hxClasses["Six"] = Six;
Six.__name__ = ["Six"];
Six.compile = function(code,options,moduleName) {
	if(moduleName == null) moduleName = "Module";
	var inlining = false;
	if(StringTools.trim(code.split("\n")[0]) == "//- wrapped = false") inlining = true;
	var jsCode;
	jsCode = js.Boot.__cast(Six.mod.compile(code,options) , String);
	if(!inlining) return "var " + moduleName + " = (function() {\r\n\t\t\tvar exports = {};\r\n\t\t\t" + jsCode + "\r\n\t\t\treturn exports;\r\n\t\t\t}());"; else return jsCode;
};
var Std = function() { };
$hxClasses["Std"] = Std;
Std.__name__ = ["Std"];
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
};
var StringBuf = function() {
	this.b = "";
};
$hxClasses["StringBuf"] = StringBuf;
StringBuf.__name__ = ["StringBuf"];
StringBuf.prototype = {
	add: function(x) {
		this.b += Std.string(x);
	}
	,__class__: StringBuf
};
var StringTools = function() { };
$hxClasses["StringTools"] = StringTools;
StringTools.__name__ = ["StringTools"];
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	return c > 8 && c < 14 || c == 32;
};
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) r++;
	if(r > 0) return HxOverrides.substr(s,r,l - r); else return s;
};
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) r++;
	if(r > 0) return HxOverrides.substr(s,0,l - r); else return s;
};
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
};
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
};
StringTools.fastCodeAt = function(s,index) {
	return s.charCodeAt(index);
};
var TumTum = function() { };
$hxClasses["TumTum"] = TumTum;
TumTum.__name__ = ["TumTum"];
TumTum.expose = function(name,what) {
	var env = (typeof exports != 'undefined') ? exports : window;
	Reflect.setProperty(env,name,what);
};
TumTum.main = function() {
	var dargv;
	dargv = js.Boot.__cast(process.argv , Array);
	var argv;
	var _g = [];
	var _g1 = 0;
	while(_g1 < dargv.length) {
		var x = dargv[_g1];
		++_g1;
		_g.push(js.Boot.__cast(x , String));
	}
	argv = _g;
	var cwd = process.cwd();
	var outputPath = "";
	var inputPath = "";
	var settings = { defs : new haxe.ds.StringMap(), compile : false};
	var defPattern = new Reg("-D(.+)=(.+)","");
	var lookingForOutput = false;
	var _g11 = 0;
	while(_g11 < argv.length) {
		var arg = argv[_g11];
		++_g11;
		if(arg == "-c") Reflect.setProperty(settings,"compile",true); else if(arg == "-o") lookingForOutput = true; else if(lookingForOutput) outputPath = Path.join([cwd,arg]); else if(defPattern.test(arg)) {
			var def = defPattern.matches(arg)[0];
			haxe.Log.trace(def,{ fileName : "TumTum.hx", lineNumber : 27, className : "TumTum", methodName : "main"});
			settings.defs.set(def[1],def[2]);
		} else inputPath = arg;
	}
	var proc = new Preprocessor(inputPath,settings);
	var compiledCode = proc.preprocess(inputPath);
	if(js.Browser.get_supported()) throw "Error: File writing is unsupported in the Browser environment!"; else {
		var fs = require("fs");
		fs.writeFileSync(outputPath,compiledCode);
	}
};
var ValueType = $hxClasses["ValueType"] = { __ename__ : ["ValueType"], __constructs__ : ["TNull","TInt","TFloat","TBool","TObject","TFunction","TClass","TEnum","TUnknown"] };
ValueType.TNull = ["TNull",0];
ValueType.TNull.toString = $estr;
ValueType.TNull.__enum__ = ValueType;
ValueType.TInt = ["TInt",1];
ValueType.TInt.toString = $estr;
ValueType.TInt.__enum__ = ValueType;
ValueType.TFloat = ["TFloat",2];
ValueType.TFloat.toString = $estr;
ValueType.TFloat.__enum__ = ValueType;
ValueType.TBool = ["TBool",3];
ValueType.TBool.toString = $estr;
ValueType.TBool.__enum__ = ValueType;
ValueType.TObject = ["TObject",4];
ValueType.TObject.toString = $estr;
ValueType.TObject.__enum__ = ValueType;
ValueType.TFunction = ["TFunction",5];
ValueType.TFunction.toString = $estr;
ValueType.TFunction.__enum__ = ValueType;
ValueType.TClass = function(c) { var $x = ["TClass",6,c]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; };
ValueType.TEnum = function(e) { var $x = ["TEnum",7,e]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; };
ValueType.TUnknown = ["TUnknown",8];
ValueType.TUnknown.toString = $estr;
ValueType.TUnknown.__enum__ = ValueType;
var Type = function() { };
$hxClasses["Type"] = Type;
Type.__name__ = ["Type"];
Type.getClass = function(o) {
	if(o == null) return null;
	if((o instanceof Array) && o.__enum__ == null) return Array; else return o.__class__;
};
Type.getClassName = function(c) {
	var a = c.__name__;
	return a.join(".");
};
Type.getEnumName = function(e) {
	var a = e.__ename__;
	return a.join(".");
};
Type.resolveClass = function(name) {
	var cl = $hxClasses[name];
	if(cl == null || !cl.__name__) return null;
	return cl;
};
Type.resolveEnum = function(name) {
	var e = $hxClasses[name];
	if(e == null || !e.__ename__) return null;
	return e;
};
Type.createInstance = function(cl,args) {
	var _g = args.length;
	switch(_g) {
	case 0:
		return new cl();
	case 1:
		return new cl(args[0]);
	case 2:
		return new cl(args[0],args[1]);
	case 3:
		return new cl(args[0],args[1],args[2]);
	case 4:
		return new cl(args[0],args[1],args[2],args[3]);
	case 5:
		return new cl(args[0],args[1],args[2],args[3],args[4]);
	case 6:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5]);
	case 7:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6]);
	case 8:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7]);
	default:
		throw "Too many arguments";
	}
	return null;
};
Type["typeof"] = function(v) {
	var _g = typeof(v);
	switch(_g) {
	case "boolean":
		return ValueType.TBool;
	case "string":
		return ValueType.TClass(String);
	case "number":
		if(Math.ceil(v) == v % 2147483648.0) return ValueType.TInt;
		return ValueType.TFloat;
	case "object":
		if(v == null) return ValueType.TNull;
		var e = v.__enum__;
		if(e != null) return ValueType.TEnum(e);
		var c;
		if((v instanceof Array) && v.__enum__ == null) c = Array; else c = v.__class__;
		if(c != null) return ValueType.TClass(c);
		return ValueType.TObject;
	case "function":
		if(v.__name__ || v.__ename__) return ValueType.TObject;
		return ValueType.TFunction;
	case "undefined":
		return ValueType.TNull;
	default:
		return ValueType.TUnknown;
	}
};
Type.enumEq = function(a,b) {
	if(a == b) return true;
	try {
		if(a[0] != b[0]) return false;
		var _g1 = 2;
		var _g = a.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(!Type.enumEq(a[i],b[i])) return false;
		}
		var e = a.__enum__;
		if(e != b.__enum__ || e == null) return false;
	} catch( e1 ) {
		return false;
	}
	return true;
};
var UglifyJS = function() { };
$hxClasses["UglifyJS"] = UglifyJS;
UglifyJS.__name__ = ["UglifyJS"];
UglifyJS.minify = function(content,options) {
	return UglifyJS.mod.minify(content,options);
};
var gscript = {};
gscript.Const = $hxClasses["gscript.Const"] = { __ename__ : ["gscript","Const"], __constructs__ : ["CInt","CFloat","CString"] };
gscript.Const.CInt = function(v) { var $x = ["CInt",0,v]; $x.__enum__ = gscript.Const; $x.toString = $estr; return $x; };
gscript.Const.CFloat = function(f) { var $x = ["CFloat",1,f]; $x.__enum__ = gscript.Const; $x.toString = $estr; return $x; };
gscript.Const.CString = function(s) { var $x = ["CString",2,s]; $x.__enum__ = gscript.Const; $x.toString = $estr; return $x; };
gscript.Expr = $hxClasses["gscript.Expr"] = { __ename__ : ["gscript","Expr"], __constructs__ : ["EConst","EIdent","EVar","EParent","EBlock","EField","ERefAccess","EBinop","EUnop","ECall","EIf","EWhile","EFor","EBreak","EContinue","EFunction","EReturn","EArray","EArrayDecl","ENew","EDelete","EThrow","ETry","EObject","ETernary"] };
gscript.Expr.EConst = function(c) { var $x = ["EConst",0,c]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.EIdent = function(v) { var $x = ["EIdent",1,v]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.EVar = function(n,t,e) { var $x = ["EVar",2,n,t,e]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.EParent = function(e) { var $x = ["EParent",3,e]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.EBlock = function(e) { var $x = ["EBlock",4,e]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.EField = function(e,f) { var $x = ["EField",5,e,f]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.ERefAccess = function(l,r) { var $x = ["ERefAccess",6,l,r]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.EBinop = function(op,e1,e2) { var $x = ["EBinop",7,op,e1,e2]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.EUnop = function(op,prefix,e) { var $x = ["EUnop",8,op,prefix,e]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.ECall = function(e,params) { var $x = ["ECall",9,e,params]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.EIf = function(cond,e1,e2) { var $x = ["EIf",10,cond,e1,e2]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.EWhile = function(cond,e) { var $x = ["EWhile",11,cond,e]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.EFor = function(v,it,e) { var $x = ["EFor",12,v,it,e]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.EBreak = ["EBreak",13];
gscript.Expr.EBreak.toString = $estr;
gscript.Expr.EBreak.__enum__ = gscript.Expr;
gscript.Expr.EContinue = ["EContinue",14];
gscript.Expr.EContinue.toString = $estr;
gscript.Expr.EContinue.__enum__ = gscript.Expr;
gscript.Expr.EFunction = function(args,e,name,ret) { var $x = ["EFunction",15,args,e,name,ret]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.EReturn = function(e) { var $x = ["EReturn",16,e]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.EArray = function(e,index) { var $x = ["EArray",17,e,index]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.EArrayDecl = function(e) { var $x = ["EArrayDecl",18,e]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.ENew = function(cl,params) { var $x = ["ENew",19,cl,params]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.EDelete = function(id) { var $x = ["EDelete",20,id]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.EThrow = function(e) { var $x = ["EThrow",21,e]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.ETry = function(e,v,t,ecatch) { var $x = ["ETry",22,e,v,t,ecatch]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.EObject = function(fl) { var $x = ["EObject",23,fl]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.Expr.ETernary = function(cond,e1,e2) { var $x = ["ETernary",24,cond,e1,e2]; $x.__enum__ = gscript.Expr; $x.toString = $estr; return $x; };
gscript.CType = $hxClasses["gscript.CType"] = { __ename__ : ["gscript","CType"], __constructs__ : ["CTPath","CTFun","CTAnon","CTParent"] };
gscript.CType.CTPath = function(path,params) { var $x = ["CTPath",0,path,params]; $x.__enum__ = gscript.CType; $x.toString = $estr; return $x; };
gscript.CType.CTFun = function(args,ret) { var $x = ["CTFun",1,args,ret]; $x.__enum__ = gscript.CType; $x.toString = $estr; return $x; };
gscript.CType.CTAnon = function(fields) { var $x = ["CTAnon",2,fields]; $x.__enum__ = gscript.CType; $x.toString = $estr; return $x; };
gscript.CType.CTParent = function(t) { var $x = ["CTParent",3,t]; $x.__enum__ = gscript.CType; $x.toString = $estr; return $x; };
gscript.Error = $hxClasses["gscript.Error"] = { __ename__ : ["gscript","Error"], __constructs__ : ["EInvalidChar","EUnexpected","EUnterminatedString","EUnterminatedComment","EUnknownVariable","EInvalidIterator","EInvalidOp","EInvalidAccess"] };
gscript.Error.EInvalidChar = function(c) { var $x = ["EInvalidChar",0,c]; $x.__enum__ = gscript.Error; $x.toString = $estr; return $x; };
gscript.Error.EUnexpected = function(s) { var $x = ["EUnexpected",1,s]; $x.__enum__ = gscript.Error; $x.toString = $estr; return $x; };
gscript.Error.EUnterminatedString = ["EUnterminatedString",2];
gscript.Error.EUnterminatedString.toString = $estr;
gscript.Error.EUnterminatedString.__enum__ = gscript.Error;
gscript.Error.EUnterminatedComment = ["EUnterminatedComment",3];
gscript.Error.EUnterminatedComment.toString = $estr;
gscript.Error.EUnterminatedComment.__enum__ = gscript.Error;
gscript.Error.EUnknownVariable = function(v) { var $x = ["EUnknownVariable",4,v]; $x.__enum__ = gscript.Error; $x.toString = $estr; return $x; };
gscript.Error.EInvalidIterator = function(v) { var $x = ["EInvalidIterator",5,v]; $x.__enum__ = gscript.Error; $x.toString = $estr; return $x; };
gscript.Error.EInvalidOp = function(op) { var $x = ["EInvalidOp",6,op]; $x.__enum__ = gscript.Error; $x.toString = $estr; return $x; };
gscript.Error.EInvalidAccess = function(f) { var $x = ["EInvalidAccess",7,f]; $x.__enum__ = gscript.Error; $x.toString = $estr; return $x; };
gscript.FileSystem = function() { };
$hxClasses["gscript.FileSystem"] = gscript.FileSystem;
gscript.FileSystem.__name__ = ["gscript","FileSystem"];
gscript.FileSystem.exists = function(path) {
	if(js.Browser.get_supported()) {
		var req = new XMLHttpRequest();
		req.open("GET",path,false);
		req.send(null);
		if(req.status != 200) return false;
		return true;
	} else {
		var fs = require("fs");
		return fs.existsSync(path);
	}
};
gscript.FileSystem.getString = function(path) {
	if(js.Browser.get_supported()) {
		var req = new XMLHttpRequest();
		req.open("GET",path,false);
		req.send(null);
		if(req.status != 200) throw req.statusText;
		return req.responseText;
	} else {
		var fs = require("fs");
		return Std.string(fs.readFileSync(path)) + "";
	}
};
gscript.FileSystem.writeString = function(path,content) {
	if(js.Browser.get_supported()) throw "Error: File writing is unsupported in the Browser environment!"; else {
		var fs = require("fs");
		fs.writeFileSync(path,content);
	}
};
gscript._Interp = {};
gscript._Interp.Stop = $hxClasses["gscript._Interp.Stop"] = { __ename__ : ["gscript","_Interp","Stop"], __constructs__ : ["SBreak","SContinue","SReturn"] };
gscript._Interp.Stop.SBreak = ["SBreak",0];
gscript._Interp.Stop.SBreak.toString = $estr;
gscript._Interp.Stop.SBreak.__enum__ = gscript._Interp.Stop;
gscript._Interp.Stop.SContinue = ["SContinue",1];
gscript._Interp.Stop.SContinue.toString = $estr;
gscript._Interp.Stop.SContinue.__enum__ = gscript._Interp.Stop;
gscript._Interp.Stop.SReturn = function(v) { var $x = ["SReturn",2,v]; $x.__enum__ = gscript._Interp.Stop; $x.toString = $estr; return $x; };
gscript.Interp = function() {
	this.locals = new haxe.ds.StringMap();
	this.variables = new haxe.ds.StringMap();
	this.declared = new Array();
	this.variables.set("null",null);
	this.variables.set("true",true);
	this.variables.set("false",false);
	this.variables.set("trace",function(e) {
		haxe.Log.trace(Std.string(e),{ fileName : "gscript", lineNumber : 0});
	});
	this.initOps();
};
$hxClasses["gscript.Interp"] = gscript.Interp;
gscript.Interp.__name__ = ["gscript","Interp"];
gscript.Interp.prototype = {
	initOps: function() {
		var me = this;
		this.binops = new haxe.ds.StringMap();
		var opMap;
		var _g = new haxe.ds.StringMap();
		_g.set("+","__add__");
		_g.set("-","__sub__");
		_g.set("*","__mul__");
		_g.set("/","__div__");
		_g.set("%","__mod__");
		_g.set("<<","__lshift__");
		_g.set(">>","__rshift__");
		_g.set("&","__and__");
		_g.set("|","__or__");
		_g.set("&&","__land__");
		_g.set("||","__lor__");
		_g.set("==","__eq__");
		_g.set("!=","__ne__");
		_g.set("<","__lt__");
		_g.set(">","__gt__");
		_g.set("<=","__le__");
		_g.set(">=","__ge__");
		_g.set("+=","__iadd__");
		_g.set("-=","__isub__");
		_g.set("*=","__imul__");
		_g.set("/=","__idiv__");
		opMap = _g;
		var $it0 = opMap.keys();
		while( $it0.hasNext() ) {
			var k = $it0.next();
			var k1 = [k];
			var boolOp = Lambda.has(["||","&&"],k1[0]);
			this.binops.set(k1[0],(function(k1) {
				return function(e1,e2) {
					var methodName = opMap.get(k1[0]);
					var isBool = (function() {
						return function(x) {
							return typeof(x) == "boolean" || x == null;
						};
					})();
					var obj1 = me.expr(e1);
					var obj2 = me.expr(e2);
					var OneBool = isBool(obj1);
					var TwoBool = isBool(obj2);
					if(OneBool == false && TwoBool == false) return Reflect.callMethod(obj1,Reflect.getProperty(js.Boot.__cast(obj1 , gscript.typesystem.GSObject),methodName),[obj2]); else if(OneBool && !TwoBool) return Reflect.callMethod(obj2,Reflect.getProperty(js.Boot.__cast(obj2 , gscript.typesystem.GSObject),methodName),[obj1]); else if(!OneBool && TwoBool || !OneBool && !TwoBool) return Reflect.callMethod(obj1,Reflect.getProperty(js.Boot.__cast(obj1 , gscript.typesystem.GSObject),methodName),[obj2]); else {
						haxe.Log.trace("This is going to be a null pointer! [" + (OneBool == null?"null":"" + OneBool) + ", " + (TwoBool == null?"null":"" + TwoBool) + "]",{ fileName : "Interp.hx", lineNumber : 96, className : "gscript.Interp", methodName : "initOps"});
						return ((function($this) {
							var $r;
							var this1;
							{
								var _g1 = new haxe.ds.StringMap();
								_g1.set("==",(function() {
									return function(x1,y) {
										return x1 == y;
									};
								})());
								_g1.set("!=",(function() {
									return function(x2,y1) {
										return x2 != y1;
									};
								})());
								this1 = _g1;
							}
							$r = this1.get(k1[0]);
							return $r;
						}(this)))(obj1,obj2);
					}
				};
			})(k1));
		}
		this.binops.set("=",$bind(this,this.assign));
		this.assignOp("%=",function(v1,v2) {
			return v1 % v2;
		});
		this.assignOp("&=",function(v11,v21) {
			return v11 & v21;
		});
		this.assignOp("|=",function(v12,v22) {
			return v12 | v22;
		});
		this.assignOp("^=",function(v13,v23) {
			return v13 ^ v23;
		});
		this.assignOp("<<=",function(v14,v24) {
			return v14 << v24;
		});
		this.assignOp(">>=",function(v15,v25) {
			return v15 >> v25;
		});
	}
	,assign: function(e1,e2) {
		var v = this.expr(e2);
		switch(e1[1]) {
		case 1:
			var id = e1[2];
			var l = this.locals.get(id);
			if(l == null) {
				var o = this.variables.get(id);
				if(o != null) {
					if(o.type == "pointer") Reflect.callMethod(o,Reflect.getProperty(o,"__reassign__"),[v]); else this.variables.set(id,v);
				} else this.variables.set(id,v);
			} else {
				var o1 = l.r;
				if(o1.type == "pointer") Reflect.callMethod(o1,Reflect.getProperty(o1,"__reassign__"),[v]); else l.r = v;
			}
			break;
		case 5:
			var f = e1[3];
			var e = e1[2];
			v = this.expr(e).__setattr__(new gscript.typesystem.GSString(f),v);
			break;
		case 6:
			var f1 = e1[3];
			var pt = e1[2];
			this.expr(pt).__pset__(this.expr(f1),v);
			break;
		case 17:
			var index = e1[3];
			var e3 = e1[2];
			this.expr(e3).__setitem__(this.expr(index),v);
			break;
		default:
			throw gscript.Error.EInvalidOp("=");
		}
		return v;
	}
	,assignOp: function(op,fop) {
		var me = this;
		this.binops.set(op,function(e1,e2) {
			return me.evalAssignOp(op,fop,e1,e2);
		});
	}
	,evalAssignOp: function(op,fop,e1,e2) {
		var v;
		switch(e1[1]) {
		case 1:
			var id = e1[2];
			var l = this.locals.get(id);
			v = fop(this.expr(e1),this.expr(e2));
			if(l == null) this.variables.set(id,v); else l.r = v;
			break;
		case 5:
			var f = e1[3];
			var e = e1[2];
			var obj = this.expr(e);
			v = fop(this.get(obj,f),this.expr(e2));
			v = this.set(obj,f,v);
			break;
		case 17:
			var index = e1[3];
			var e3 = e1[2];
			var arr = this.expr(e3);
			var index1 = this.expr(index);
			v = fop(arr[index1],this.expr(e2));
			arr[index1] = v;
			break;
		default:
			throw gscript.Error.EInvalidOp(op);
		}
		return v;
	}
	,increment: function(e,prefix,delta) {
		switch(e[1]) {
		case 1:
			var id = e[2];
			var l = this.locals.get(id);
			var v;
			if(l == null) v = this.variables.get(id); else v = l.r;
			if(prefix) {
				v += delta;
				if(l == null) {
					var value = v;
					this.variables.set(id,value);
				} else l.r = v;
			} else if(l == null) {
				var value1 = v + delta;
				this.variables.set(id,value1);
			} else l.r = v + delta;
			return v;
		case 5:
			var f = e[3];
			var e1 = e[2];
			var obj = this.expr(e1);
			var v1 = this.get(obj,f);
			if(prefix) {
				v1 += delta;
				this.set(obj,f,v1);
			} else this.set(obj,f,v1 + delta);
			return v1;
		case 17:
			var index = e[3];
			var e2 = e[2];
			var arr = this.expr(e2);
			var index1 = this.expr(index);
			var v2 = arr[index1];
			if(prefix) {
				v2 += delta;
				arr[index1] = v2;
			} else arr[index1] = v2 + delta;
			return v2;
		default:
			throw gscript.Error.EInvalidOp(delta > 0?"++":"--");
		}
	}
	,execute: function(expr) {
		this.locals = new haxe.ds.StringMap();
		return this.exprReturn(expr);
	}
	,exprReturn: function(e) {
		try {
			return this.expr(e);
		} catch( e1 ) {
			if( js.Boot.__instanceof(e1,gscript._Interp.Stop) ) {
				switch(e1[1]) {
				case 0:
					throw "Invalid break";
					break;
				case 1:
					throw "Invalid continue";
					break;
				case 2:
					var v = e1[2];
					return v;
				}
			} else throw(e1);
		}
		return null;
	}
	,duplicate: function(h) {
		var h2 = new haxe.ds.StringMap();
		var $it0 = h.keys();
		while( $it0.hasNext() ) {
			var k = $it0.next();
			var value = h.get(k);
			h2.set(k,value);
		}
		return h2;
	}
	,restore: function(old) {
		while(this.declared.length > old) {
			var d = this.declared.pop();
			this.locals.set(d.n,d.old);
		}
	}
	,resolve: function(id) {
		var l = this.locals.get(id);
		if(l != null) return l.r;
		var v = this.variables.get(id);
		if(v == null && !this.variables.exists(id)) throw gscript.Error.EUnknownVariable(id);
		return v;
	}
	,expr: function(e) {
		switch(e[1]) {
		case 0:
			var c = e[2];
			switch(c[1]) {
			case 0:
				var v = c[2];
				var o = new gscript.typesystem.GSNumber(v);
				o.initMethods();
				return o;
			case 1:
				var f = c[2];
				var o1 = new gscript.typesystem.GSNumber(f);
				o1.initMethods();
				return o1;
			case 2:
				var s = c[2];
				var o2 = new gscript.typesystem.GSString(s);
				o2.initMethods();
				return o2;
			}
			break;
		case 1:
			var id = e[2];
			return this.resolve(id);
		case 2:
			var e1 = e[4];
			var n = e[2];
			this.declared.push({ n : n, old : this.locals.get(n)});
			var value = { r : e1 == null?null:this.expr(e1)};
			this.locals.set(n,value);
			return null;
		case 3:
			var e2 = e[2];
			return this.expr(e2);
		case 4:
			var exprs = e[2];
			var old = this.declared.length;
			var v1 = null;
			var _g = 0;
			while(_g < exprs.length) {
				var e3 = exprs[_g];
				++_g;
				v1 = this.expr(e3);
			}
			this.restore(old);
			return v1;
		case 5:
			var f1 = e[3];
			var e4 = e[2];
			return this.expr(e4).__getattr__(new gscript.typesystem.GSString(f1));
		case 6:
			var e21 = e[3];
			var e5 = e[2];
			var obj = this.expr(e5);
			var ref = null;
			switch(e21[1]) {
			case 1:
				var id1 = e21[2];
				ref = new gscript.typesystem.GSString(id1);
				ref.initMethods();
				break;
			default:
				ref = this.expr(e21);
			}
			if(!(typeof(obj) == "boolean" || obj == null)) {
				var pointerAccess = Reflect.getProperty(obj,"__pget__");
				return pointerAccess.apply(obj,[ref]);
			} else {
				throw "TypeError: Cannot use pointer operator on Boolean or Null values";
				return null;
			}
			break;
		case 7:
			var e22 = e[4];
			var e11 = e[3];
			var op = e[2];
			var fop = this.binops.get(op);
			if(fop == null) throw gscript.Error.EInvalidOp(op);
			return fop(e11,e22);
		case 8:
			var e6 = e[4];
			var prefix = e[3];
			var op1 = e[2];
			switch(op1) {
			case "!":
				var obj1 = this.expr(e6);
				if(obj1 == null || obj1 == true || obj1 == false) return obj1 != true; else {
					var method = Reflect.getProperty(obj1,"__invert__");
					return method.apply(obj1,[]);
				}
				break;
			case "-":
				return -this.expr(e6);
			case "++":
				return this.increment(e6,prefix,1);
			case "--":
				return this.increment(e6,prefix,-1);
			case "~":
				return ~this.expr(e6);
			case "&":
				var obj2 = this.expr(e6);
				return new gscript.typesystem.GSPointer(obj2,this);
			case "*":
				var obj3 = this.expr(e6);
				if(gscript.typesystem.TypeSystem.basictype(obj3) != "GSPointer") throw "InvalidOp \"*\":  Cannot dereference " + Std.string(obj3);
				return obj3.address;
			default:
				throw gscript.Error.EInvalidOp(op1);
			}
			break;
		case 9:
			var params = e[3];
			var e7 = e[2];
			var args = new Array();
			var _g1 = 0;
			while(_g1 < params.length) {
				var p = params[_g1];
				++_g1;
				args.push(this.expr(p));
			}
			switch(e7[1]) {
			case 5:
				var f2 = e7[3];
				var e8 = e7[2];
				var obj4 = this.expr(e8);
				var method1 = obj4.__getattr__(new gscript.typesystem.GSString(f2));
				if(method1 != null) return method1.__invoke__(args); else throw "TypeError: Invalid call to " + Std.string(e8) + " -> " + f2;
				break;
			case 17:
				var index = e7[3];
				var e9 = e7[2];
				var obj5 = this.expr(e9);
				if(obj5 == null) throw gscript.Error.EInvalidAccess(Std.string(this.expr(index)));
				this.fcall(obj5,this.expr(index),args);
				break;
			default:
				return this.expr(e7).__invoke__(args);
			}
			break;
		case 10:
			var e23 = e[4];
			var e12 = e[3];
			var econd = e[2];
			if(this.expr(econd) == true) return this.expr(e12); else if(e23 == null) return null; else return this.expr(e23);
			break;
		case 11:
			var e10 = e[3];
			var econd1 = e[2];
			this.whileLoop(econd1,e10);
			return null;
		case 12:
			var e13 = e[4];
			var it = e[3];
			var v2 = e[2];
			this.forLoop(v2,it,e13);
			return null;
		case 13:
			throw gscript._Interp.Stop.SBreak;
			break;
		case 14:
			throw gscript._Interp.Stop.SContinue;
			break;
		case 16:
			var e14 = e[2];
			throw gscript._Interp.Stop.SReturn(e14 == null?null:this.expr(e14));
			break;
		case 15:
			var name = e[4];
			var fexpr = e[3];
			var params1 = e[2];
			var capturedLocals = this.duplicate(this.locals);
			var me = this;
			var funcName = null;
			if(name != null) funcName = new gscript.typesystem.GSString(name);
			var f3 = new gscript.typesystem.GSFunction(false,funcName,fexpr,params1,me,capturedLocals);
			if(name != null) this.variables.set(name,f3);
			return f3;
		case 18:
			var arr = e[2];
			var a = new gscript.typesystem.GSArray();
			a.initMethods();
			var _g2 = 0;
			while(_g2 < arr.length) {
				var e15 = arr[_g2];
				++_g2;
				a.push(this.expr(e15));
			}
			return a;
		case 17:
			var index1 = e[3];
			var e16 = e[2];
			return this.expr(e16).__getitem__(this.expr(index1));
		case 19:
			var params2 = e[3];
			var cl = e[2];
			var a1 = new Array();
			var _g3 = 0;
			while(_g3 < params2.length) {
				var e17 = params2[_g3];
				++_g3;
				a1.push(this.expr(e17));
			}
			return this.cnew(cl,a1);
		case 20:
			var e18 = e[2];
			switch(e18[1]) {
			case 1:
				var id2 = e18[2];
				var obj6 = this.expr(e18);
				try {
					return obj6.__delete__();
				} catch( error ) {
					if( js.Boot.__instanceof(error,String) ) {
						return false;
					} else throw(error);
				}
				break;
			case 5:
				var f4 = e18[3];
				var o3 = e18[2];
				var obj7 = this.expr(o3);
				try {
					return obj7.__deleteattr__(f4);
				} catch( error1 ) {
					if( js.Boot.__instanceof(error1,String) ) {
						return false;
					} else throw(error1);
				}
				break;
			case 17:
				var i = e18[3];
				var a2 = e18[2];
				var array = this.expr(a2);
				var index2 = this.expr(i);
				try {
					return array.__deleteitem__(index2);
				} catch( error2 ) {
					if( js.Boot.__instanceof(error2,String) ) {
						return false;
					} else throw(error2);
				}
				break;
			default:
				throw "Unexpected " + Std.string(e18);
			}
			break;
		case 21:
			var e19 = e[2];
			throw this.expr(e19);
			break;
		case 22:
			var ecatch = e[5];
			var n1 = e[3];
			var e20 = e[2];
			var old1 = this.declared.length;
			try {
				var v3 = this.expr(e20);
				this.restore(old1);
				return v3;
			} catch( $e0 ) {
				if( js.Boot.__instanceof($e0,gscript._Interp.Stop) ) {
					var err = $e0;
					throw err;
				} else {
				var err1 = $e0;
				this.restore(old1);
				this.declared.push({ n : n1, old : this.locals.get(n1)});
				this.locals.set(n1,{ r : err1});
				var v4 = this.expr(ecatch);
				this.restore(old1);
				return v4;
				}
			}
			break;
		case 23:
			var fl = e[2];
			var o4 = new gscript.typesystem.GSObject();
			o4.initMethods();
			var _g4 = 0;
			while(_g4 < fl.length) {
				var f5 = fl[_g4];
				++_g4;
				o4.__setitem__(new gscript.typesystem.GSString(f5.name),this.expr(f5.e));
			}
			return o4;
		case 24:
			var e24 = e[4];
			var e110 = e[3];
			var econd2 = e[2];
			if(this.expr(econd2) == true) return this.expr(e110); else return this.expr(e24);
			break;
		}
		return null;
	}
	,whileLoop: function(econd,e) {
		var old = this.declared.length;
		try {
			while(this.expr(econd) == true) try {
				this.expr(e);
			} catch( err ) {
				if( js.Boot.__instanceof(err,gscript._Interp.Stop) ) {
					switch(err[1]) {
					case 1:
						break;
					case 0:
						throw "__break__";
						break;
					case 2:
						throw err;
						break;
					}
				} else throw(err);
			}
		} catch( e ) { if( e != "__break__" ) throw e; }
		this.restore(old);
	}
	,makeIterator: function(v) {
		try {
			v = v.__iter__();
		} catch( error ) {
			if( js.Boot.__instanceof(error,String) ) {
				throw gscript.Error.EInvalidIterator(v);
			} else throw(error);
		}
		if(v.hasNext == null || v.next == null) throw gscript.Error.EInvalidIterator(v);
		return v;
	}
	,forLoop: function(n,it,e) {
		var old = this.declared.length;
		this.declared.push({ n : n, old : this.locals.get(n)});
		var it1 = this.makeIterator(this.expr(it));
		try {
			while(it1.hasNext()) {
				var value = { r : it1.next()};
				this.locals.set(n,value);
				try {
					this.expr(e);
				} catch( err ) {
					if( js.Boot.__instanceof(err,gscript._Interp.Stop) ) {
						switch(err[1]) {
						case 1:
							break;
						case 0:
							throw "__break__";
							break;
						case 2:
							throw err;
							break;
						}
					} else throw(err);
				}
			}
		} catch( e ) { if( e != "__break__" ) throw e; }
		this.restore(old);
	}
	,callable: function(o,f) {
		var field = null;
		if(f != null) field = o.__getattr__(new gscript.typesystem.GSString(f)); else if(o == null) return false;
		field = o;
		if(field == null) field = Reflect.getProperty(o,f);
		if(field == null) return false; else if(Reflect.isFunction(field) || gscript.typesystem.TypeSystem.basictype(field) == "GSFunction") return true; else return this.callable(field,"__call__");
	}
	,constructible: function(o) {
		return this.callable(o,"__create__");
	}
	,get: function(o,f) {
		if(o == null) throw gscript.Error.EInvalidAccess(f);
		var res = o.__getattr__(new gscript.typesystem.GSString(f));
		if(res == null) res = Reflect.getProperty(o,f);
		return res;
	}
	,set: function(o,f,v) {
		if(o == null) throw gscript.Error.EInvalidAccess(f);
		o[f] = v;
		return v;
	}
	,fcall: function(o,f,args) {
		return o.__callmethod__(new gscript.typesystem.GSString(f),args);
	}
	,cnew: function(cl,args) {
		var klass = this.variables.get(cl);
		if(klass == null) {
			var l = this.locals.get(cl);
			if(l != null) klass = l.r;
		}
		if(klass == null) {
			var e = new gscript.Parser().parseString(cl);
			var obj = this.expr(e);
			if(obj != null) klass = obj;
		}
		if(klass == null) throw "ReferenceError: " + cl + " is undefined";
		if(klass.__getattr__(new gscript.typesystem.GSString("__create__")) != null) {
			var constructor = klass.__getattr__(new gscript.typesystem.GSString("__create__"));
			return constructor.__invoke__(args);
		}
		return null;
	}
	,__class__: gscript.Interp
};
gscript.Token = $hxClasses["gscript.Token"] = { __ename__ : ["gscript","Token"], __constructs__ : ["TEof","TConst","TId","TOp","TPOpen","TPClose","TBrOpen","TBrClose","TDot","TArrow","TComma","TSemicolon","TBkOpen","TBkClose","TQuestion","TDoubleDot"] };
gscript.Token.TEof = ["TEof",0];
gscript.Token.TEof.toString = $estr;
gscript.Token.TEof.__enum__ = gscript.Token;
gscript.Token.TConst = function(c) { var $x = ["TConst",1,c]; $x.__enum__ = gscript.Token; $x.toString = $estr; return $x; };
gscript.Token.TId = function(s) { var $x = ["TId",2,s]; $x.__enum__ = gscript.Token; $x.toString = $estr; return $x; };
gscript.Token.TOp = function(s) { var $x = ["TOp",3,s]; $x.__enum__ = gscript.Token; $x.toString = $estr; return $x; };
gscript.Token.TPOpen = ["TPOpen",4];
gscript.Token.TPOpen.toString = $estr;
gscript.Token.TPOpen.__enum__ = gscript.Token;
gscript.Token.TPClose = ["TPClose",5];
gscript.Token.TPClose.toString = $estr;
gscript.Token.TPClose.__enum__ = gscript.Token;
gscript.Token.TBrOpen = ["TBrOpen",6];
gscript.Token.TBrOpen.toString = $estr;
gscript.Token.TBrOpen.__enum__ = gscript.Token;
gscript.Token.TBrClose = ["TBrClose",7];
gscript.Token.TBrClose.toString = $estr;
gscript.Token.TBrClose.__enum__ = gscript.Token;
gscript.Token.TDot = ["TDot",8];
gscript.Token.TDot.toString = $estr;
gscript.Token.TDot.__enum__ = gscript.Token;
gscript.Token.TArrow = ["TArrow",9];
gscript.Token.TArrow.toString = $estr;
gscript.Token.TArrow.__enum__ = gscript.Token;
gscript.Token.TComma = ["TComma",10];
gscript.Token.TComma.toString = $estr;
gscript.Token.TComma.__enum__ = gscript.Token;
gscript.Token.TSemicolon = ["TSemicolon",11];
gscript.Token.TSemicolon.toString = $estr;
gscript.Token.TSemicolon.__enum__ = gscript.Token;
gscript.Token.TBkOpen = ["TBkOpen",12];
gscript.Token.TBkOpen.toString = $estr;
gscript.Token.TBkOpen.__enum__ = gscript.Token;
gscript.Token.TBkClose = ["TBkClose",13];
gscript.Token.TBkClose.toString = $estr;
gscript.Token.TBkClose.__enum__ = gscript.Token;
gscript.Token.TQuestion = ["TQuestion",14];
gscript.Token.TQuestion.toString = $estr;
gscript.Token.TQuestion.__enum__ = gscript.Token;
gscript.Token.TDoubleDot = ["TDoubleDot",15];
gscript.Token.TDoubleDot.toString = $estr;
gscript.Token.TDoubleDot.__enum__ = gscript.Token;
gscript.Parser = function() {
	this.line = 1;
	this.opChars = "+*/-=!><&|^%~";
	this.identChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
	var priorities = [["%"],["*","/"],["+","-"],["<<",">>",">>>"],["|","&","^"],["==","!=",">","<",">=","<="],["..."],["&&"],["||"],["=","+=","-=","*=","/=","%=","<<=",">>=",">>>=","|=","&=","^="]];
	this.opPriority = new haxe.ds.StringMap();
	this.opRightAssoc = new haxe.ds.StringMap();
	this.unops = new haxe.ds.StringMap();
	var _g1 = 0;
	var _g = priorities.length;
	while(_g1 < _g) {
		var i = _g1++;
		var _g2 = 0;
		var _g3 = priorities[i];
		while(_g2 < _g3.length) {
			var x = _g3[_g2];
			++_g2;
			this.opPriority.set(x,i);
			if(i == 9) this.opRightAssoc.set(x,true);
		}
	}
	var _g4 = 0;
	var _g11 = ["!","++","--","-","~","&","*"];
	while(_g4 < _g11.length) {
		var x1 = _g11[_g4];
		++_g4;
		this.unops.set(x1,x1 == "++" || x1 == "--");
	}
};
$hxClasses["gscript.Parser"] = gscript.Parser;
gscript.Parser.__name__ = ["gscript","Parser"];
gscript.Parser.prototype = {
	error: function(err,pmin,pmax) {
		throw err;
	}
	,invalidChar: function(c) {
		this.error(gscript.Error.EInvalidChar(c),0,0);
	}
	,parseString: function(s) {
		this.line = 1;
		return this.parse(new haxe.io.StringInput(s));
	}
	,parse: function(s) {
		this.tokens = new haxe.ds.GenericStack();
		this["char"] = -1;
		this.input = s;
		this.ops = new Array();
		this.idents = new Array();
		var _g1 = 0;
		var _g = this.opChars.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.ops[HxOverrides.cca(this.opChars,i)] = true;
		}
		var _g11 = 0;
		var _g2 = this.identChars.length;
		while(_g11 < _g2) {
			var i1 = _g11++;
			this.idents[HxOverrides.cca(this.identChars,i1)] = true;
		}
		var a = new Array();
		while(true) {
			var tk = this.token();
			if(tk == gscript.Token.TEof) break;
			this.tokens.add(tk);
			a.push(this.parseFullExpr());
		}
		if(a.length == 1) return a[0]; else return this.mk(gscript.Expr.EBlock(a),0,null);
	}
	,unexpected: function(tk) {
		this.error(gscript.Error.EUnexpected(this.tokenString(tk)),0,0);
		return null;
	}
	,push: function(tk) {
		this.tokens.add(tk);
	}
	,ensure: function(tk) {
		var t = this.token();
		if(t != tk) this.unexpected(t);
	}
	,expr: function(e) {
		return e;
	}
	,pmin: function(e) {
		return 0;
	}
	,pmax: function(e) {
		return 0;
	}
	,mk: function(e,pmin,pmax) {
		return e;
	}
	,isBlock: function(e) {
		switch(e[1]) {
		case 4:case 23:
			return true;
		case 15:
			var e1 = e[3];
			return this.isBlock(e1);
		case 2:
			var e2 = e[4];
			return e2 != null && this.isBlock(e2);
		case 10:
			var e21 = e[4];
			var e11 = e[3];
			if(e21 != null) return this.isBlock(e21); else return this.isBlock(e11);
			break;
		case 7:
			var e3 = e[4];
			return this.isBlock(e3);
		case 8:
			var e4 = e[4];
			var prefix = e[3];
			return !prefix && this.isBlock(e4);
		case 11:
			var e5 = e[3];
			return this.isBlock(e5);
		case 12:
			var e6 = e[4];
			return this.isBlock(e6);
		case 16:
			var e7 = e[2];
			return e7 != null && this.isBlock(e7);
		default:
			return false;
		}
	}
	,parseFullExpr: function() {
		var e = this.parseExpr();
		var tk = this.token();
		if(tk != gscript.Token.TSemicolon && tk != gscript.Token.TEof) {
			if(this.isBlock(e)) this.tokens.add(tk); else this.unexpected(tk);
		}
		return e;
	}
	,parseObject: function(p1) {
		var fl = new Array();
		try {
			while(true) {
				var tk = this.token();
				var id = null;
				switch(tk[1]) {
				case 2:
					var i = tk[2];
					id = i;
					break;
				case 1:
					var c = tk[2];
					if(!this.allowJSON) this.unexpected(tk);
					switch(c[1]) {
					case 2:
						var s = c[2];
						id = s;
						break;
					default:
						this.unexpected(tk);
					}
					break;
				case 7:
					throw "__break__";
					break;
				default:
					this.unexpected(tk);
				}
				this.ensure(gscript.Token.TDoubleDot);
				fl.push({ name : id, e : this.parseExpr()});
				tk = this.token();
				switch(tk[1]) {
				case 7:
					throw "__break__";
					break;
				case 10:
					break;
				default:
					this.unexpected(tk);
				}
			}
		} catch( e ) { if( e != "__break__" ) throw e; }
		return this.parseExprNext(this.mk(gscript.Expr.EObject(fl),p1,null));
	}
	,parseExpr: function() {
		var tk = this.token();
		switch(tk[1]) {
		case 2:
			var id = tk[2];
			var e = this.parseStructure(id);
			if(e == null) e = this.mk(gscript.Expr.EIdent(id),null,null);
			return this.parseExprNext(e);
		case 1:
			var c = tk[2];
			return this.parseExprNext(this.mk(gscript.Expr.EConst(c),null,null));
		case 4:
			var e1 = this.parseExpr();
			this.ensure(gscript.Token.TPClose);
			return this.parseExprNext(this.mk(gscript.Expr.EParent(e1),0,0));
		case 6:
			tk = this.token();
			switch(tk[1]) {
			case 7:
				return this.parseExprNext(this.mk(gscript.Expr.EObject([]),0,null));
			case 2:
				var tk2 = this.token();
				this.tokens.add(tk2);
				this.tokens.add(tk);
				switch(tk2[1]) {
				case 15:
					return this.parseExprNext(this.parseObject(0));
				default:
				}
				break;
			case 1:
				var c1 = tk[2];
				if(this.allowJSON) switch(c1[1]) {
				case 2:
					var tk21 = this.token();
					this.tokens.add(tk21);
					this.tokens.add(tk);
					switch(tk21[1]) {
					case 15:
						return this.parseExprNext(this.parseObject(0));
					default:
					}
					break;
				default:
					this.tokens.add(tk);
				} else this.tokens.add(tk);
				break;
			default:
				this.tokens.add(tk);
			}
			var a = new Array();
			while(true) {
				a.push(this.parseFullExpr());
				tk = this.token();
				if(tk == gscript.Token.TBrClose) break;
				this.tokens.add(tk);
			}
			return this.mk(gscript.Expr.EBlock(a),0,null);
		case 3:
			var op = tk[2];
			if(this.unops.exists(op)) return this.makeUnop(op,this.parseExpr());
			return this.unexpected(tk);
		case 12:
			var a1 = new Array();
			tk = this.token();
			while(tk != gscript.Token.TBkClose) {
				this.tokens.add(tk);
				a1.push(this.parseExpr());
				tk = this.token();
				if(tk == gscript.Token.TComma) tk = this.token();
			}
			return this.parseExprNext(this.mk(gscript.Expr.EArrayDecl(a1),0,null));
		default:
			return this.unexpected(tk);
		}
	}
	,makeUnop: function(op,e) {
		switch(e[1]) {
		case 7:
			var e2 = e[4];
			var e1 = e[3];
			var bop = e[2];
			return this.mk(gscript.Expr.EBinop(bop,this.makeUnop(op,e1),e2),0,0);
		case 24:
			var e3 = e[4];
			var e21 = e[3];
			var e11 = e[2];
			return this.mk(gscript.Expr.ETernary(this.makeUnop(op,e11),e21,e3),0,0);
		default:
			return this.mk(gscript.Expr.EUnop(op,true,e),0,0);
		}
	}
	,makeBinop: function(op,e1,e) {
		switch(e[1]) {
		case 7:
			var e3 = e[4];
			var e2 = e[3];
			var op2 = e[2];
			if(this.opPriority.get(op) <= this.opPriority.get(op2) && !this.opRightAssoc.exists(op)) return this.mk(gscript.Expr.EBinop(op2,this.makeBinop(op,e1,e2),e3),0,0); else return this.mk(gscript.Expr.EBinop(op,e1,e),0,0);
			break;
		case 24:
			var e4 = e[4];
			var e31 = e[3];
			var e21 = e[2];
			if(this.opRightAssoc.exists(op)) return this.mk(gscript.Expr.EBinop(op,e1,e),0,0); else return this.mk(gscript.Expr.ETernary(this.makeBinop(op,e1,e21),e31,e4),0,0);
			break;
		default:
			return this.mk(gscript.Expr.EBinop(op,e1,e),0,0);
		}
	}
	,parseStructure: function(id) {
		switch(id) {
		case "if":
			var cond = this.parseExpr();
			var e1 = this.parseExpr();
			var e2 = null;
			var semic = false;
			var tk = this.token();
			if(tk == gscript.Token.TSemicolon) {
				semic = true;
				tk = this.token();
			}
			if(Type.enumEq(tk,gscript.Token.TId("else"))) e2 = this.parseExpr(); else {
				this.tokens.add(tk);
				if(semic) this.tokens.add(gscript.Token.TSemicolon);
			}
			return this.mk(gscript.Expr.EIf(cond,e1,e2),0,e2 == null?0:0);
		case "var":
			var tk1 = this.token();
			var ident = null;
			switch(tk1[1]) {
			case 2:
				var id1 = tk1[2];
				ident = id1;
				break;
			default:
				this.unexpected(tk1);
			}
			tk1 = this.token();
			var t = null;
			if(tk1 == gscript.Token.TDoubleDot && this.allowTypes) {
				t = this.parseType();
				tk1 = this.token();
			}
			var e = null;
			if(Type.enumEq(tk1,gscript.Token.TOp("="))) e = this.parseExpr(); else this.tokens.add(tk1);
			return this.mk(gscript.Expr.EVar(ident,t,e),0,e == null?0:0);
		case "while":
			var econd = this.parseExpr();
			var e3 = this.parseExpr();
			return this.mk(gscript.Expr.EWhile(econd,e3),0,0);
		case "for":
			this.ensure(gscript.Token.TPOpen);
			var tk2 = this.token();
			var vname = null;
			switch(tk2[1]) {
			case 2:
				var id2 = tk2[2];
				vname = id2;
				break;
			default:
				this.unexpected(tk2);
			}
			tk2 = this.token();
			if(!Type.enumEq(tk2,gscript.Token.TId("in"))) this.unexpected(tk2);
			var eiter = this.parseExpr();
			this.ensure(gscript.Token.TPClose);
			var e4 = this.parseExpr();
			return this.mk(gscript.Expr.EFor(vname,eiter,e4),0,0);
		case "break":
			return gscript.Expr.EBreak;
		case "continue":
			return gscript.Expr.EContinue;
		case "else":
			return this.unexpected(gscript.Token.TId(id));
		case "function":
			var tk3 = this.token();
			var name = null;
			switch(tk3[1]) {
			case 2:
				var id3 = tk3[2];
				name = id3;
				break;
			default:
				this.tokens.add(tk3);
			}
			this.ensure(gscript.Token.TPOpen);
			var args = new Array();
			tk3 = this.token();
			if(tk3 != gscript.Token.TPClose) {
				var arg = true;
				while(arg) {
					var name1 = null;
					switch(tk3[1]) {
					case 2:
						var id4 = tk3[2];
						name1 = id4;
						break;
					default:
						this.unexpected(tk3);
					}
					tk3 = this.token();
					var t1 = null;
					if(tk3 == gscript.Token.TDoubleDot && this.allowTypes) {
						t1 = this.parseType();
						tk3 = this.token();
					}
					args.push({ name : name1, t : t1});
					switch(tk3[1]) {
					case 10:
						tk3 = this.token();
						break;
					case 5:
						arg = false;
						break;
					default:
						this.unexpected(tk3);
					}
				}
			}
			var ret = null;
			if(this.allowTypes) {
				tk3 = this.token();
				if(tk3 != gscript.Token.TDoubleDot) this.tokens.add(tk3); else ret = this.parseType();
			}
			var body = this.parseExpr();
			return this.mk(gscript.Expr.EFunction(args,body,name,ret),0,0);
		case "return":
			var tk4 = this.token();
			this.tokens.add(tk4);
			var e5;
			if(tk4 == gscript.Token.TSemicolon) e5 = null; else e5 = this.parseExpr();
			return this.mk(gscript.Expr.EReturn(e5),0,e5 == null?0:0);
		case "new":
			var a = new Array();
			var tk5 = this.token();
			switch(tk5[1]) {
			case 2:
				var id5 = tk5[2];
				a.push(id5);
				break;
			default:
				this.unexpected(tk5);
			}
			var next = true;
			while(next) {
				tk5 = this.token();
				switch(tk5[1]) {
				case 8:
					tk5 = this.token();
					switch(tk5[1]) {
					case 2:
						var id6 = tk5[2];
						a.push(id6);
						break;
					default:
						this.unexpected(tk5);
					}
					break;
				case 4:
					next = false;
					break;
				default:
					this.unexpected(tk5);
				}
			}
			var args1 = this.parseExprList(gscript.Token.TPClose);
			return this.mk(gscript.Expr.ENew(a.join("."),args1),0,null);
		case "delete":
			var tk6 = this.token();
			this.tokens.add(tk6);
			var e6;
			if(tk6 == gscript.Token.TSemicolon) e6 = null; else e6 = this.parseExpr();
			return this.mk(gscript.Expr.EDelete(e6),0,e6 == null?0:0);
		case "throw":
			var e7 = this.parseExpr();
			return this.mk(gscript.Expr.EThrow(e7),0,0);
		case "try":
			var e8 = this.parseExpr();
			var tk7 = this.token();
			if(!Type.enumEq(tk7,gscript.Token.TId("catch"))) this.unexpected(tk7);
			this.ensure(gscript.Token.TPOpen);
			tk7 = this.token();
			var vname1;
			switch(tk7[1]) {
			case 2:
				var id7 = tk7[2];
				vname1 = id7;
				break;
			default:
				vname1 = this.unexpected(tk7);
			}
			this.ensure(gscript.Token.TDoubleDot);
			var t2 = null;
			if(this.allowTypes) t2 = this.parseType(); else {
				tk7 = this.token();
				if(!Type.enumEq(tk7,gscript.Token.TId("Dynamic"))) this.unexpected(tk7);
			}
			this.ensure(gscript.Token.TPClose);
			var ec = this.parseExpr();
			return this.mk(gscript.Expr.ETry(e8,vname1,t2,ec),0,0);
		default:
			return null;
		}
	}
	,parseExprNext: function(e1) {
		var tk = this.token();
		switch(tk[1]) {
		case 3:
			var op = tk[2];
			if(this.unops.get(op)) {
				if(this.isBlock(e1) || (function($this) {
					var $r;
					switch(e1[1]) {
					case 3:
						$r = true;
						break;
					default:
						$r = false;
					}
					return $r;
				}(this))) {
					this.tokens.add(tk);
					return e1;
				}
				return this.parseExprNext(this.mk(gscript.Expr.EUnop(op,false,e1),0,null));
			}
			return this.makeBinop(op,e1,this.parseExpr());
		case 8:
			tk = this.token();
			var field = null;
			switch(tk[1]) {
			case 2:
				var id = tk[2];
				field = id;
				break;
			default:
				this.unexpected(tk);
			}
			return this.parseExprNext(this.mk(gscript.Expr.EField(e1,field),0,null));
		case 9:
			var ref = null;
			tk = this.token();
			switch(tk[1]) {
			case 1:
				var c = tk[2];
				ref = gscript.Expr.EConst(c);
				break;
			case 2:
				var id1 = tk[2];
				ref = gscript.Expr.EIdent(id1);
				break;
			default:
				this.unexpected(tk);
			}
			return this.parseExprNext(this.mk(gscript.Expr.ERefAccess(e1,ref),0,null));
		case 4:
			return this.parseExprNext(this.mk(gscript.Expr.ECall(e1,this.parseExprList(gscript.Token.TPClose)),0,null));
		case 12:
			var e2 = this.parseExpr();
			this.ensure(gscript.Token.TBkClose);
			return this.parseExprNext(this.mk(gscript.Expr.EArray(e1,e2),0,null));
		case 14:
			var e21 = this.parseExpr();
			this.ensure(gscript.Token.TDoubleDot);
			var e3 = this.parseExpr();
			return this.mk(gscript.Expr.ETernary(e1,e21,e3),0,0);
		default:
			this.tokens.add(tk);
			return e1;
		}
	}
	,parseType: function() {
		var t = this.token();
		switch(t[1]) {
		case 2:
			var v = t[2];
			var path = [v];
			while(true) {
				t = this.token();
				if(t != gscript.Token.TDot) break;
				t = this.token();
				switch(t[1]) {
				case 2:
					var v1 = t[2];
					path.push(v1);
					break;
				default:
					this.unexpected(t);
				}
			}
			var params = null;
			switch(t[1]) {
			case 3:
				var op = t[2];
				if(op == "<") {
					params = [];
					try {
						while(true) {
							params.push(this.parseType());
							t = this.token();
							switch(t[1]) {
							case 10:
								continue;
								break;
							case 3:
								var op1 = t[2];
								if(op1 == ">") throw "__break__";
								break;
							default:
							}
							this.unexpected(t);
						}
					} catch( e ) { if( e != "__break__" ) throw e; }
				}
				break;
			default:
				this.tokens.add(t);
			}
			return this.parseTypeNext(gscript.CType.CTPath(path,params));
		case 4:
			var t1 = this.parseType();
			this.ensure(gscript.Token.TPClose);
			return this.parseTypeNext(gscript.CType.CTParent(t1));
		case 6:
			var fields = [];
			try {
				while(true) {
					t = this.token();
					switch(t[1]) {
					case 7:
						throw "__break__";
						break;
					case 2:
						var name = t[2];
						this.ensure(gscript.Token.TDoubleDot);
						fields.push({ name : name, t : this.parseType()});
						t = this.token();
						switch(t[1]) {
						case 10:
							break;
						case 7:
							throw "__break__";
							break;
						default:
							this.unexpected(t);
						}
						break;
					default:
						this.unexpected(t);
					}
				}
			} catch( e ) { if( e != "__break__" ) throw e; }
			return this.parseTypeNext(gscript.CType.CTAnon(fields));
		default:
			return this.unexpected(t);
		}
	}
	,parseTypeNext: function(t) {
		var tk = this.token();
		switch(tk[1]) {
		case 3:
			var op = tk[2];
			if(op != "->") {
				this.tokens.add(tk);
				return t;
			}
			break;
		default:
			this.tokens.add(tk);
			return t;
		}
		var t2 = this.parseType();
		switch(t2[1]) {
		case 1:
			var args = t2[2];
			args.unshift(t);
			return t2;
		default:
			return gscript.CType.CTFun([t],t2);
		}
	}
	,parseExprList: function(etk) {
		var args = new Array();
		var tk = this.token();
		if(tk == etk) return args;
		this.tokens.add(tk);
		try {
			while(true) {
				args.push(this.parseExpr());
				tk = this.token();
				switch(tk[1]) {
				case 10:
					break;
				default:
					if(tk == etk) throw "__break__";
					this.unexpected(tk);
				}
			}
		} catch( e ) { if( e != "__break__" ) throw e; }
		return args;
	}
	,incPos: function() {
	}
	,readChar: function() {
		try {
			return this.input.readByte();
		} catch( e ) {
			return 0;
		}
	}
	,readString: function(until) {
		var c = 0;
		var b = new haxe.io.BytesOutput();
		var esc = false;
		var old = this.line;
		var s = this.input;
		while(true) {
			try {
				c = s.readByte();
			} catch( e ) {
				this.line = old;
				throw gscript.Error.EUnterminatedString;
			}
			if(esc) {
				esc = false;
				switch(c) {
				case 110:
					b.writeByte(10);
					break;
				case 114:
					b.writeByte(13);
					break;
				case 116:
					b.writeByte(9);
					break;
				case 39:case 34:case 92:
					b.writeByte(c);
					break;
				case 47:
					if(this.allowJSON) b.writeByte(c); else this.invalidChar(c);
					break;
				case 117:
					if(!this.allowJSON) throw this.invalidChar(c);
					var code = null;
					try {
						code = s.readString(4);
					} catch( e1 ) {
						this.line = old;
						throw gscript.Error.EUnterminatedString;
					}
					var k = 0;
					var _g = 0;
					while(_g < 4) {
						var i = _g++;
						k <<= 4;
						var $char = HxOverrides.cca(code,i);
						switch($char) {
						case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:
							k += $char - 48;
							break;
						case 65:case 66:case 67:case 68:case 69:case 70:
							k += $char - 55;
							break;
						case 97:case 98:case 99:case 100:case 101:case 102:
							k += $char - 87;
							break;
						default:
							this.invalidChar($char);
						}
					}
					if(k <= 127) b.writeByte(k); else if(k <= 2047) {
						b.writeByte(192 | k >> 6);
						b.writeByte(128 | k & 63);
					} else {
						b.writeByte(224 | k >> 12);
						b.writeByte(128 | k >> 6 & 63);
						b.writeByte(128 | k & 63);
					}
					break;
				default:
					this.invalidChar(c);
				}
			} else if(c == 92) esc = true; else if(c == until) break; else {
				if(c == 10) this.line++;
				b.writeByte(c);
			}
		}
		return b.getBytes().toString();
	}
	,token: function() {
		if(!(this.tokens.head == null)) return this.tokens.pop();
		var $char;
		if(this["char"] < 0) $char = this.readChar(); else {
			$char = this["char"];
			this["char"] = -1;
		}
		while(true) {
			switch($char) {
			case 0:
				return gscript.Token.TEof;
			case 32:case 9:case 13:
				break;
			case 10:
				this.line++;
				break;
			case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:
				var n = ($char - 48) * 1.0;
				var exp = 0.;
				while(true) {
					$char = this.readChar();
					exp *= 10;
					switch($char) {
					case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:
						n = n * 10 + ($char - 48);
						break;
					case 46:
						if(exp > 0) {
							if(exp == 10 && this.readChar() == 46) {
								this.push(gscript.Token.TOp("..."));
								var i = n | 0;
								return gscript.Token.TConst(i == n?gscript.Const.CInt(i):gscript.Const.CFloat(n));
							}
							this.invalidChar($char);
						}
						exp = 1.;
						break;
					case 120:
						if(n > 0 || exp > 0) this.invalidChar($char);
						var n1 = 0;
						while(true) {
							$char = this.readChar();
							switch($char) {
							case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:
								n1 = (n1 << 4) + $char - 48;
								break;
							case 65:case 66:case 67:case 68:case 69:case 70:
								n1 = (n1 << 4) + ($char - 55);
								break;
							case 97:case 98:case 99:case 100:case 101:case 102:
								n1 = (n1 << 4) + ($char - 87);
								break;
							default:
								this["char"] = $char;
								return gscript.Token.TConst(gscript.Const.CInt(n1));
							}
						}
						break;
					default:
						this["char"] = $char;
						var i1 = n | 0;
						return gscript.Token.TConst(exp > 0?gscript.Const.CFloat(n * 10 / exp):i1 == n?gscript.Const.CInt(i1):gscript.Const.CFloat(n));
					}
				}
				break;
			case 59:
				return gscript.Token.TSemicolon;
			case 40:
				return gscript.Token.TPOpen;
			case 41:
				return gscript.Token.TPClose;
			case 44:
				return gscript.Token.TComma;
			case 45:
				$char = this.readChar();
				switch($char) {
				case 62:
					return gscript.Token.TArrow;
				default:
					this["char"] = $char;
					return gscript.Token.TOp("-");
				}
				break;
			case 46:
				$char = this.readChar();
				switch($char) {
				case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:
					var n2 = $char - 48;
					var exp1 = 1;
					while(true) {
						$char = this.readChar();
						exp1 *= 10;
						switch($char) {
						case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:
							n2 = n2 * 10 + ($char - 48);
							break;
						default:
							this["char"] = $char;
							return gscript.Token.TConst(gscript.Const.CFloat(n2 / exp1));
						}
					}
					break;
				case 46:
					$char = this.readChar();
					if($char != 46) this.invalidChar($char);
					return gscript.Token.TOp("...");
				default:
					this["char"] = $char;
					return gscript.Token.TDot;
				}
				break;
			case 123:
				return gscript.Token.TBrOpen;
			case 125:
				return gscript.Token.TBrClose;
			case 91:
				return gscript.Token.TBkOpen;
			case 93:
				return gscript.Token.TBkClose;
			case 39:
				return gscript.Token.TConst(gscript.Const.CString(this.readString(39)));
			case 34:
				return gscript.Token.TConst(gscript.Const.CString(this.readString(34)));
			case 63:
				return gscript.Token.TQuestion;
			case 58:
				return gscript.Token.TDoubleDot;
			default:
				if(this.ops[$char]) {
					var op = String.fromCharCode($char);
					while(true) {
						$char = this.readChar();
						if(!this.ops[$char]) {
							if(HxOverrides.cca(op,0) == 47) return this.tokenComment(op,$char);
							this["char"] = $char;
							return gscript.Token.TOp(op);
						}
						op += String.fromCharCode($char);
					}
				}
				if(this.idents[$char]) {
					var id = String.fromCharCode($char);
					while(true) {
						$char = this.readChar();
						if(!this.idents[$char]) {
							this["char"] = $char;
							return gscript.Token.TId(id);
						}
						id += String.fromCharCode($char);
					}
				}
				this.invalidChar($char);
			}
			$char = this.readChar();
		}
		return null;
	}
	,tokenComment: function(op,$char) {
		var c = HxOverrides.cca(op,1);
		var s = this.input;
		if(c == 47) {
			try {
				while($char != 10 && $char != 13) $char = s.readByte();
				this["char"] = $char;
			} catch( e ) {
			}
			return this.token();
		}
		if(c == 42) {
			var old = this.line;
			try {
				while(true) {
					while($char != 42) {
						if($char == 10) this.line++;
						$char = s.readByte();
					}
					$char = s.readByte();
					if($char == 47) break;
				}
			} catch( e1 ) {
				this.line = old;
				throw gscript.Error.EUnterminatedComment;
			}
			return this.token();
		}
		this["char"] = $char;
		return gscript.Token.TOp(op);
	}
	,constString: function(c) {
		switch(c[1]) {
		case 0:
			var v = c[2];
			if(v == null) return "null"; else return "" + v;
			break;
		case 1:
			var f = c[2];
			if(f == null) return "null"; else return "" + f;
			break;
		case 2:
			var s = c[2];
			return s;
		}
	}
	,tokenString: function(t) {
		switch(t[1]) {
		case 0:
			return "<eof>";
		case 1:
			var c = t[2];
			return this.constString(c);
		case 2:
			var s = t[2];
			return s;
		case 3:
			var s1 = t[2];
			return s1;
		case 4:
			return "(";
		case 5:
			return ")";
		case 6:
			return "{";
		case 7:
			return "}";
		case 8:
			return ".";
		case 9:
			return "->";
		case 10:
			return ",";
		case 11:
			return ";";
		case 12:
			return "[";
		case 13:
			return "]";
		case 14:
			return "?";
		case 15:
			return ":";
		}
	}
	,__class__: gscript.Parser
};
gscript.typesystem = {};
gscript.typesystem.GSObject = function() {
	this.__props__ = new gscript.typesystem.NativeMap();
	this.keyList = new Array();
	this.type = "object";
	this.value = "";
};
$hxClasses["gscript.typesystem.GSObject"] = gscript.typesystem.GSObject;
gscript.typesystem.GSObject.__name__ = ["gscript","typesystem","GSObject"];
gscript.typesystem.GSObject.prototype = {
	initMethods: function() {
		var exposedMethods = ["__setitem__","__getitem__","__setattr__","__getattr__","__invert__","__add__","__sub__","__mul__","__div__","__mod__","__eq__","__ne__","__lt__","__gt__","__le__","__ge__","__iadd__","__isub__","__imul__","__idiv__","__imod__"];
		var _g = 0;
		while(_g < exposedMethods.length) {
			var name = exposedMethods[_g];
			++_g;
			var method = Reflect.getProperty(this,name);
			this.exposeMethod(name,method);
		}
	}
	,keys: function() {
		return HxOverrides.iter(this.keyList);
	}
	,__pget__: function(key) {
		var pointerGetter = this.__getattr__(new gscript.typesystem.GSString("__pget__"));
		if(pointerGetter == null) throw "TypeError:  Cannot use pointer operator on '" + this.type + "' objects"; else return pointerGetter.__invoke__([key]);
	}
	,__pset__: function(key,value) {
		var pointerSetter = this.__getattr__(new gscript.typesystem.GSString("__pset__"));
		if(pointerSetter == null) throw "TypeError:  Cannot use pointer operator on '" + this.type + "' objects"; else pointerSetter.__invoke__([key,value]);
	}
	,__setitem__: function(key,value) {
		var realKey = key.toString();
		this.__props__.set(realKey,{ v : value});
		this.keyList.push(key);
	}
	,__getitem__: function(key) {
		var realKey = Std.string(key);
		var prop = this.__props__.get(realKey);
		if(prop == null) return null; else return prop.v;
	}
	,__setattr__: function(key,value) {
		this.__setitem__(key,value);
	}
	,__getattr__: function(key) {
		return this.__getitem__(key);
	}
	,__delete__: function() {
		var del = this.__getattr__(new gscript.typesystem.GSString("__delete__"));
		if(del == null) return; else del.__invoke__([]);
	}
	,__deleteitem__: function(key) {
		var had = this.__getitem__(key) != null;
		var realKey = JSON.stringify(key);
		this.__props__.remove(realKey);
		return had;
	}
	,__deleteattr__: function(key) {
		return this.__props__.remove(key);
	}
	,__iter__: function() {
		var _this;
		var _g = [];
		var $it0 = this.__props__.iterator();
		while( $it0.hasNext() ) {
			var entry = $it0.next();
			_g.push(entry.v);
		}
		_this = _g;
		return HxOverrides.iter(_this);
	}
	,__invoke__: function(args) {
		var func = this.__getattr__(new gscript.typesystem.GSString("__call__"));
		if(func == null) throw "TypeError: " + Std.string(this) + " cannot be called.";
		var type = gscript.typesystem.TypeSystem.basictype(func);
		if(type == "GSFunction") return (js.Boot.__cast(func , gscript.typesystem.GSFunction)).__call__(args); else throw "TypeError: Could not call " + Std.string(func) + ".";
	}
	,__callmethod__: function(methodName,args) {
		var key = methodName.toString();
		if(this.__getattr__(methodName) != null) {
			var method = this.__getattr__(methodName);
			if(gscript.typesystem.TypeSystem.basictype(method) == "GSFunction") {
				method = js.Boot.__cast(method , gscript.typesystem.GSFunction);
				return method.__call__(args);
			} else throw "TypeError: Objects of type " + Std.string(method.type) + " are not callable.";
		} else throw "NameError: " + Std.string(this) + " has no method " + Std.string(methodName);
	}
	,__str__: function() {
		var repr = { };
		var $it0 = this.keys();
		while( $it0.hasNext() ) {
			var key = $it0.next();
			Reflect.setProperty(repr,key.toString(),this.__getitem__(key) != null?this.__getitem__(key).toString():null);
		}
		return new gscript.typesystem.GSString(JSON.stringify(repr));
	}
	,__bool__: function() {
		return true;
	}
	,__invert__: function() {
		return this;
	}
	,__add__: function(other) {
		var result = new gscript.typesystem.GSObject();
		result.__iadd__(this);
		result.__iadd__(other);
		return result;
	}
	,__sub__: function(other) {
		var result = new gscript.typesystem.GSObject();
		result.__iadd__(this);
		result.__isub__(other);
		return result;
	}
	,__mul__: function(other) {
		return null;
	}
	,__div__: function(other) {
		return null;
	}
	,__mod__: function(other) {
		return null;
	}
	,__lshift__: function(other) {
		return null;
	}
	,__rshift__: function(other) {
		return null;
	}
	,__and__: function(other) {
		return null;
	}
	,__or__: function(other) {
		return null;
	}
	,__land__: function(other) {
		return null;
	}
	,__lor__: function(other) {
		return null;
	}
	,__eq__: function(other) {
		return this == other;
	}
	,__ne__: function(other) {
		return this != other;
	}
	,__lt__: function(other) {
		return this.__props__.keyList.length < other.__props__.keyList.length;
	}
	,__gt__: function(other) {
		return this.__props__.keyList.length > other.__props__.keyList.length;
	}
	,__le__: function(other) {
		return this.__props__.keyList.length <= other.__props__.keyList.length;
	}
	,__ge__: function(other) {
		return this.__props__.keyList.length >= other.__props__.keyList.length;
	}
	,__iadd__: function(other) {
		var $it0 = other.keys();
		while( $it0.hasNext() ) {
			var key = $it0.next();
			if(this.__getitem__(key) == null) this.__setitem__(key,other.__getitem__(key));
		}
	}
	,__isub__: function(other) {
		var $it0 = other.keys();
		while( $it0.hasNext() ) {
			var key = $it0.next();
			if(this.__getitem__(key) != null) this.__deleteitem__(key);
		}
	}
	,__imul__: function(other) {
		throw "TypeError: cannot use \"*\" operator on objects of type " + this.type;
	}
	,__idiv__: function(other) {
		throw "TypeError: cannot use \"/\" operator on objects of type " + this.type;
	}
	,__imod__: function(other) {
		throw "TypeError: cannot use \"%\" operator on objects of type " + this.type;
	}
	,toString: function() {
		return this.__str__().value;
	}
	,expose: function(name,f) {
		var method = new gscript.typesystem.GSFunction(true,f);
		this.__props__.set(name,{ v : method});
	}
	,exposeMethod: function(name,f) {
		var me = this;
		var method = function(data) {
			return f.apply(me,data.args);
		};
		this.expose(name,method);
	}
	,__class__: gscript.typesystem.GSObject
};
gscript.gsbind = {};
gscript.gsbind.BoundObject = function(obj) {
	gscript.typesystem.GSObject.call(this);
	this.target = obj;
	this.type = "object";
	this.initMethods();
};
$hxClasses["gscript.gsbind.BoundObject"] = gscript.gsbind.BoundObject;
gscript.gsbind.BoundObject.__name__ = ["gscript","gsbind","BoundObject"];
gscript.gsbind.BoundObject.__super__ = gscript.typesystem.GSObject;
gscript.gsbind.BoundObject.prototype = $extend(gscript.typesystem.GSObject.prototype,{
	__getattr__: function(k) {
		var key = Std.string(k);
		var prop = Reflect.getProperty(this.target,key);
		if(prop != null) return gscript.gsbind.GryffinBind.fromNative(prop); else return gscript.typesystem.GSObject.prototype.__getattr__.call(this,k);
	}
	,__setattr__: function(k,v) {
		var key = Std.string(k);
		var value = gscript.gsbind.GryffinBind.toNative(v);
		Reflect.setProperty(this.target,key,value);
	}
	,__class__: gscript.gsbind.BoundObject
});
gscript.gsbind.BoundClass = function(obj) {
	gscript.gsbind.BoundObject.call(this,obj);
};
$hxClasses["gscript.gsbind.BoundClass"] = gscript.gsbind.BoundClass;
gscript.gsbind.BoundClass.__name__ = ["gscript","gsbind","BoundClass"];
gscript.gsbind.BoundClass.__super__ = gscript.gsbind.BoundObject;
gscript.gsbind.BoundClass.prototype = $extend(gscript.gsbind.BoundObject.prototype,{
	initMethods: function() {
		var me = this;
		this.expose("__create__",function(data) {
			return me.__create__(data.args);
		});
	}
	,__create__: function(args) {
		var list = gscript.typesystem.GSArray.fromArray(args);
		var nativeArgs = gscript.gsbind.GryffinBind.toNative(list);
		haxe.Log.trace(nativeArgs,{ fileName : "BoundClass.hx", lineNumber : 22, className : "gscript.gsbind.BoundClass", methodName : "__create__"});
		var instance = Type.createInstance(this.target,nativeArgs);
		haxe.Log.trace(instance,{ fileName : "BoundClass.hx", lineNumber : 24, className : "gscript.gsbind.BoundClass", methodName : "__create__"});
		return gscript.gsbind.GryffinBind.fromNative(instance);
	}
	,__class__: gscript.gsbind.BoundClass
});
gscript.gsbind.GryffinBind = function() { };
$hxClasses["gscript.gsbind.GryffinBind"] = gscript.gsbind.GryffinBind;
gscript.gsbind.GryffinBind.__name__ = ["gscript","gsbind","GryffinBind"];
gscript.gsbind.GryffinBind.fromNative = function(obj) {
	var type = gscript.typesystem.TypeSystem.basictype(obj);
	switch(type) {
	case "Null":case "Bool":
		return obj;
	case "Int":case "Float":
		return new gscript.typesystem.GSNumber(obj);
	case "String":
		return new gscript.typesystem.GSString(obj);
	case "Array":
		return gscript.typesystem.GSArray.fromArray((function($this) {
			var $r;
			var _g = [];
			{
				var _g1 = 0;
				var _g2;
				_g2 = js.Boot.__cast(obj , Array);
				while(_g1 < _g2.length) {
					var x = _g2[_g1];
					++_g1;
					_g.push(gscript.gsbind.GryffinBind.fromNative(x));
				}
			}
			$r = _g;
			return $r;
		}(this)));
	case "Function":
		return new gscript.typesystem.GSFunction(true,function(data) {
			var nativeArgs;
			var _g3 = [];
			var _g11 = 0;
			var _g21;
			_g21 = js.Boot.__cast(data.args , Array);
			while(_g11 < _g21.length) {
				var x1 = _g21[_g11];
				++_g11;
				_g3.push(gscript.gsbind.GryffinBind.toNative(x1));
			}
			nativeArgs = _g3;
			var retVal = obj.apply(null,nativeArgs);
			return gscript.gsbind.GryffinBind.fromNative(retVal);
		});
	default:
		if(Reflect.isObject(obj)) return new gscript.gsbind.BoundObject(obj); else throw "TypeError: Cannot bind objects of type " + type + " to the GryffinScript type system.";
	}
};
gscript.gsbind.GryffinBind.toNative = function(obj) {
	var type = gscript.typesystem.TypeSystem.basictype(obj);
	switch(type) {
	case "Null":
		return null;
	case "Bool":
		return obj;
	case "GSString":case "GSNumber":
		return obj.value;
	case "GSArray":
		var _g = [];
		var _g1 = 0;
		var _g2;
		_g2 = js.Boot.__cast(obj.items , Array);
		while(_g1 < _g2.length) {
			var item = _g2[_g1];
			++_g1;
			_g.push(gscript.gsbind.GryffinBind.toNative(item));
		}
		return _g;
	case "GSObject":
		var result = { };
		var keys = obj.__props__.keys();
		while( keys.hasNext() ) {
			var key = keys.next();
			var value = obj.__props__.get(key).v;
			Reflect.setProperty(result,key,gscript.gsbind.GryffinBind.toNative(value));
		}
		return result;
	case "GSFunction":
		return Reflect.makeVarArgs(function(args) {
			var gsArgs;
			var _g3 = [];
			var _g11 = 0;
			while(_g11 < args.length) {
				var x = args[_g11];
				++_g11;
				_g3.push(gscript.gsbind.GryffinBind.fromNative(x));
			}
			gsArgs = _g3;
			var retVal = obj.__invoke__(gsArgs);
			return gscript.gsbind.GryffinBind.toNative(retVal);
		});
	case "BoundObject":
		return gscript.gsbind.GryffinBind.toNative(obj.target);
	case "GSPointer":
		return gscript.gsbind.GryffinBind.toNative(obj.address);
	case "GSNativePointer":
		return obj.address;
	default:
		throw "TypeError: Cannot unbind object of type " + type + " from the GryffinScript type system";
		return null;
	}
};
gscript.gsbind.GryffinBind.bindObject = function(obj) {
	return new gscript.gsbind.BoundObject(obj);
};
gscript.gsbind.GryffinBind.bindClass = function(obj) {
	return new gscript.gsbind.BoundClass(obj);
};
gscript.gsbind.GryffinBind.parseArgs = function(args,types) {
	var newArgs = [];
	var _g1 = 0;
	var _g = args.length;
	while(_g1 < _g) {
		var i = _g1++;
		var arg = args[i];
		var dtype = types[i];
		newArgs.push(gscript.gsbind.GryffinBind.convertTo(arg,dtype));
	}
	return newArgs;
};
gscript.gsbind.GryffinBind.convertTo = function(obj,dtype) {
	var check = gscript.gsbind.GryffinBind.parseTypeChecker(dtype);
	var $native = dtype.charAt(0).toUpperCase() == dtype.charAt(0);
	if(check(obj)) if($native) return gscript.gsbind.GryffinBind.fromNative(obj); else return gscript.gsbind.GryffinBind.toNative(obj); else throw "TypeError: Expected '" + dtype + "', got " + Std.string(obj);
};
gscript.gsbind.GryffinBind.checkType = function(obj,type) {
	if(obj == null) return type == "null"; else if(obj == true || obj == false) return type == "bool" || type == "Bool"; else if(Reflect.getProperty(obj,"type") != null) return obj.type == type; else return gscript.typesystem.TypeSystem.basictype(obj) == type;
};
gscript.gsbind.GryffinBind.parseTypeChecker = function(dtype) {
	var gryffinMode = dtype.charAt(0).toUpperCase() != dtype.charAt(0);
	if(dtype.indexOf("|") != -1) {
		var acceptibleTypes = dtype.split("|");
		var checks;
		var _g = [];
		var _g1 = 0;
		while(_g1 < acceptibleTypes.length) {
			var t = acceptibleTypes[_g1];
			++_g1;
			_g.push(gscript.gsbind.GryffinBind.parseTypeChecker(t));
		}
		checks = _g;
		return function(x) {
			var _g11 = 0;
			while(_g11 < checks.length) {
				var f = checks[_g11];
				++_g11;
				if(!f(x)) return false;
			}
			return true;
		};
	} else if(dtype.indexOf("<") != -1) {
		var childType = dtype.substring(dtype.indexOf("<"),dtype.lastIndexOf(">") + 1);
		var mainType = dtype.substring(0,dtype.indexOf("<") - 1);
		var checkChild = gscript.gsbind.GryffinBind.parseTypeChecker(childType);
		return function(obj) {
			var iter;
			if(Reflect.getProperty(obj,"iterator") != null) iter = Reflect.getProperty(obj,"iterator"); else if(Reflect.getProperty(obj,"__iter__") != null) iter = Reflect.getProperty(obj,"__iter__"); else throw "TypeError:  No iterator found.";
			if(gscript.gsbind.GryffinBind.checkType(obj,mainType)) {
				var $it0 = iter();
				while( $it0.hasNext() ) {
					var x1 = $it0.next();
					if(!checkChild(x1)) return false;
				}
				return true;
			} else return false;
		};
	} else return function(obj1) {
		return gscript.gsbind.GryffinBind.checkType(obj1,dtype);
	};
};
gscript.gsbind.GryffinBind.invalidArg = function(arg,desiredType) {
	throw "TypeError: Expected '" + desiredType + "', got " + Std.string(arg);
};
gscript.typesystem.GSArray = function() {
	gscript.typesystem.GSObject.call(this);
	this.type = "array";
	this.items = new Array();
	this.initMethods();
};
$hxClasses["gscript.typesystem.GSArray"] = gscript.typesystem.GSArray;
gscript.typesystem.GSArray.__name__ = ["gscript","typesystem","GSArray"];
gscript.typesystem.GSArray.fromArray = function(list) {
	var result = new gscript.typesystem.GSArray();
	var _g = 0;
	while(_g < list.length) {
		var item = list[_g];
		++_g;
		result.push(item);
	}
	return result;
};
gscript.typesystem.GSArray.__super__ = gscript.typesystem.GSObject;
gscript.typesystem.GSArray.prototype = $extend(gscript.typesystem.GSObject.prototype,{
	initMethods: function() {
		var exposedMethods = ["push","pop","join","reverse","slice"];
		var _g = 0;
		while(_g < exposedMethods.length) {
			var name = exposedMethods[_g];
			++_g;
			this.exposeMethod(name,Reflect.getProperty(this,name));
		}
	}
	,__getitem__: function(key) {
		var realKey = key.toString();
		if(key.type == "number") {
			var index = Math.round(key.value);
			return this.items[index];
		} else {
			var acceptedValues = ["length"];
			if(Lambda.has(acceptedValues,realKey)) switch(realKey) {
			case "length":
				return new gscript.typesystem.GSNumber(this.items.length);
			default:
				return null;
			} else return gscript.typesystem.GSObject.prototype.__getitem__.call(this,key);
		}
	}
	,__setitem__: function(key,value) {
		if(key.type == "number") {
			var index = 0;
			if(gscript.typesystem.TypeSystem.basictype(key.value) == "Int") index = Math.round(key.value); else throw "IndexError: Array indexes must be integers.";
			this.items[index] = value;
		} else this.__setattr__(key,value);
	}
	,__iter__: function() {
		return HxOverrides.iter(this.items);
	}
	,__str__: function() {
		var repr;
		var _g = [];
		var _g1 = 0;
		var _g2 = this.items;
		while(_g1 < _g2.length) {
			var item = _g2[_g1];
			++_g1;
			_g.push(Std.string(item));
		}
		repr = _g;
		return new gscript.typesystem.GSString(JSON.stringify(repr));
	}
	,push: function(item) {
		this.items.push(item);
	}
	,pop: function() {
		return this.items.pop();
	}
	,join: function(joiner) {
		var sep;
		sep = js.Boot.__cast(joiner.value , String);
		var string = this.items.join(sep);
		return new gscript.typesystem.GSString(string);
	}
	,reverse: function() {
		var copy = this.items.slice();
		copy.reverse();
		return gscript.typesystem.GSArray.fromArray(copy);
	}
	,slice: function(si,ei) {
		return gscript.typesystem.GSArray.fromArray(this.items.slice(si,ei));
	}
	,__mul__: function(other) {
		if(other.type == "number") {
			var multiplied = this.items.slice();
			var _g1 = 0;
			var _g = other.value;
			while(_g1 < _g) {
				var x = _g1++;
				multiplied = multiplied.concat(this.items.slice());
			}
			var result = new gscript.typesystem.GSArray();
			var _g2 = 0;
			while(_g2 < multiplied.length) {
				var x1 = multiplied[_g2];
				++_g2;
				result.push(x1);
			}
			return result;
		} else return null;
	}
	,__class__: gscript.typesystem.GSArray
});
gscript.typesystem.GSFunction = function($native,value,body,params,env,scope) {
	gscript.typesystem.GSObject.call(this);
	this["native"] = $native;
	if(this["native"]) this.func = value; else {
		if(body == null || params == null || env == null || scope == null) throw "TypeError: Cannot initialize function without a link to the interpreter.";
		if(value != null) this.name = js.Boot.__cast(value , gscript.typesystem.GSString); else this.name = null;
		this.body = body;
		this.parameters = params;
		this.environment = env;
		this.scope = scope;
	}
	this.defaultThisValue = null;
	this.type = "function";
	this.__prototype__ = new gscript.typesystem.GSObject();
};
$hxClasses["gscript.typesystem.GSFunction"] = gscript.typesystem.GSFunction;
gscript.typesystem.GSFunction.__name__ = ["gscript","typesystem","GSFunction"];
gscript.typesystem.GSFunction.__super__ = gscript.typesystem.GSObject;
gscript.typesystem.GSFunction.prototype = $extend(gscript.typesystem.GSObject.prototype,{
	__call__: function(args,thisValue) {
		var myArgs = args.slice();
		var self = this.defaultThisValue;
		if(thisValue != null) self = thisValue;
		if(!this["native"]) {
			var params = this.parameters;
			var me = this.environment;
			var old = me.locals;
			me.locals = me.duplicate(this.scope);
			var argumentVariable = new gscript.typesystem.GSArray();
			var _g = 0;
			while(_g < args.length) {
				var arg = args[_g];
				++_g;
				argumentVariable.push(arg);
			}
			me.locals.set("arguments",{ r : argumentVariable});
			me.locals.set("this",{ r : self});
			var _g1 = 0;
			var _g2 = this.parameters.length;
			while(_g1 < _g2) {
				var i = _g1++;
				me.locals.set(params[i].name,{ r : args[i]});
			}
			var r = null;
			try {
				r = me.exprReturn(this.body);
			} catch( e ) {
				me.locals = old;
				throw e;
			}
			me.locals = old;
			return r;
		} else {
			var invokationData = { self : self, args : myArgs};
			return this.func.apply(null,[invokationData]);
		}
	}
	,dump: function() {
		var data = { body : this.body, params : this.parameters, scope : this.scope, thisValue : this.defaultThisValue};
		var serializer = new haxe.Serializer();
		serializer.useEnumIndex = true;
		serializer.useCache = true;
		serializer.serialize(data);
		var string = serializer.toString();
		return new gscript.typesystem.GSString(string);
	}
	,clone: function() {
		if(this["native"]) return this; else return new gscript.typesystem.GSFunction(false,this.name,this.body,this.parameters,this.environment,this.environment.duplicate(this.scope));
	}
	,bind: function(owner) {
		var copy = this.clone();
		copy.defaultThisValue = owner;
		return copy;
	}
	,__getattr__: function(key) {
		var me = this;
		if(key.type == "string") {
			var _g = key.toString();
			switch(_g) {
			case "bind":
				return new gscript.typesystem.GSFunction(true,function(data) {
					return $bind(me,me.bind).apply(me,data.args);
				});
			case "apply":
				return new gscript.typesystem.GSFunction(true,function(data1) {
					var theThisValue;
					theThisValue = js.Boot.__cast(data1.args[0] , gscript.typesystem.GSObject);
					var theArguments;
					var _g1 = [];
					var $it0 = (js.Boot.__cast(data1.args[1] , gscript.typesystem.GSArray)).__iter__();
					while( $it0.hasNext() ) {
						var item = $it0.next();
						_g1.push(item);
					}
					theArguments = _g1;
					return me.__call__(theArguments,theThisValue);
				});
			case "clone":
				return new gscript.typesystem.GSFunction(true,function(data2) {
					return me.clone();
				});
			case "dump":
				return new gscript.typesystem.GSFunction(true,function(data3) {
					return me.dump();
				});
			case "__call__":
				return new gscript.typesystem.GSFunction(true,function(data4) {
					return me.__call__(data4.args,data4.self);
				});
			case "__create__":
				return new gscript.typesystem.GSFunction(true,function(data5) {
					return me.__create__(data5.args);
				});
			case "prototype":
				return this.__prototype__;
			default:
				return gscript.typesystem.GSObject.prototype.__getattr__.call(this,key);
			}
		} else throw "TypeError: Function attribute keys can only be strings";
	}
	,__setattr__: function(keyObj,value) {
		var key = keyObj.toString();
		switch(key) {
		case "prototype":
			if(value.type == "object") this.__prototype__ = value;
			break;
		default:
			gscript.typesystem.GSObject.prototype.__setattr__.call(this,keyObj,value);
		}
	}
	,__create__: function(args) {
		var self = new gscript.typesystem.GSObject();
		this.__call__(args,self);
		var $it0 = this.__prototype__.keys();
		while( $it0.hasNext() ) {
			var name = $it0.next();
			var prop = this.__prototype__.__getattr__(name);
			if(prop.type == "function") self.__setattr__(name,(js.Boot.__cast(prop , gscript.typesystem.GSFunction)).bind(self)); else self.__setattr__(name,prop);
		}
		return self;
	}
	,__class__: gscript.typesystem.GSFunction
});
gscript.typesystem.GSNativePointer = function(obj,env) {
	gscript.typesystem.GSObject.call(this);
	this.type = "pointer";
	this.address = obj;
	this.interp = env;
	this.methods = new haxe.ds.StringMap();
	this.fields = new haxe.ds.StringMap();
	this.getters = new haxe.ds.StringMap();
	this.setters = new haxe.ds.StringMap();
};
$hxClasses["gscript.typesystem.GSNativePointer"] = gscript.typesystem.GSNativePointer;
gscript.typesystem.GSNativePointer.__name__ = ["gscript","typesystem","GSNativePointer"];
gscript.typesystem.GSNativePointer.__super__ = gscript.typesystem.GSObject;
gscript.typesystem.GSNativePointer.prototype = $extend(gscript.typesystem.GSObject.prototype,{
	__pget__: function(k) {
		var me = this;
		var key = Std.string(k);
		var fieldType = this.fields.get(key);
		haxe.Log.trace(key,{ fileName : "GSNativePointer.hx", lineNumber : 28, className : "gscript.typesystem.GSNativePointer", methodName : "__pget__"});
		if(this.getters.exists(key)) return (this.getters.get(key))(""); else {
			haxe.Log.trace(key,{ fileName : "GSNativePointer.hx", lineNumber : 32, className : "gscript.typesystem.GSNativePointer", methodName : "__pget__"});
			if(fieldType != null) {
				var field = Reflect.getProperty(me.address,key);
				return gscript.gsbind.GryffinBind.convertTo(field,fieldType);
			} else {
				var methodSpec = this.methods.get(key);
				var method = Reflect.getProperty(me.address,key);
				if(methodSpec != null) return new gscript.typesystem.GSFunction(true,function(data) {
					var nargs = gscript.gsbind.GryffinBind.parseArgs(data.args,methodSpec.args);
					var ret = method.apply(me.address,nargs);
					if(methodSpec.ret != null) return gscript.gsbind.GryffinBind.convertTo(ret,methodSpec.ret); else return null;
				}); else return null;
			}
		}
	}
	,__pset__: function(k,v) {
		var me = this;
		var key = Std.string(k);
		if(this.setters.exists(key)) {
			var set = this.setters.get(key);
			set(k,v);
		} else if(this.fields.exists(key)) {
			var fieldType = this.fields.get(key);
			if(gscript.gsbind.GryffinBind.checkType(v,fieldType)) {
			}
		} else {
		}
	}
	,getter: function(name,get) {
		this.getters.set(name,get);
	}
	,setter: function(name,set) {
		this.setters.set(name,set);
	}
	,method: function(name,argTypes,returnType) {
		this.methods.set(name,{ args : argTypes, ret : returnType});
	}
	,field: function(name,type) {
		this.fields.set(name,type);
	}
	,toString: function() {
		var type = gscript.typesystem.TypeSystem.basictype(this.address);
		return "Pointer -> " + type + "[Native Code]";
	}
	,__class__: gscript.typesystem.GSNativePointer
});
gscript.typesystem.GSNumber = function(v) {
	gscript.typesystem.GSObject.call(this);
	this.type = "number";
	this.value = v;
};
$hxClasses["gscript.typesystem.GSNumber"] = gscript.typesystem.GSNumber;
gscript.typesystem.GSNumber.__name__ = ["gscript","typesystem","GSNumber"];
gscript.typesystem.GSNumber.__super__ = gscript.typesystem.GSObject;
gscript.typesystem.GSNumber.prototype = $extend(gscript.typesystem.GSObject.prototype,{
	__getitem__: function(key) {
		return null;
	}
	,__setitem__: function(key,value) {
		return;
	}
	,__add__: function(other) {
		if(!Reflect.isObject(other)) return null;
		if(other.type == "number") return new gscript.typesystem.GSNumber(this.value + other.value); else if(other.type == "string") return new gscript.typesystem.GSString(this.value + other.value); else {
			haxe.Log.trace(other,{ fileName : "GSNumber.hx", lineNumber : 24, className : "gscript.typesystem.GSNumber", methodName : "__add__"});
			return null;
		}
	}
	,__sub__: function(other) {
		if(!Reflect.isObject(other)) return null;
		if(other.type == "number") return new gscript.typesystem.GSNumber(this.value - other.value); else return null;
	}
	,__mul__: function(other) {
		if(!Reflect.isObject(other)) return null;
		if(other.type == "number") return new gscript.typesystem.GSNumber(this.value * other.value); else return null;
	}
	,__div__: function(other) {
		if(!Reflect.isObject(other)) return null;
		if(other.type == "number") return new gscript.typesystem.GSNumber(this.value / other.value); else return null;
	}
	,__mod__: function(other) {
		if(!Reflect.isObject(other)) return null;
		if(other.type == "number") return new gscript.typesystem.GSNumber(this.value % other.value); else return null;
	}
	,__iadd__: function(other) {
		if(!Reflect.isObject(other)) return;
		if(other.type == "number") this.value += other.value;
	}
	,__isub__: function(other) {
		if(!Reflect.isObject(other)) return;
		if(other.type == "number") this.value -= other.value;
	}
	,__imul__: function(other) {
		if(!Reflect.isObject(other)) return;
		if(other.type == "number") this.value *= other.value;
	}
	,__idiv__: function(other) {
		if(!Reflect.isObject(other)) return;
		if(other.type == "number") this.value /= other.value;
	}
	,__imod__: function(other) {
		if(!Reflect.isObject(other)) return;
		if(other.type == "number") this.value %= other.value;
	}
	,__eq__: function(other) {
		if(!Reflect.isObject(other)) return false;
		if(other.type != this.type) return false;
		return this.value == other.value;
	}
	,__ne__: function(other) {
		return !this.__eq__(other);
	}
	,__str__: function() {
		return new gscript.typesystem.GSString(Std.string(this.value) + "");
	}
	,__invert__: function() {
		return this.value < 0;
	}
	,__class__: gscript.typesystem.GSNumber
});
gscript.typesystem.GSPointer = function(to,scope) {
	gscript.typesystem.GSObject.call(this);
	this.type = "pointer";
	this.address = to;
	this.interp = scope;
	if(gscript.typesystem.TypeSystem.basictype(to) == "GSPointer") this.address = to.address;
};
$hxClasses["gscript.typesystem.GSPointer"] = gscript.typesystem.GSPointer;
gscript.typesystem.GSPointer.__name__ = ["gscript","typesystem","GSPointer"];
gscript.typesystem.GSPointer.__super__ = gscript.typesystem.GSObject;
gscript.typesystem.GSPointer.prototype = $extend(gscript.typesystem.GSObject.prototype,{
	__pget__: function(key) {
		var type = gscript.typesystem.TypeSystem.basictype(key);
		haxe.Log.trace(key,{ fileName : "GSPointer.hx", lineNumber : 18, className : "gscript.typesystem.GSPointer", methodName : "__pget__"});
		if(key.type == "string") return this.address.__getattr__(key); else if(key.type == "number") return this.address.__getitem__(key); else if(key.type == "pointer") return this.__pget__(key.address); else return gscript.typesystem.GSObject.prototype.__pget__.call(this,key);
	}
	,__pset__: function(key,value) {
		if(key.type == "string" || key.type == "number") {
			if(key.type == "string") this.address.__setattr__(key,value);
			if(key.type == "number") this.address.__setitem__(key,value);
		} else throw "TypeError: Pointer assignment field can only be strings or numbers";
	}
	,__reassign__: function(value) {
		var references = this.getReferences();
		var _g = 0;
		while(_g < references.length) {
			var reference = references[_g];
			++_g;
			var mem = this.interp.locals.get(reference);
			if(mem != null) mem.r = value; else {
				var value1 = value;
				this.interp.variables.set(reference,value1);
			}
		}
		this.address.__delete__();
		this.address = value;
	}
	,__delete__: function() {
		this.address.__delete__();
		var _g = 0;
		var _g1 = this.getReferences();
		while(_g < _g1.length) {
			var reference = _g1[_g];
			++_g;
			var wasLocal = this.interp.locals.remove(reference);
			if(!wasLocal) this.interp.variables.remove(reference);
		}
	}
	,toString: function() {
		return "Pointer -> " + Std.string(this.address);
	}
	,getReferences: function() {
		var references = [];
		var $it0 = this.interp.locals.keys();
		while( $it0.hasNext() ) {
			var k = $it0.next();
			var obj = this.interp.locals.get(k).r;
			if(obj == this.address) references.push(k);
		}
		var $it1 = this.interp.variables.keys();
		while( $it1.hasNext() ) {
			var k1 = $it1.next();
			var obj1 = this.interp.variables.get(k1);
			if(obj1 == this.address) references.push(k1);
		}
		return references;
	}
	,__class__: gscript.typesystem.GSPointer
});
gscript.typesystem.GSStream = function(read,write) {
	gscript.typesystem.GSObject.call(this);
	this.readFunction = read;
	this.writeFunction = write;
};
$hxClasses["gscript.typesystem.GSStream"] = gscript.typesystem.GSStream;
gscript.typesystem.GSStream.__name__ = ["gscript","typesystem","GSStream"];
gscript.typesystem.GSStream.__super__ = gscript.typesystem.GSObject;
gscript.typesystem.GSStream.prototype = $extend(gscript.typesystem.GSObject.prototype,{
	__lshift__: function(other) {
		this.readFunction(other);
		return null;
	}
	,__rshift__: function(other) {
		this.writeFunction(other);
		return null;
	}
	,__class__: gscript.typesystem.GSStream
});
gscript.typesystem.GSString = function(str) {
	gscript.typesystem.GSObject.call(this);
	if(gscript.typesystem.TypeSystem.basictype(str) != "String") throw "TypeError: Expected String, got " + gscript.typesystem.TypeSystem.basictype(str);
	this.type = "string";
	this.value = str;
};
$hxClasses["gscript.typesystem.GSString"] = gscript.typesystem.GSString;
gscript.typesystem.GSString.__name__ = ["gscript","typesystem","GSString"];
gscript.typesystem.GSString.__super__ = gscript.typesystem.GSObject;
gscript.typesystem.GSString.prototype = $extend(gscript.typesystem.GSObject.prototype,{
	charAt: function(index) {
		return new gscript.typesystem.GSString(this.value.charAt(index.value));
	}
	,charCodeAt: function(index) {
		return new gscript.typesystem.GSNumber(this.value.charCodeAt(index.value));
	}
	,indexOf: function(piece) {
		return new gscript.typesystem.GSNumber(this.value.indexOf(piece.value));
	}
	,split: function(piece) {
		var array;
		var _g = [];
		var _g1 = 0;
		var _g2;
		_g2 = js.Boot.__cast(this.value.split(piece.value) , Array);
		while(_g1 < _g2.length) {
			var x = _g2[_g1];
			++_g1;
			_g.push(new gscript.typesystem.GSString(x));
		}
		array = _g;
		var result = new gscript.typesystem.GSArray();
		var _g11 = 0;
		while(_g11 < array.length) {
			var x1 = array[_g11];
			++_g11;
			result.push(x1);
		}
		return result;
	}
	,replace: function(piece,$with) {
		var result = StringTools.replace(this.value,piece.toString(),$with.toString());
		return new gscript.typesystem.GSString(result);
	}
	,_format: function(array) {
		var text = this.value;
		var _g1 = 0;
		var _g = array.length;
		while(_g1 < _g) {
			var i = _g1++;
			var replO = array[i];
			if(replO == null) replO = new gscript.typesystem.GSString("");
			var repl = "";
			if($bind(replO,replO.toString) != null) repl = replO.toString();
			text = StringTools.replace(text,"{" + i + "}",repl);
		}
		return new gscript.typesystem.GSString(text);
	}
	,__getitem__: function(key) {
		if(key.type == "number") {
			var index = Math.round(key.value);
			var $char = this.value.charAt(index);
			if($char == null) return null; else return new gscript.typesystem.GSString($char);
		} else {
			var realKey = JSON.stringify(key);
			if(realKey == "length") return new gscript.typesystem.GSNumber(this.value.length); else return gscript.typesystem.GSObject.prototype.__getitem__.call(this,key);
		}
	}
	,initMethods: function() {
		var me = this;
		var exposedMethods = ["indexOf","split","replace","charAt","charCodeAt"];
		var _g = 0;
		while(_g < exposedMethods.length) {
			var name = exposedMethods[_g];
			++_g;
			this.exposeMethod(name,Reflect.getProperty(this,name));
		}
		this.expose("format",function(data) {
			return me._format(data.args);
		});
	}
	,__str__: function() {
		return this;
	}
	,__add__: function(other) {
		if(other.type == "string" || other.type == "number") return new gscript.typesystem.GSString(this.value + other.value); else {
			var val = other.__str__();
			return this.__add__(val);
		}
	}
	,__iadd__: function(other) {
		if(gscript.typesystem.TypeSystem.basictype(other) != "Null" && gscript.typesystem.TypeSystem.basictype(other) != "Bool" && Reflect.getProperty(other,"type") != null) {
			if(other.type == "string" || other.type == "number") this.value += other.value; else this.value += Std.string(other);
		}
	}
	,__div__: function(other) {
		if(other.type == "string") {
			var str = this.value.split(other.value);
			return new gscript.typesystem.GSString(str);
		} else return gscript.typesystem.GSObject.prototype.__div__.call(this,other);
	}
	,__mod__: function(other) {
		if(other.type == "array") {
			var list = [];
			var $it0 = other.__iter__();
			while( $it0.hasNext() ) {
				var x = $it0.next();
				list.push(x);
			}
			return this._format(list);
		} else return null;
	}
	,__eq__: function(other) {
		if(other.type != this.type) return false;
		return this.value == other.value;
	}
	,__ne__: function(other) {
		return !this.__eq__(other);
	}
	,__class__: gscript.typesystem.GSString
});
gscript.typesystem.NativeMap = function() {
	this.keyList = new Array();
	this.values = new Array();
};
$hxClasses["gscript.typesystem.NativeMap"] = gscript.typesystem.NativeMap;
gscript.typesystem.NativeMap.__name__ = ["gscript","typesystem","NativeMap"];
gscript.typesystem.NativeMap.prototype = {
	exists: function(key) {
		var i = Lambda.indexOf(this.keyList,key);
		if(i != -1) return true;
		return false;
	}
	,get: function(key) {
		var i = Lambda.indexOf(this.keyList,key);
		if(i != -1) return this.values[i];
		return null;
	}
	,set: function(key,value) {
		if(this.exists(key)) {
			var i = Lambda.indexOf(this.keyList,key);
			this.values[i] = value;
		} else {
			this.keyList.push(key);
			this.values.push(value);
		}
	}
	,remove: function(key) {
		var i = Lambda.indexOf(this.keyList,key);
		if(i != -1) {
			HxOverrides.remove(this.keyList,key);
			HxOverrides.remove(this.values,this.values[i]);
			return true;
		} else return false;
	}
	,iterator: function() {
		return HxOverrides.iter(this.values);
	}
	,keys: function() {
		return HxOverrides.iter(this.keyList);
	}
	,__class__: gscript.typesystem.NativeMap
};
gscript.typesystem.TypeSystem = function() { };
$hxClasses["gscript.typesystem.TypeSystem"] = gscript.typesystem.TypeSystem;
gscript.typesystem.TypeSystem.__name__ = ["gscript","typesystem","TypeSystem"];
gscript.typesystem.TypeSystem.basictype = function(obj) {
	switch(obj) {
	case "":
		return "String";
	default:
		if(Reflect.isObject(obj)) {
			var klass = Type.getClass(obj);
			if(klass == null) {
				if(Reflect.getProperty(obj,"__proto__") != null) {
					var proto = Reflect.getProperty(obj,"__proto__");
					if(Reflect.getProperty(proto,"constructor") != null) return Reflect.getProperty(proto,"constructor").name; else return "Object";
				} else try {
					return Type.getClassName(obj);
				} catch( error ) {
					if( js.Boot.__instanceof(error,String) ) {
						return "Object";
					} else throw(error);
				}
			}
			var klassName = Type.getClassName(klass);
			return klassName.substring(klassName.lastIndexOf(".") + 1);
		} else if(Reflect.getProperty(obj,"indexOf") != null) {
			if(Reflect.getProperty(obj,"join") != null) return "Array"; else return "String";
		} else if(Reflect.isFunction(obj)) return "Function"; else if(obj == null) return "Null"; else if(obj == true || obj == false) return "Bool";
		try {
			if(obj + 0 == obj) {
				var repr = Std.string(obj);
				if(repr.indexOf(".") == -1) return "Int"; else return "Float";
			}
		} catch( error1 ) {
			if( js.Boot.__instanceof(error1,String) ) {
				"nope";
			} else throw(error1);
		}
		return "Unknown";
	}
};
gscript.typesystem.TypeSystem.callable = function(o,f) {
	var obj = null;
	if(f != null) obj = o.__getattr__(new gscript.typesystem.GSString(f)); else obj = o;
	if(obj == null) return false;
	var callFunction = obj.__getattr__(new gscript.typesystem.GSString("__call__"));
	if(callFunction == null) return false;
	if(Reflect.isFunction(callFunction)) return true;
	return false;
};
var haxe = {};
haxe.Log = function() { };
$hxClasses["haxe.Log"] = haxe.Log;
haxe.Log.__name__ = ["haxe","Log"];
haxe.Log.trace = function(v,infos) {
	js.Boot.__trace(v,infos);
};
haxe.Serializer = function() {
	this.buf = new StringBuf();
	this.cache = new Array();
	this.useCache = haxe.Serializer.USE_CACHE;
	this.useEnumIndex = haxe.Serializer.USE_ENUM_INDEX;
	this.shash = new haxe.ds.StringMap();
	this.scount = 0;
};
$hxClasses["haxe.Serializer"] = haxe.Serializer;
haxe.Serializer.__name__ = ["haxe","Serializer"];
haxe.Serializer.prototype = {
	toString: function() {
		return this.buf.b;
	}
	,serializeString: function(s) {
		var x = this.shash.get(s);
		if(x != null) {
			this.buf.b += "R";
			if(x == null) this.buf.b += "null"; else this.buf.b += "" + x;
			return;
		}
		this.shash.set(s,this.scount++);
		this.buf.b += "y";
		s = encodeURIComponent(s);
		if(s.length == null) this.buf.b += "null"; else this.buf.b += "" + s.length;
		this.buf.b += ":";
		if(s == null) this.buf.b += "null"; else this.buf.b += "" + s;
	}
	,serializeRef: function(v) {
		var vt = typeof(v);
		var _g1 = 0;
		var _g = this.cache.length;
		while(_g1 < _g) {
			var i = _g1++;
			var ci = this.cache[i];
			if(typeof(ci) == vt && ci == v) {
				this.buf.b += "r";
				if(i == null) this.buf.b += "null"; else this.buf.b += "" + i;
				return true;
			}
		}
		this.cache.push(v);
		return false;
	}
	,serializeFields: function(v) {
		var _g = 0;
		var _g1 = Reflect.fields(v);
		while(_g < _g1.length) {
			var f = _g1[_g];
			++_g;
			this.serializeString(f);
			this.serialize(Reflect.field(v,f));
		}
		this.buf.b += "g";
	}
	,serialize: function(v) {
		{
			var _g = Type["typeof"](v);
			switch(_g[1]) {
			case 0:
				this.buf.b += "n";
				break;
			case 1:
				var v1 = v;
				if(v1 == 0) {
					this.buf.b += "z";
					return;
				}
				this.buf.b += "i";
				if(v1 == null) this.buf.b += "null"; else this.buf.b += "" + v1;
				break;
			case 2:
				var v2 = v;
				if(Math.isNaN(v2)) this.buf.b += "k"; else if(!Math.isFinite(v2)) if(v2 < 0) this.buf.b += "m"; else this.buf.b += "p"; else {
					this.buf.b += "d";
					if(v2 == null) this.buf.b += "null"; else this.buf.b += "" + v2;
				}
				break;
			case 3:
				if(v) this.buf.b += "t"; else this.buf.b += "f";
				break;
			case 6:
				var c = _g[2];
				if(c == String) {
					this.serializeString(v);
					return;
				}
				if(this.useCache && this.serializeRef(v)) return;
				switch(c) {
				case Array:
					var ucount = 0;
					this.buf.b += "a";
					var l = v.length;
					var _g1 = 0;
					while(_g1 < l) {
						var i = _g1++;
						if(v[i] == null) ucount++; else {
							if(ucount > 0) {
								if(ucount == 1) this.buf.b += "n"; else {
									this.buf.b += "u";
									if(ucount == null) this.buf.b += "null"; else this.buf.b += "" + ucount;
								}
								ucount = 0;
							}
							this.serialize(v[i]);
						}
					}
					if(ucount > 0) {
						if(ucount == 1) this.buf.b += "n"; else {
							this.buf.b += "u";
							if(ucount == null) this.buf.b += "null"; else this.buf.b += "" + ucount;
						}
					}
					this.buf.b += "h";
					break;
				case List:
					this.buf.b += "l";
					var v3 = v;
					var $it0 = v3.iterator();
					while( $it0.hasNext() ) {
						var i1 = $it0.next();
						this.serialize(i1);
					}
					this.buf.b += "h";
					break;
				case Date:
					var d = v;
					this.buf.b += "v";
					this.buf.add(HxOverrides.dateStr(d));
					break;
				case haxe.ds.StringMap:
					this.buf.b += "b";
					var v4 = v;
					var $it1 = v4.keys();
					while( $it1.hasNext() ) {
						var k = $it1.next();
						this.serializeString(k);
						this.serialize(v4.get(k));
					}
					this.buf.b += "h";
					break;
				case haxe.ds.IntMap:
					this.buf.b += "q";
					var v5 = v;
					var $it2 = v5.keys();
					while( $it2.hasNext() ) {
						var k1 = $it2.next();
						this.buf.b += ":";
						if(k1 == null) this.buf.b += "null"; else this.buf.b += "" + k1;
						this.serialize(v5.get(k1));
					}
					this.buf.b += "h";
					break;
				case haxe.ds.ObjectMap:
					this.buf.b += "M";
					var v6 = v;
					var $it3 = v6.keys();
					while( $it3.hasNext() ) {
						var k2 = $it3.next();
						var id = Reflect.field(k2,"__id__");
						Reflect.deleteField(k2,"__id__");
						this.serialize(k2);
						k2.__id__ = id;
						this.serialize(v6.h[k2.__id__]);
					}
					this.buf.b += "h";
					break;
				case haxe.io.Bytes:
					var v7 = v;
					var i2 = 0;
					var max = v7.length - 2;
					var charsBuf = new StringBuf();
					var b64 = haxe.Serializer.BASE64;
					while(i2 < max) {
						var b1 = v7.get(i2++);
						var b2 = v7.get(i2++);
						var b3 = v7.get(i2++);
						charsBuf.add(b64.charAt(b1 >> 2));
						charsBuf.add(b64.charAt((b1 << 4 | b2 >> 4) & 63));
						charsBuf.add(b64.charAt((b2 << 2 | b3 >> 6) & 63));
						charsBuf.add(b64.charAt(b3 & 63));
					}
					if(i2 == max) {
						var b11 = v7.get(i2++);
						var b21 = v7.get(i2++);
						charsBuf.add(b64.charAt(b11 >> 2));
						charsBuf.add(b64.charAt((b11 << 4 | b21 >> 4) & 63));
						charsBuf.add(b64.charAt(b21 << 2 & 63));
					} else if(i2 == max + 1) {
						var b12 = v7.get(i2++);
						charsBuf.add(b64.charAt(b12 >> 2));
						charsBuf.add(b64.charAt(b12 << 4 & 63));
					}
					var chars = charsBuf.b;
					this.buf.b += "s";
					if(chars.length == null) this.buf.b += "null"; else this.buf.b += "" + chars.length;
					this.buf.b += ":";
					if(chars == null) this.buf.b += "null"; else this.buf.b += "" + chars;
					break;
				default:
					if(this.useCache) this.cache.pop();
					if(v.hxSerialize != null) {
						this.buf.b += "C";
						this.serializeString(Type.getClassName(c));
						if(this.useCache) this.cache.push(v);
						v.hxSerialize(this);
						this.buf.b += "g";
					} else {
						this.buf.b += "c";
						this.serializeString(Type.getClassName(c));
						if(this.useCache) this.cache.push(v);
						this.serializeFields(v);
					}
				}
				break;
			case 4:
				if(this.useCache && this.serializeRef(v)) return;
				this.buf.b += "o";
				this.serializeFields(v);
				break;
			case 7:
				var e = _g[2];
				if(this.useCache) {
					if(this.serializeRef(v)) return;
					this.cache.pop();
				}
				if(this.useEnumIndex) this.buf.b += "j"; else this.buf.b += "w";
				this.serializeString(Type.getEnumName(e));
				if(this.useEnumIndex) {
					this.buf.b += ":";
					this.buf.b += Std.string(v[1]);
				} else this.serializeString(v[0]);
				this.buf.b += ":";
				var l1 = v.length;
				this.buf.b += Std.string(l1 - 2);
				var _g11 = 2;
				while(_g11 < l1) {
					var i3 = _g11++;
					this.serialize(v[i3]);
				}
				if(this.useCache) this.cache.push(v);
				break;
			case 5:
				throw "Cannot serialize function";
				break;
			default:
				throw "Cannot serialize " + Std.string(v);
			}
		}
	}
	,__class__: haxe.Serializer
};
haxe.ds = {};
haxe.ds.GenericCell = function(elt,next) {
	this.elt = elt;
	this.next = next;
};
$hxClasses["haxe.ds.GenericCell"] = haxe.ds.GenericCell;
haxe.ds.GenericCell.__name__ = ["haxe","ds","GenericCell"];
haxe.ds.GenericCell.prototype = {
	__class__: haxe.ds.GenericCell
};
haxe.ds.GenericStack = function() {
};
$hxClasses["haxe.ds.GenericStack"] = haxe.ds.GenericStack;
haxe.ds.GenericStack.__name__ = ["haxe","ds","GenericStack"];
haxe.ds.GenericStack.prototype = {
	add: function(item) {
		this.head = new haxe.ds.GenericCell(item,this.head);
	}
	,pop: function() {
		var k = this.head;
		if(k == null) return null; else {
			this.head = k.next;
			return k.elt;
		}
	}
	,__class__: haxe.ds.GenericStack
};
haxe.ds.IntMap = function() { };
$hxClasses["haxe.ds.IntMap"] = haxe.ds.IntMap;
haxe.ds.IntMap.__name__ = ["haxe","ds","IntMap"];
haxe.ds.IntMap.__interfaces__ = [IMap];
haxe.ds.IntMap.prototype = {
	set: function(key,value) {
		this.h[key] = value;
	}
	,get: function(key) {
		return this.h[key];
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key | 0);
		}
		return HxOverrides.iter(a);
	}
	,__class__: haxe.ds.IntMap
};
haxe.ds.ObjectMap = function() { };
$hxClasses["haxe.ds.ObjectMap"] = haxe.ds.ObjectMap;
haxe.ds.ObjectMap.__name__ = ["haxe","ds","ObjectMap"];
haxe.ds.ObjectMap.__interfaces__ = [IMap];
haxe.ds.ObjectMap.prototype = {
	set: function(key,value) {
		var id = key.__id__ || (key.__id__ = ++haxe.ds.ObjectMap.count);
		this.h[id] = value;
		this.h.__keys__[id] = key;
	}
	,get: function(key) {
		return this.h[key.__id__];
	}
	,keys: function() {
		var a = [];
		for( var key in this.h.__keys__ ) {
		if(this.h.hasOwnProperty(key)) a.push(this.h.__keys__[key]);
		}
		return HxOverrides.iter(a);
	}
	,__class__: haxe.ds.ObjectMap
};
haxe.ds.StringMap = function() {
	this.h = { };
};
$hxClasses["haxe.ds.StringMap"] = haxe.ds.StringMap;
haxe.ds.StringMap.__name__ = ["haxe","ds","StringMap"];
haxe.ds.StringMap.__interfaces__ = [IMap];
haxe.ds.StringMap.prototype = {
	set: function(key,value) {
		this.h["$" + key] = value;
	}
	,get: function(key) {
		return this.h["$" + key];
	}
	,exists: function(key) {
		return this.h.hasOwnProperty("$" + key);
	}
	,remove: function(key) {
		key = "$" + key;
		if(!this.h.hasOwnProperty(key)) return false;
		delete(this.h[key]);
		return true;
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key.substr(1));
		}
		return HxOverrides.iter(a);
	}
	,__class__: haxe.ds.StringMap
};
haxe.io = {};
haxe.io.Bytes = function(length,b) {
	this.length = length;
	this.b = b;
};
$hxClasses["haxe.io.Bytes"] = haxe.io.Bytes;
haxe.io.Bytes.__name__ = ["haxe","io","Bytes"];
haxe.io.Bytes.alloc = function(length) {
	var a = new Array();
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		a.push(0);
	}
	return new haxe.io.Bytes(length,a);
};
haxe.io.Bytes.ofString = function(s) {
	var a = new Array();
	var i = 0;
	while(i < s.length) {
		var c = StringTools.fastCodeAt(s,i++);
		if(55296 <= c && c <= 56319) c = c - 55232 << 10 | StringTools.fastCodeAt(s,i++) & 1023;
		if(c <= 127) a.push(c); else if(c <= 2047) {
			a.push(192 | c >> 6);
			a.push(128 | c & 63);
		} else if(c <= 65535) {
			a.push(224 | c >> 12);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		} else {
			a.push(240 | c >> 18);
			a.push(128 | c >> 12 & 63);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		}
	}
	return new haxe.io.Bytes(a.length,a);
};
haxe.io.Bytes.prototype = {
	get: function(pos) {
		return this.b[pos];
	}
	,readString: function(pos,len) {
		if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
		var s = "";
		var b = this.b;
		var fcc = String.fromCharCode;
		var i = pos;
		var max = pos + len;
		while(i < max) {
			var c = b[i++];
			if(c < 128) {
				if(c == 0) break;
				s += fcc(c);
			} else if(c < 224) s += fcc((c & 63) << 6 | b[i++] & 127); else if(c < 240) {
				var c2 = b[i++];
				s += fcc((c & 31) << 12 | (c2 & 127) << 6 | b[i++] & 127);
			} else {
				var c21 = b[i++];
				var c3 = b[i++];
				var u = (c & 15) << 18 | (c21 & 127) << 12 | (c3 & 127) << 6 | b[i++] & 127;
				s += fcc((u >> 10) + 55232);
				s += fcc(u & 1023 | 56320);
			}
		}
		return s;
	}
	,toString: function() {
		return this.readString(0,this.length);
	}
	,__class__: haxe.io.Bytes
};
haxe.io.BytesBuffer = function() {
	this.b = new Array();
};
$hxClasses["haxe.io.BytesBuffer"] = haxe.io.BytesBuffer;
haxe.io.BytesBuffer.__name__ = ["haxe","io","BytesBuffer"];
haxe.io.BytesBuffer.prototype = {
	getBytes: function() {
		var bytes = new haxe.io.Bytes(this.b.length,this.b);
		this.b = null;
		return bytes;
	}
	,__class__: haxe.io.BytesBuffer
};
haxe.io.Input = function() { };
$hxClasses["haxe.io.Input"] = haxe.io.Input;
haxe.io.Input.__name__ = ["haxe","io","Input"];
haxe.io.Input.prototype = {
	readByte: function() {
		throw "Not implemented";
	}
	,readBytes: function(s,pos,len) {
		var k = len;
		var b = s.b;
		if(pos < 0 || len < 0 || pos + len > s.length) throw haxe.io.Error.OutsideBounds;
		while(k > 0) {
			b[pos] = this.readByte();
			pos++;
			k--;
		}
		return len;
	}
	,readFullBytes: function(s,pos,len) {
		while(len > 0) {
			var k = this.readBytes(s,pos,len);
			pos += k;
			len -= k;
		}
	}
	,readString: function(len) {
		var b = haxe.io.Bytes.alloc(len);
		this.readFullBytes(b,0,len);
		return b.toString();
	}
	,__class__: haxe.io.Input
};
haxe.io.BytesInput = function(b,pos,len) {
	if(pos == null) pos = 0;
	if(len == null) len = b.length - pos;
	if(pos < 0 || len < 0 || pos + len > b.length) throw haxe.io.Error.OutsideBounds;
	this.b = b.b;
	this.pos = pos;
	this.len = len;
	this.totlen = len;
};
$hxClasses["haxe.io.BytesInput"] = haxe.io.BytesInput;
haxe.io.BytesInput.__name__ = ["haxe","io","BytesInput"];
haxe.io.BytesInput.__super__ = haxe.io.Input;
haxe.io.BytesInput.prototype = $extend(haxe.io.Input.prototype,{
	readByte: function() {
		if(this.len == 0) throw new haxe.io.Eof();
		this.len--;
		return this.b[this.pos++];
	}
	,readBytes: function(buf,pos,len) {
		if(pos < 0 || len < 0 || pos + len > buf.length) throw haxe.io.Error.OutsideBounds;
		if(this.len == 0 && len > 0) throw new haxe.io.Eof();
		if(this.len < len) len = this.len;
		var b1 = this.b;
		var b2 = buf.b;
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			b2[pos + i] = b1[this.pos + i];
		}
		this.pos += len;
		this.len -= len;
		return len;
	}
	,__class__: haxe.io.BytesInput
});
haxe.io.Output = function() { };
$hxClasses["haxe.io.Output"] = haxe.io.Output;
haxe.io.Output.__name__ = ["haxe","io","Output"];
haxe.io.BytesOutput = function() {
	this.b = new haxe.io.BytesBuffer();
};
$hxClasses["haxe.io.BytesOutput"] = haxe.io.BytesOutput;
haxe.io.BytesOutput.__name__ = ["haxe","io","BytesOutput"];
haxe.io.BytesOutput.__super__ = haxe.io.Output;
haxe.io.BytesOutput.prototype = $extend(haxe.io.Output.prototype,{
	writeByte: function(c) {
		this.b.b.push(c);
	}
	,getBytes: function() {
		return this.b.getBytes();
	}
	,__class__: haxe.io.BytesOutput
});
haxe.io.Eof = function() {
};
$hxClasses["haxe.io.Eof"] = haxe.io.Eof;
haxe.io.Eof.__name__ = ["haxe","io","Eof"];
haxe.io.Eof.prototype = {
	toString: function() {
		return "Eof";
	}
	,__class__: haxe.io.Eof
};
haxe.io.Error = $hxClasses["haxe.io.Error"] = { __ename__ : ["haxe","io","Error"], __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] };
haxe.io.Error.Blocked = ["Blocked",0];
haxe.io.Error.Blocked.toString = $estr;
haxe.io.Error.Blocked.__enum__ = haxe.io.Error;
haxe.io.Error.Overflow = ["Overflow",1];
haxe.io.Error.Overflow.toString = $estr;
haxe.io.Error.Overflow.__enum__ = haxe.io.Error;
haxe.io.Error.OutsideBounds = ["OutsideBounds",2];
haxe.io.Error.OutsideBounds.toString = $estr;
haxe.io.Error.OutsideBounds.__enum__ = haxe.io.Error;
haxe.io.Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe.io.Error; $x.toString = $estr; return $x; };
haxe.io.StringInput = function(s) {
	haxe.io.BytesInput.call(this,haxe.io.Bytes.ofString(s));
};
$hxClasses["haxe.io.StringInput"] = haxe.io.StringInput;
haxe.io.StringInput.__name__ = ["haxe","io","StringInput"];
haxe.io.StringInput.__super__ = haxe.io.BytesInput;
haxe.io.StringInput.prototype = $extend(haxe.io.BytesInput.prototype,{
	__class__: haxe.io.StringInput
});
var js = {};
js.Boot = function() { };
$hxClasses["js.Boot"] = js.Boot;
js.Boot.__name__ = ["js","Boot"];
js.Boot.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
};
js.Boot.__trace = function(v,i) {
	var msg;
	if(i != null) msg = i.fileName + ":" + i.lineNumber + ": "; else msg = "";
	msg += js.Boot.__string_rec(v,"");
	if(i != null && i.customParams != null) {
		var _g = 0;
		var _g1 = i.customParams;
		while(_g < _g1.length) {
			var v1 = _g1[_g];
			++_g;
			msg += "," + js.Boot.__string_rec(v1,"");
		}
	}
	var d;
	if(typeof(document) != "undefined" && (d = document.getElementById("haxe:trace")) != null) d.innerHTML += js.Boot.__unhtml(msg) + "<br/>"; else if(typeof console != "undefined" && console.log != null) console.log(msg);
};
js.Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else return o.__class__;
};
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i1;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js.Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str2 = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str2.length != 2) str2 += ", \n";
		str2 += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str2 += "\n" + s + "}";
		return str2;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
};
js.Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Array:
		return (o instanceof Array) && o.__enum__ == null;
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) return true;
				if(js.Boot.__interfLoop(js.Boot.getClass(o),cl)) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
};
js.Boot.__cast = function(o,t) {
	if(js.Boot.__instanceof(o,t)) return o; else throw "Cannot cast " + Std.string(o) + " to " + Std.string(t);
};
js.Browser = function() { };
$hxClasses["js.Browser"] = js.Browser;
js.Browser.__name__ = ["js","Browser"];
js.Browser.__properties__ = {get_supported:"get_supported"}
js.Browser.get_supported = function() {
	return typeof window != "undefined";
};
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; }
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
$hxClasses.Math = Math;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i1) {
	return isNaN(i1);
};
String.prototype.__class__ = $hxClasses.String = String;
String.__name__ = ["String"];
$hxClasses.Array = Array;
Array.__name__ = ["Array"];
Date.prototype.__class__ = $hxClasses.Date = Date;
Date.__name__ = ["Date"];
var Int = $hxClasses.Int = { __name__ : ["Int"]};
var Dynamic = $hxClasses.Dynamic = { __name__ : ["Dynamic"]};
var Float = $hxClasses.Float = Number;
Float.__name__ = ["Float"];
var Bool = $hxClasses.Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = $hxClasses.Class = { __name__ : ["Class"]};
var Enum = { };
CoffeeScript.mod = require('coffee-script');
Path.pmod = require('path');
Six.mod = require('six');
UglifyJS.mod = require("./ugly/tools/node.js");
gscript.Parser.p1 = 0;
gscript.Parser.readPos = 0;
gscript.Parser.tokenMin = 0;
gscript.Parser.tokenMax = 0;
haxe.Serializer.USE_CACHE = false;
haxe.Serializer.USE_ENUM_INDEX = false;
haxe.Serializer.BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%:";
haxe.ds.ObjectMap.count = 0;
TumTum.main();
})();
