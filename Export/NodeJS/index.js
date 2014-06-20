var mod = require("./tum-tum");

function parse( path, options ) {
	if ( options == null ) options = {};
	var proc = new mod.Preprocessor(path, options);
	return proc.preprocess( path );
}

module.exports["Preprocessor"] = mod.Preprocessor;
module.exports["parse"] = parse;