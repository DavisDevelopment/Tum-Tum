(function () { "use strict";
var $estr = function() { return js.Boot.__string_rec(this,''); };
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
EReg.__name__ = ["EReg"];
EReg.prototype = {
	match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,__class__: EReg
};
var HxOverrides = function() { };
HxOverrides.__name__ = ["HxOverrides"];
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
var Lambda = function() { };
Lambda.__name__ = ["Lambda"];
Lambda.has = function(it,elt) {
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(x == elt) return true;
	}
	return false;
};
var Main = function() { };
Main.__name__ = ["Main"];
Main.expose = function(name,what) {
	var isNode = (typeof exports != 'undefined' && typeof require == 'function');
	var env = null;
	if(isNode == true) {
		env = exports;
		var _g = 0;
		var _g1 = Reflect.fields(what);
		while(_g < _g1.length) {
			var key = _g1[_g];
			++_g;
			Reflect.setProperty(env,key,Reflect.getProperty(what,key));
		}
	} else Reflect.setProperty(window,name,what);
};
Main.main = function() {
	Main.expose("ore",{ compile : ore.ObjectRegEx.compile, lex : function(sel) {
		var lexer = new ore.Lexer(sel);
		return lexer.lex();
	}, parse : function(sel1) {
		var lexer1 = new ore.Lexer(sel1);
		var tokens = lexer1.lex();
		var parser = new ore.Parser(tokens);
		var sel2 = parser.parse();
		return sel2;
	}, registerHelper : ore.ObjectRegEx.registerHelper, typename : ore.Types.basictype, typeparam : ore.Types.typename, 'is' : function(obj,descriptor) {
		return ore.ObjectRegEx.compile(descriptor).test(obj);
	}});
};
var IMap = function() { };
IMap.__name__ = ["IMap"];
Math.__name__ = ["Math"];
var Reflect = function() { };
Reflect.__name__ = ["Reflect"];
Reflect.getProperty = function(o,field) {
	var tmp;
	if(o == null) return null; else if(o.__properties__ && (tmp = o.__properties__["get_" + field])) return o[tmp](); else return o[field];
};
Reflect.setProperty = function(o,field,value) {
	var tmp;
	if(o.__properties__ && (tmp = o.__properties__["set_" + field])) o[tmp](value); else o[field] = value;
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
Reflect.makeVarArgs = function(f) {
	return function() {
		var a = Array.prototype.slice.call(arguments);
		return f(a);
	};
};
var Std = function() { };
Std.__name__ = ["Std"];
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
};
Std.parseFloat = function(x) {
	return parseFloat(x);
};
var Type = function() { };
Type.__name__ = ["Type"];
Type.getClass = function(o) {
	if(o == null) return null;
	if((o instanceof Array) && o.__enum__ == null) return Array; else return o.__class__;
};
Type.getSuperClass = function(c) {
	return c.__super__;
};
Type.getClassName = function(c) {
	var a = c.__name__;
	return a.join(".");
};
var haxe = {};
haxe.ds = {};
haxe.ds.StringMap = function() {
	this.h = { };
};
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
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key.substr(1));
		}
		return HxOverrides.iter(a);
	}
	,__class__: haxe.ds.StringMap
};
var js = {};
js.Boot = function() { };
js.Boot.__name__ = ["js","Boot"];
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
var ore = {};
ore.Compiler = function(opList) {
	this.ops = opList;
	this.testStack = new Array();
	this.helperFunctions = new haxe.ds.StringMap();
	this.opFunctions = new haxe.ds.StringMap();
};
ore.Compiler.__name__ = ["ore","Compiler"];
ore.Compiler.prototype = {
	next: function() {
		return this.ops.shift();
	}
	,compileOp: function(op) {
		switch(op[1]) {
		case 0:
			var id = op[2];
			if(this.opFunctions.exists("IdTest")) return this.opFunctions.get("IdTest"); else return function(ent) {
				return ent.id == id;
			};
			break;
		case 1:
			var id1 = op[2];
			if(this.helperFunctions.exists(id1)) return this.helperFunctions.get(id1); else return function(ent1) {
				if(ore.Utils.hasField(ent1,id1)) {
					var prop = Reflect.getProperty(ent1,id1);
					if(ore.Types.basictype(prop) == "Bool") return js.Boot.__cast(prop , Bool); else return true;
				} else return false;
			};
			break;
		case 2:
			var id2 = op[2];
			if(this.opFunctions.exists("ClassTest")) return this.opFunctions.get("ClassTest"); else return function(ent2) {
				return ore.Types.isInstanceOf(ent2,id2) || ore.Types.basictype(ent2) == id2;
			};
			break;
		case 3:
			var id3 = op[2];
			if(this.opFunctions.exists("LooseClassTest")) return this.opFunctions.get("LooseClassTest"); else return function(ent3) {
				return ore.Types.looseInstanceOf(ent3,id3);
			};
			break;
		case 5:
			var name = op[2];
			if(this.opFunctions.exists("PropExists")) return this.opFunctions.get("PropExists"); else return function(ent4) {
				return Object.prototype.hasOwnProperty.call(ent4,name);
			};
			break;
		case 6:
			var value = op[3];
			var name1 = op[2];
			if(this.opFunctions.exists("PropValueIs")) return this.opFunctions.get("PropValueIs"); else return function(ent5) {
				return Reflect.getProperty(ent5,name1) == value;
			};
			break;
		case 7:
			var value1 = op[3];
			var name2 = op[2];
			if(this.opFunctions.exists("PropValueIsnt")) return this.opFunctions.get("PropValueIsnt"); else return function(ent6) {
				return Reflect.getProperty(ent6,name2) != value1;
			};
			break;
		case 8:
			var op1 = op[3];
			var name3 = op[2];
			var matcher = this.compileOp(op1);
			return function(ent7) {
				var prop1 = Reflect.getProperty(ent7,name3);
				return matcher(prop1);
			};
		case 9:
			var type = op[3];
			var name4 = op[2];
			if(this.opFunctions.exists("PropClassIs")) return this.opFunctions.get("PropClassIs"); else return function(ent8) {
				var prop2 = Reflect.getProperty(ent8,name4);
				return ore.Types.typename(prop2) == type || ore.Types.basictype(prop2) == type;
			};
			break;
		case 4:
			var op2 = op[2];
			var selFunc = this.compileOp(op2);
			return function(ent9) {
				return !selFunc(ent9);
			};
		case 10:
			var rop = op[3];
			var lop = op[2];
			var left = this.compileOp(lop);
			var right = this.compileOp(rop);
			return function(ent10) {
				return left(ent10) || right(ent10);
			};
		case 11:
			var rop1 = op[3];
			var lop1 = op[2];
			var left1 = this.compileOp(lop1);
			var right1 = this.compileOp(rop1);
			return function(ent11) {
				return left1(ent11) && right1(ent11);
			};
		case 13:
			var opList = op[2];
			var me = this;
			return (function() {
				var comp = new ore.Compiler(opList);
				comp.opFunctions = me.opFunctions;
				comp.helperFunctions = me.helperFunctions;
				return comp.compile();
			})();
		case 12:
			var ifNotOp = op[4];
			var ifTrueOp = op[3];
			var conditionOp = op[2];
			var condition = this.compileOp(conditionOp);
			var ifTrue = this.compileOp(ifTrueOp);
			var ifNot = this.compileOp(ifNotOp);
			return function(ent12) {
				if(condition(ent12)) return ifTrue(ent12); else return ifNot(ent12);
			};
		case 14:
			return function(ent13) {
				return true;
			};
		}
	}
	,compile: function() {
		var conditionStack = new Array();
		var op = this.next();
		while(op != null) {
			var test = this.compileOp(op);
			conditionStack.push(test);
			op = this.next();
		}
		return function(ent) {
			var _g = 0;
			while(_g < conditionStack.length) {
				var f = conditionStack[_g];
				++_g;
				if(!f(ent)) return false;
			}
			return true;
		};
	}
	,registerHelper: function(name,helper) {
		this.helperFunctions.set(name,helper);
	}
	,__class__: ore.Compiler
};
ore.Lexer = function(sel) {
	this.input = sel.split("");
	this.tokens = [];
};
ore.Lexer.__name__ = ["ore","Lexer"];
ore.Lexer.prototype = {
	isDigit: function(c) {
		return new EReg("[0-9]","").match(c);
	}
	,isAlphaNumeric: function(c) {
		return new EReg("[A-Za-z0-9_]","").match(c);
	}
	,advance: function() {
		return this.input.shift();
	}
	,next: function() {
		return this.input[0];
	}
	,push: function(tk) {
		this.tokens.push(tk);
	}
	,lex: function() {
		var c = "";
		while(true) {
			c = this.advance();
			if(c == null) break; else if(c == "'" || c == "\"") {
				var delimiter = c;
				var str = "";
				while(this.next() != null && this.next() != delimiter) {
					c = this.advance();
					str += c;
				}
				this.advance();
				this.push(ore.Token.TString(str));
			} else if(this.isDigit(c)) {
				var strNum = c;
				while(this.next() != null && (this.isDigit(this.next()) || this.next() == ".")) {
					c = this.advance();
					strNum += c;
				}
				var num = Std.parseFloat(strNum);
				this.push(ore.Token.TNumber(num));
			} else if(this.isAlphaNumeric(c)) {
				var ident = c;
				while(this.next() != null && this.isAlphaNumeric(this.next())) {
					c = this.advance();
					ident += c;
				}
				this.push(ore.Token.TIdent(ident));
			} else if(c == "#") this.push(ore.Token.THash); else if(this.next() != null && c == "." && this.next() == ".") {
				this.push(ore.Token.TDoubleDot);
				this.advance();
			} else if(this.next() != null && c == "." && this.next() == "=") {
				this.push(ore.Token.TDEquals);
				this.advance();
			} else if(c == ".") this.push(ore.Token.TDot); else if(c == "/" && this.next() == "*") {
				this.advance();
				while(true) {
					if(this.next() == "*") {
						this.advance();
						if(this.next() == "/") {
							this.advance();
							break;
						}
					} else if(this.next() == null) break;
					this.advance();
				}
			} else if(c == "&") this.push(ore.Token.TAnd); else if(c == "|") this.push(ore.Token.TOr); else if(c == "?") this.push(ore.Token.TQuestion); else if(c == ":") this.push(ore.Token.TColon); else if(c == "*") this.push(ore.Token.TAny); else if(c == "[") this.push(ore.Token.TOpenBracket); else if(c == "]") this.push(ore.Token.TCloseBracket); else if(c == "=") {
				if(this.next() == ">") {
					this.push(ore.Token.TArrow);
					this.advance();
				} else this.push(ore.Token.TEquals);
			} else if(c == "!") {
				if(this.next() == "=") {
					this.push(ore.Token.TNEquals);
					this.advance();
				} else this.push(ore.Token.TNeg);
			} else if(c == "(") {
				var groupString = [""];
				var parens = 1;
				while(parens > 0) {
					if(this.next() == ")") parens--; else if(this.next() == "(") parens++;
					if(parens > 0) {
						c = this.advance();
						groupString[0] += c;
					}
				}
				this.advance();
				var group = ((function(groupString) {
					return function() {
						var lexer = new ore.Lexer(groupString[0]);
						return lexer.lex();
					};
				})(groupString))();
				this.push(ore.Token.TGroup(group));
			}
		}
		return this.tokens;
	}
	,__class__: ore.Lexer
};
ore.ObjectRegEx = function() { };
ore.ObjectRegEx.__name__ = ["ore","ObjectRegEx"];
ore.ObjectRegEx.bindHelpers = function(compiler) {
	var $it0 = ore.ObjectRegEx.helpers.keys();
	while( $it0.hasNext() ) {
		var key = $it0.next();
		var helper = ore.ObjectRegEx.helpers.get(key);
		compiler.registerHelper(key,helper);
	}
};
ore.ObjectRegEx.getFunc = function(selector) {
	if(ore.ObjectRegEx.memoize) {
		if(ore.ObjectRegEx.selectors.exists(selector)) return ore.ObjectRegEx.selectors.get(selector); else {
			var lexer = new ore.Lexer(selector);
			var tokens = lexer.lex();
			var parser = new ore.Parser(tokens);
			var sel = parser.parse();
			var compiler = new ore.Compiler(sel);
			ore.ObjectRegEx.bindHelpers(compiler);
			var func = compiler.compile();
			ore.ObjectRegEx.selectors.set(selector,func);
			return func;
		}
	} else {
		var lexer1 = new ore.Lexer(selector);
		var tokens1 = lexer1.lex();
		var parser1 = new ore.Parser(tokens1);
		var sel1 = parser1.parse();
		var compiler1 = new ore.Compiler(sel1);
		ore.ObjectRegEx.bindHelpers(compiler1);
		var func1 = compiler1.compile();
		return func1;
	}
};
ore.ObjectRegEx.compile = function(selector) {
	var func = ore.ObjectRegEx.getFunc(selector);
	return new ore.Selection(func);
};
ore.ObjectRegEx.registerHelper = function(name,helper) {
	ore.ObjectRegEx.helpers.set(name,helper);
};
ore.Parser = function(tokens) {
	this.input = tokens;
	this.ops = new Array();
};
ore.Parser.__name__ = ["ore","Parser"];
ore.Parser.prototype = {
	push: function(op) {
		this.ops.push(op);
	}
	,last: function() {
		return this.ops.pop();
	}
	,token: function() {
		return this.input.shift();
	}
	,unexpected: function(tk) {
		throw "SelectorParseError: Unexpected token " + Std.string(tk) + ".";
	}
	,parseToken: function(tk) {
		switch(tk[1]) {
		case 4:
			return ore.SelOp.Any;
		case 5:
			var next = this.token();
			switch(next[1]) {
			case 2:
				var id = next[2];
				return ore.SelOp.IdTest(id);
			default:
				this.unexpected(tk);
				return ore.SelOp.Any;
			}
			break;
		case 7:
			var next1 = this.token();
			if(next1 == null) this.unexpected(tk);
			return ore.SelOp.Negate(this.parseToken(next1));
		case 12:
			var prev = this.last();
			var ifTrue = this.parseToken(this.token());
			if(ifTrue == null) this.unexpected(tk);
			var col = this.token();
			var continu = true;
			switch(col[1]) {
			case 11:
				continu = true;
				break;
			default:
				continu = false;
			}
			if(!continu) this.unexpected(col);
			var ifNot = this.parseToken(this.token());
			if(ifNot == null) this.unexpected(tk);
			return ore.SelOp.Ternary(prev,ifTrue,ifNot);
		case 11:
			var next2 = this.token();
			if(next2 == null) this.unexpected(tk);
			switch(next2[1]) {
			case 2:
				var id1 = next2[2];
				return ore.SelOp.BoolPropTest(id1);
			default:
				this.unexpected(tk);
				return ore.SelOp.Any;
			}
			break;
		case 10:
			var next3 = this.token();
			if(next3 == null) this.unexpected(tk);
			switch(next3[1]) {
			case 2:
				var id2 = next3[2];
				return ore.SelOp.LooseClassTest(id2);
			case 1:
				var id2 = next3[2];
				return ore.SelOp.LooseClassTest(id2);
			default:
				this.unexpected(tk);
				return ore.SelOp.Any;
			}
			break;
		case 6:
			var next4 = this.token();
			if(next4 == null) this.unexpected(tk);
			switch(next4[1]) {
			case 2:
				var id3 = next4[2];
				return ore.SelOp.ClassTest(id3);
			case 1:
				var id3 = next4[2];
				return ore.SelOp.ClassTest(id3);
			default:
				this.unexpected(tk);
				return ore.SelOp.Any;
			}
			break;
		case 8:
			var left = this.last();
			if(left == null) this.unexpected(tk);
			var next5 = this.token();
			if(next5 == null) this.unexpected(tk);
			var right = this.parseToken(next5);
			return ore.SelOp.Or(left,right);
		case 9:
			var left1 = this.last();
			if(left1 == null) this.unexpected(tk);
			var next6 = this.token();
			if(next6 == null) this.unexpected(tk);
			var right1 = this.parseToken(next6);
			return ore.SelOp.And(left1,right1);
		case 13:
			var name = this.token();
			var dat = { };
			if(name == null) this.unexpected(tk);
			switch(name[1]) {
			case 2:
				var id4 = name[2];
				dat.name = id4;
				var next7 = this.token();
				if(next7 == null) this.unexpected(tk);
				switch(next7[1]) {
				case 14:
					return ore.SelOp.PropExists(dat.name);
				case 15:
					var val = this.token();
					if(val == null) this.unexpected(next7);
					switch(val[1]) {
					case 2:
						var id5 = val[2];
						dat.val = id5;
						if(id5 == "true") dat.val = true; else if(id5 == "false") dat.val = false; else if(id5 == "null") dat.val = null;
						this.token();
						return ore.SelOp.PropValueIs(dat.name,dat.val);
					case 0:
						var num = val[2];
						dat.val = num;
						this.token();
						return ore.SelOp.PropValueIs(dat.name,dat.val);
					case 1:
						var str = val[2];
						dat.val = str;
						this.token();
						return ore.SelOp.PropValueIs(dat.name,dat.val);
					default:
						return ore.SelOp.Any;
					}
					break;
				case 16:
					var val1 = this.token();
					if(val1 == null) this.unexpected(next7);
					switch(val1[1]) {
					case 2:
						var id6 = val1[2];
						dat.val = id6;
						if(id6 == "true") dat.val = true; else if(id6 == "false") dat.val = false; else if(id6 == "null") dat.val = null;
						this.token();
						return ore.SelOp.PropValueIsnt(dat.name,dat.val);
					case 0:
						var num1 = val1[2];
						dat.val = num1;
						this.token();
						return ore.SelOp.PropValueIsnt(dat.name,dat.val);
					case 1:
						var str1 = val1[2];
						dat.val = str1;
						this.token();
						return ore.SelOp.PropValueIsnt(dat.name,dat.val);
					default:
						return ore.SelOp.Any;
					}
					break;
				case 17:
					var val2 = this.token();
					if(val2 == null) this.unexpected(next7);
					switch(val2[1]) {
					case 2:
						var id7 = val2[2];
						dat.val = id7;
						this.token();
						return ore.SelOp.PropClassIs(dat.name,dat.val);
					case 1:
						var id7 = val2[2];
						dat.val = id7;
						this.token();
						return ore.SelOp.PropClassIs(dat.name,dat.val);
					default:
						return ore.SelOp.Any;
					}
					break;
				case 18:
					var tok = this.token();
					if(tok == null) this.unexpected(tk);
					var op = this.parseToken(tok);
					this.token();
					return ore.SelOp.PropValueMatches(dat.name,op);
				default:
					return ore.SelOp.Any;
				}
				break;
			default:
				this.unexpected(tk);
				return ore.SelOp.Any;
			}
			break;
		case 3:
			var tokens = tk[2];
			var ops = (function() {
				var parser = new ore.Parser(tokens);
				return parser.parse();
			})();
			return ore.SelOp.Group(ops);
		default:
			this.unexpected(tk);
			return ore.SelOp.Any;
		}
	}
	,parse: function() {
		while(this.input.length > 0) {
			var tk = this.token();
			if(tk == null) break; else {
				var op = this.parseToken(tk);
				this.push(op);
			}
		}
		return this.ops;
	}
	,__class__: ore.Parser
};
ore.SelOp = { __ename__ : true, __constructs__ : ["IdTest","BoolPropTest","ClassTest","LooseClassTest","Negate","PropExists","PropValueIs","PropValueIsnt","PropValueMatches","PropClassIs","Or","And","Ternary","Group","Any"] };
ore.SelOp.IdTest = function(id) { var $x = ["IdTest",0,id]; $x.__enum__ = ore.SelOp; $x.toString = $estr; return $x; };
ore.SelOp.BoolPropTest = function(id) { var $x = ["BoolPropTest",1,id]; $x.__enum__ = ore.SelOp; $x.toString = $estr; return $x; };
ore.SelOp.ClassTest = function(id) { var $x = ["ClassTest",2,id]; $x.__enum__ = ore.SelOp; $x.toString = $estr; return $x; };
ore.SelOp.LooseClassTest = function(id) { var $x = ["LooseClassTest",3,id]; $x.__enum__ = ore.SelOp; $x.toString = $estr; return $x; };
ore.SelOp.Negate = function(op) { var $x = ["Negate",4,op]; $x.__enum__ = ore.SelOp; $x.toString = $estr; return $x; };
ore.SelOp.PropExists = function(name) { var $x = ["PropExists",5,name]; $x.__enum__ = ore.SelOp; $x.toString = $estr; return $x; };
ore.SelOp.PropValueIs = function(name,value) { var $x = ["PropValueIs",6,name,value]; $x.__enum__ = ore.SelOp; $x.toString = $estr; return $x; };
ore.SelOp.PropValueIsnt = function(name,value) { var $x = ["PropValueIsnt",7,name,value]; $x.__enum__ = ore.SelOp; $x.toString = $estr; return $x; };
ore.SelOp.PropValueMatches = function(name,op) { var $x = ["PropValueMatches",8,name,op]; $x.__enum__ = ore.SelOp; $x.toString = $estr; return $x; };
ore.SelOp.PropClassIs = function(name,type) { var $x = ["PropClassIs",9,name,type]; $x.__enum__ = ore.SelOp; $x.toString = $estr; return $x; };
ore.SelOp.Or = function(lop,rop) { var $x = ["Or",10,lop,rop]; $x.__enum__ = ore.SelOp; $x.toString = $estr; return $x; };
ore.SelOp.And = function(lop,rop) { var $x = ["And",11,lop,rop]; $x.__enum__ = ore.SelOp; $x.toString = $estr; return $x; };
ore.SelOp.Ternary = function(cond,ifTrue,ifNot) { var $x = ["Ternary",12,cond,ifTrue,ifNot]; $x.__enum__ = ore.SelOp; $x.toString = $estr; return $x; };
ore.SelOp.Group = function(ops) { var $x = ["Group",13,ops]; $x.__enum__ = ore.SelOp; $x.toString = $estr; return $x; };
ore.SelOp.Any = ["Any",14];
ore.SelOp.Any.toString = $estr;
ore.SelOp.Any.__enum__ = ore.SelOp;
ore.Selection = function(func) {
	this.selectorFunction = func;
	this.getChildren = function(ent) {
		var _g = [];
		var _g1 = 0;
		var _g2 = Reflect.fields(ent);
		while(_g1 < _g2.length) {
			var key = _g2[_g1];
			++_g1;
			_g.push(Reflect.getProperty(ent,key));
		}
		return _g;
	};
};
ore.Selection.__name__ = ["ore","Selection"];
ore.Selection.prototype = {
	test: function(obj) {
		return this.selectorFunction(obj);
	}
	,getChildrenRecursive: function(obj) {
		var me = this;
		var kids = this.getChildren(obj);
		var descend;
		var descend1 = null;
		descend1 = function(ent) {
			var lkids = me.getChildren(ent);
			var _g = 0;
			while(_g < lkids.length) {
				var kid = lkids[_g];
				++_g;
				if(!Lambda.has(kids,kid) && Reflect.isObject(kid)) kids.push(kid);
				if(Reflect.isObject(kid)) descend1(kid);
			}
		};
		descend = descend1;
		descend(obj);
		return kids;
	}
	,traverse: function(obj) {
		var kids = this.getChildrenRecursive(obj);
		kids = kids.filter(this.selectorFunction);
		return kids;
	}
	,__class__: ore.Selection
};
ore.Token = { __ename__ : true, __constructs__ : ["TNumber","TString","TIdent","TGroup","TAny","THash","TDot","TNeg","TOr","TAnd","TDoubleDot","TColon","TQuestion","TOpenBracket","TCloseBracket","TEquals","TNEquals","TDEquals","TArrow"] };
ore.Token.TNumber = function(num) { var $x = ["TNumber",0,num]; $x.__enum__ = ore.Token; $x.toString = $estr; return $x; };
ore.Token.TString = function(str) { var $x = ["TString",1,str]; $x.__enum__ = ore.Token; $x.toString = $estr; return $x; };
ore.Token.TIdent = function(id) { var $x = ["TIdent",2,id]; $x.__enum__ = ore.Token; $x.toString = $estr; return $x; };
ore.Token.TGroup = function(tokens) { var $x = ["TGroup",3,tokens]; $x.__enum__ = ore.Token; $x.toString = $estr; return $x; };
ore.Token.TAny = ["TAny",4];
ore.Token.TAny.toString = $estr;
ore.Token.TAny.__enum__ = ore.Token;
ore.Token.THash = ["THash",5];
ore.Token.THash.toString = $estr;
ore.Token.THash.__enum__ = ore.Token;
ore.Token.TDot = ["TDot",6];
ore.Token.TDot.toString = $estr;
ore.Token.TDot.__enum__ = ore.Token;
ore.Token.TNeg = ["TNeg",7];
ore.Token.TNeg.toString = $estr;
ore.Token.TNeg.__enum__ = ore.Token;
ore.Token.TOr = ["TOr",8];
ore.Token.TOr.toString = $estr;
ore.Token.TOr.__enum__ = ore.Token;
ore.Token.TAnd = ["TAnd",9];
ore.Token.TAnd.toString = $estr;
ore.Token.TAnd.__enum__ = ore.Token;
ore.Token.TDoubleDot = ["TDoubleDot",10];
ore.Token.TDoubleDot.toString = $estr;
ore.Token.TDoubleDot.__enum__ = ore.Token;
ore.Token.TColon = ["TColon",11];
ore.Token.TColon.toString = $estr;
ore.Token.TColon.__enum__ = ore.Token;
ore.Token.TQuestion = ["TQuestion",12];
ore.Token.TQuestion.toString = $estr;
ore.Token.TQuestion.__enum__ = ore.Token;
ore.Token.TOpenBracket = ["TOpenBracket",13];
ore.Token.TOpenBracket.toString = $estr;
ore.Token.TOpenBracket.__enum__ = ore.Token;
ore.Token.TCloseBracket = ["TCloseBracket",14];
ore.Token.TCloseBracket.toString = $estr;
ore.Token.TCloseBracket.__enum__ = ore.Token;
ore.Token.TEquals = ["TEquals",15];
ore.Token.TEquals.toString = $estr;
ore.Token.TEquals.__enum__ = ore.Token;
ore.Token.TNEquals = ["TNEquals",16];
ore.Token.TNEquals.toString = $estr;
ore.Token.TNEquals.__enum__ = ore.Token;
ore.Token.TDEquals = ["TDEquals",17];
ore.Token.TDEquals.toString = $estr;
ore.Token.TDEquals.__enum__ = ore.Token;
ore.Token.TArrow = ["TArrow",18];
ore.Token.TArrow.toString = $estr;
ore.Token.TArrow.__enum__ = ore.Token;
ore.Types = function() { };
ore.Types.__name__ = ["ore","Types"];
ore.Types.basictype = function(obj) {
	switch(obj) {
	case "":
		return "String";
	default:
		if(Reflect.getProperty(obj,"indexOf") != null) {
			if(Reflect.getProperty(obj,"join") != null) return "Array"; else return "String";
		} else if(Reflect.isObject(obj)) {
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
ore.Types.typename = function(obj) {
	var basic = ore.Types.basictype(obj);
	if(basic == "Array") {
		var arr;
		arr = js.Boot.__cast(obj , Array);
		var typeParam = "";
		var _g1 = 0;
		var _g = obj.length;
		while(_g1 < _g) {
			var i = _g1++;
			var item = arr[i];
			if(typeParam == "") typeParam = ore.Types.typename(item); else if(typeParam != ore.Types.typename(item)) {
				var _basic = typeParam.substring(0,typeParam.indexOf("<"));
				if(_basic == ore.Types.basictype(item)) typeParam = "" + _basic + "<Dynamic>"; else if(typeParam == "Int" && ore.Types.typename(item) == "Float" || typeParam == "Float" && ore.Types.typename(item) == "Int" || typeParam == "Number" && (ore.Types.typename(item) == "Int" || ore.Types.typename(item) == "Float")) typeParam == "Number"; else {
					typeParam = "Dynamic";
					break;
				}
			}
		}
		return "Array<" + typeParam + ">";
	} else if(basic == "Object") {
		var props = Reflect.fields(obj);
		var typeParams_0 = "";
		var typeParams_1 = "";
		var _g2 = 0;
		while(_g2 < props.length) {
			var name = props[_g2];
			++_g2;
			var item1 = Reflect.getProperty(obj,name);
			var keyType = ore.Types.typename(name);
			var valType = ore.Types.typename(item1);
			if(typeParams_0 == "") typeParams_0 = keyType;
			if(typeParams_1 == "") typeParams_1 = valType;
			if(typeParams_0 != ore.Types.typename(name)) {
				var _basic1 = typeParams_0.substring(0,typeParams_0.indexOf("<"));
				if(_basic1 == ore.Types.basictype(item1)) typeParams_0 = "" + _basic1 + "<Dynamic>"; else typeParams_0 = "Dynamic";
			}
			if(typeParams_1 != ore.Types.typename(item1)) {
				var _basic2 = typeParams_1.substring(0,typeParams_1.indexOf("<"));
				if(_basic2 == ore.Types.basictype(item1)) typeParams_1 = "" + _basic2 + "<Dynamic>"; else typeParams_1 = "Dynamic";
			}
		}
		return "Object<" + typeParams_0 + ", " + typeParams_1 + ">";
	}
	return basic;
};
ore.Types.assert = function(item,type,errorMessage) {
	if(ore.Types.typename(item) != type) throw errorMessage == null?"TypeError: Expected " + type + ", got " + ore.Types.typename(item) + ".":errorMessage;
};
ore.Types.getClassHierarchy = function(obj) {
	var getHierarchy = function(klass) {
		var klasses = [];
		var current = klass;
		while(current != null) {
			klasses.push(current);
			current = Type.getSuperClass(current);
		}
		var klassNames = [];
		var _g = 0;
		while(_g < klasses.length) {
			var k = klasses[_g];
			++_g;
			var name = Type.getClassName(k);
			klassNames.push(name.substring(name.lastIndexOf(".")));
		}
		return klassNames;
	};
	if(Reflect.isObject(obj)) {
		var klass1 = Type.getClass(obj);
		if(klass1 == null) {
			var superClass = Type.getSuperClass(obj);
			if(superClass == null) return []; else return getHierarchy(obj);
		} else return getHierarchy(klass1);
	} else return [];
};
ore.Types.isInstanceOf = function(obj,name) {
	return ore.Types.typename(obj) == name;
};
ore.Types.looseInstanceOf = function(obj,name) {
	return Lambda.has(ore.Types.getClassHierarchy(obj),name);
};
ore.Types.toStaticFunction = function(argTypes,func) {
	return Reflect.makeVarArgs(function(args) {
		var _g1 = 0;
		var _g = args.length;
		while(_g1 < _g) {
			var i = _g1++;
			ore.Types.assert(args[i],argTypes[i],"TypeError: for argument " + i + ", expected " + argTypes[i] + " but got " + ore.Types.typename(args[i]) + ".");
		}
		return func.apply(null,args);
	});
};
ore.Utils = function() { };
ore.Utils.__name__ = ["ore","Utils"];
ore.Utils.bindFunction = function(o,f) {
	return function(args) {
		return f.apply(o,args);
	};
};
ore.Utils.DynamicToMap = function(dyn) {
	var keys = Reflect.fields(dyn);
	var result = new haxe.ds.StringMap();
	var _g = 0;
	while(_g < keys.length) {
		var key = keys[_g];
		++_g;
		var value = Reflect.getProperty(dyn,key);
		result.set(key,value);
	}
	return result;
};
ore.Utils.contains = function(list,item) {
	var _g = 0;
	while(_g < list.length) {
		var x = list[_g];
		++_g;
		if(x == item) return true;
	}
	return false;
};
ore.Utils.hasField = function(o,field) {
	return Reflect.getProperty(o,field) != null;
};
ore.Utils.distance = function(x1,y1,x2,y2) {
	var dx = Math.round(Math.abs(x2 - x1));
	var dy = Math.round(Math.abs(y2 - y1));
	dx = dx * dx;
	dy = dy * dy;
	return Math.round(Math.sqrt(dx + dy));
};
ore.Utils.isPointInRect = function(point,rect) {
	var inX = point.x > rect.x && point.x < rect.x + rect.width;
	var inY = point.y > rect.y && point.y < rect.y + rect.height;
	return inX && inY;
};
ore.Utils.largest = function(list) {
	var largest = null;
	var _g = 0;
	while(_g < list.length) {
		var x = list[_g];
		++_g;
		if(largest == null || largest < x) largest = x;
	}
	return largest;
};
ore.Utils.smallest = function(list) {
	var smallest = null;
	var _g = 0;
	while(_g < list.length) {
		var x = list[_g];
		++_g;
		if(smallest == null || smallest > x) smallest = x;
	}
	return smallest;
};
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; }
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i1) {
	return isNaN(i1);
};
String.prototype.__class__ = String;
String.__name__ = ["String"];
Array.__name__ = ["Array"];
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
if(Array.prototype.filter == null) Array.prototype.filter = function(f1) {
	var a1 = [];
	var _g11 = 0;
	var _g2 = this.length;
	while(_g11 < _g2) {
		var i1 = _g11++;
		var e = this[i1];
		if(f1(e)) a1.push(e);
	}
	return a1;
};
ore.ObjectRegEx.selectors = new haxe.ds.StringMap();
ore.ObjectRegEx.helpers = new haxe.ds.StringMap();
ore.ObjectRegEx.memoize = true;
Main.main();
})();
