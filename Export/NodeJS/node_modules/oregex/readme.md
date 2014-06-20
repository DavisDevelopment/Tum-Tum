# ORegEx.js #
## Regular Expressions for Objects ##

ORegEx is a JavaScript (Web and/or Node) module that allows for the use of a RegEx-like grammar on Objects, rather than Strings.
Not only is ORegEx's grammar robust and powerful, it's also highly extensible, so that you can define your own helper functions, or even
 customize the way the parser handles things like:
	* Type Checking
	* Property Access
	* Property Value Testing
etc.  ORegEx does not care about whitespace, so you can have selector strings that span only one line, or hundreds, and they'll evaluate the same way.

# ORegEx Selector Filters #

* `*` : Wild Card.  Will match anything.
* `#$id` : Checks if the given object's 'id' property (if one exists) matches `$id`
* `.$class` : Checks if the given object is an instance of the class referred to by `$class`
* `..$class` : Checks if the given object is an instance of the class referred to by `$class`, or an instance of any subclass of `$class`
* `:$name` : If a helper function is registered under `$name`, then invokes the helper function on the given object, otherwise, checks if the property of the 
	given object referred to by `$name` is truthy
* `[$name]` : Checks for the existence of `$name` as a property of the given object
* `[$name = $value]` : Checks if the property `$name` of the given object is equal to `$value`
* `[$name != $value]` : Checks that the `$name` property of the given object is *not* equal to `$value`
* `[$name .= $type]` : Checks that the `$name` property of the given object is of type `$type`
* `[$name => $sel]` : Checks that the property `$name1 of the given object is matched by the nested filter `$sel`
* `($filter)` : An encapsulated filter group
* `$filterOne | $filterTwo` : Checks that the given object is matched by **either** `$filterOne` *or* `$filterTwo`
* `$filterOne & $filterTwo` : Checks that the given object is matched by **both** `$filterOne` *and* `$filterTwo`
* `$condition ? $ifTrue : $ifNot` : Ternary conditional filter.  If the given object is matched by the `$condition` filter, then
	check that it is also matched by the `$ifTrue` filter, otherwise, ensure that it is matched by the `$ifNot` filter
* `/* $comment.. */`  :  ORegEx Comment

<br><br>

# ORegEx API #
<br>
The ORegEx module exposes the following set of methods:
*	`compile` :  Takes a selector string as its only argument, and returns an ORegEx instance.
*	`parse` : Takes a selector string as its only argument, and returns the parsed selection-op tree. Mainly just for debugging purposes.
*	`lex` : Takes a selector string as its only argument, and returns the token tree.  Again, mainly for debugging.
*	`registerHelper` : Takes a string as its first argument, and a helper function as its second.  Registers that function as a helper under given name.
*	`is` : Takes a selector string as its first argument, and an object as its second.  Returns whether the given object is matched by the given filter.

## ORegEx Object Methods ##
As of right now, the only useful method of the ORegEx Object is `test`, which accepts an object as its only argument, and returns whether that object
was matched by `this` ORegEx.

# Examples #
Here's a simple example of ORegEx at work in NodeJS.

	var oregex = require("oregex");

	var obj = {
		"name" : "Ryan Davis",
		"age" : 18,
		"hobbies" : ["programming", "gaming", "..programming"],
		"exhausted" : true
	};
	var selector1 = oregex.compile("[name .= 'String'] [name = 'Ryan Davis'] [age .= Int] [age = 18] [hobbies .= 'Array'] :exhausted");
	var selector2 = oregex.compile("[name .= 'String'] [name != 'Ryan Davis'] [age .= Int] [age != 18] [hobbies .= 'Array'] :exhausted");

	selector1.test( obj ); //=> 'true'
	selector2.test( obj ); //=> 'false'

You can also find several much more extensive examples in the 'examples' folder.