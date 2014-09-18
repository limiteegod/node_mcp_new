var async = require('async');

/*var openFiles = ["a", "b"];
async.each(openFiles, function(file, callback) {
    console.log(file);
    callback();
}, function(err){
    if( err ) {
        console.log('A file failed to process');
    } else {
        console.log('All files have been processed successfully');
    }
});*/


var count1 = 0;
async.whilst(
    function() { return count1 < 3 },
    function(cb) {
        console.log('1.1 count: ', count1);
        count1++;
        setTimeout(cb, 1000);
    },
    function(err) {
        // 3s have passed
        console.log('1.1 err: ', err); // -> undefined
    }
);

/*async.parallel([
    function(cb) {
        console.log("1");
        cb(null, {"id":"1"});
    },
    function(cb) {
        console.log("2");
        cb(null, {"id":"2"});
    },
    function(cb) {
        console.log("3");
        cb(null, {"id":"3"});
    }
], function (err, results) {
    console.log('1.1 err: ', err); // -> undefined
    console.log('1.1 results: ', results); // ->[ 'a400', 'a200', 'a300' ]
});*/

/*
async.waterfall([
    function(cb) {
        console.log('1.1.1');
        cb(null, 2);
    },
    function(n, cb) {
        console.log('1.1.2');
        cb(null, 3);
    },
    function(n, cb) {
        console.log('1.1.3');
        cb(null, "done");
    }
], function (err, result) {
    console.log('err: ', err); // -> null
    console.log('result: ', result); // -> 16
});*/
