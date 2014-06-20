package gscript;

// Both Neko/CPP and JS Support

class FileSystem {
	public static function exists( path:String ):Bool {
		#if (js && !nodejs)
			if ( js.Browser.supported ) {
				var req = new js.html.XMLHttpRequest();
				req.open( "GET", path, false );
				req.send( null );
				if ( req.status != 200 ) return false;
				return true;
			} else {
				var fs:Dynamic = untyped __js__('require("fs")');
				return fs.existsSync( path );
			}
		#else
			return sys.FileSystem.exists(path);
		#end
	}
	public static function getString( path:String ):String {
		#if (js && !nodejs)
			if ( js.Browser.supported ) {
				var req = new js.html.XMLHttpRequest();
				req.open( "GET", path, false );
				req.send( null );
				if ( req.status != 200 ) throw req.statusText;
				return req.responseText;
			} else {
				var fs:Dynamic = untyped __js__('require("fs")');
				return fs.readFileSync( path ) + '';
			}
		#else
			return sys.io.File.getContent(path)+'';
		#end
	}
	public static function writeString( path:String, content:String ):Void {
		#if js
			if ( js.Browser.supported ) {
				throw 'Error: File writing is unsupported in the Browser environment!';
			} else {
				var fs:Dynamic = untyped __js__('require("fs")');
				fs.writeFileSync( path, content );
			}
		#else
			sys.io.File.saveContent( path, content );
		#end
	}
}