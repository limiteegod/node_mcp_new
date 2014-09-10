var addon = require('./my_modules/fn/build/Release/fn');

//console.log(addon.hello()); // 'world'

//console.log( 'This should be eight:', addon.add(3,5));

/*addon(function(msg){
    console.log(msg);
});*/

/*var obj1 = addon('hello');
var obj2 = addon('world');
console.log(obj1.msg+' '+obj2.msg); // 'hello world'*/

var fn = addon();
console.log(fn()); // 'hello world'
