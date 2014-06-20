var ore = require("./dist/oregex");
var fs = require("fs");

//- Get a selector string from a file..
var selectorString = fs.readFileSync("examples/PackageFileValidator.oreg")+'';
console.log(JSON.parse(JSON.stringify(ore.parse(selectorString))));
//- Compile selector string
var sel = ore.compile( selectorString );

//- Get the data from, say, a 'package.json' file..
var packageData = JSON.parse( fs.readFileSync("package.json")+'' );

console.log( sel.test(packageData) );