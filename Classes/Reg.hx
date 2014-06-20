
class Reg {
	public var regex:EReg;
	
	public function new( pattern:String, options:String ) {
		this.regex = new EReg( pattern, options );
	}
	
	public function test( text:String ):Bool {
		return this.regex.match( text );
	}
	public function matches( text:String ):Array<Array<String>> {
		var matches:Array<Array<String>> = [];
		var result:String = this.regex.map( text, function( e:EReg ) {
			var parts:Array <String> = [];
			var i:Int = 0, matched:Bool = true;
			while ( matched ) {
				try {
					e.matched( i );
				} catch ( e:String ) {
					matched = false;
					break;
				}
				parts.push( e.matched(i) );
				i++;
			}
			matches.push( parts );
			return "";
		});
		return matches;
	}
}