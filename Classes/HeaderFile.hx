
class HeaderFile {
	public static function compile( prep:Preprocessor, content:String ):Void {
		var vm:GryffinScriptRuntime = new GryffinScriptRuntime();
		vm.bindBuiltins();
		vm.runString( content );
		var defs:Dynamic = vm.loadValue("exports");
		for ( key in Reflect.fields(defs) ) {
			Reflect.setProperty( prep.defs, key, Reflect.getProperty(defs, key) );	
		}
		
	}
}
