var cronJob = require("cron").CronJob;

//每秒钟执行一次
new cronJob('* * * * * *', function () {
    console.log("cron job");
}, null, true, 'Asia/Shanghai');

/*
//每隔30秒执行一次，会在0秒和30秒处执行
new cronJob('*//*
30 * * * * *', function () {
    //your job code here
}, null, true, 'Asia/Chongqing');
//从早上8点到下午18点，每隔半个小时执行一次，会在0分和30分处执行
new cronJob('* *//*
30 8-18 * * *', function () {
    //your job code here
}, null, true, 'Asia/Chongqing');
//在每天的10点和18点的第26分钟各执行一次
new cronJob('* 26 10,18 * * *', function () {
    //your job code here
}, null, true, 'Asia/Chongqing');*/
