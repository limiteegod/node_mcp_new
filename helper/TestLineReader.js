var lineReader = require('line-reader');

var async = require('async');

var dc = require('mcp_dao').dc;

var esut = require("easy_util");
var log = esut.log;

async.waterfall([
    function(cb)
    {
        dc.init(function(err){
            cb(err);
        });
    },
    //start web
    function(cb)
    {
        var colName = 'term_draw_ticket_' + 'F01' + "_" + '2014146';
        var conn = dc.mg.getConn();
        var table = conn.collection(colName);
        lineReader.eachLine('/data/app/20141462.txt', function(line, last, callback) {
            var start = 0;
            var end = 0;
            var inString = false;
            var rst = [];
            var lastChar = '0';
            for(var i = 0; i < line.length; i++)
            {
                var c = line.charAt(i);
                if(c == '#' || i == line.length - 1)
                {
                    if(!inString)
                    {
                        if(i < line.length - 1)
                        {
                            end = i - 1;
                        }
                        else
                        {
                            end = i;
                        }
                        if(lastChar == "'")
                        {
                            rst[rst.length] = line.substring(start + 1, end);
                        }
                        else
                        {
                            rst[rst.length] = line.substring(start, end + 1);
                        }
                        start = i + 1;
                    }
                }
                if(c == "'")
                {
                    if(!inString)
                    {
                        start = i;
                    }
                    inString = !inString;
                }
                lastChar = c;
            }
            var ticket = {};
            ticket._id = rst[0];
            ticket.orderId = rst[1];
            ticket.seq = parseInt(rst[2]);
            ticket.finishedCount = parseInt(rst[3]);
            ticket.stationId = rst[4];
            ticket.customerId = rst[5];
            ticket.channelCode = rst[6];
            ticket.termCode = rst[7];
            ticket.gameCode = rst[8];
            ticket.betTypeCode = rst[9];
            ticket.playTypeCode = rst[10];
            ticket.amount = parseInt(rst[11]);
            ticket.multiple = parseInt(rst[12]);
            ticket.price = parseInt(rst[13]);
            ticket.numbers = rst[14];
            ticket.termIndex = parseInt(rst[15]);
            ticket.termIndexDeadline = rst[16];
            ticket.acceptTime = rst[17];
            ticket.createTime = rst[18];
            ticket.printTime = rst[19];
            ticket.type = parseInt(rst[20]);
            ticket.bigBonus = parseInt(rst[21]);
            ticket.bonus = parseInt(rst[22]);
            ticket.bonusBeforeTax = parseInt(rst[23]);
            ticket.possiblePrize = parseInt(rst[24]);
            ticket.receiptStatus = parseInt(rst[25]);
            ticket.status = parseInt(rst[26]);
            ticket.paper = parseInt(rst[27]);
            ticket.printerStationId = rst[28];
            ticket.sysTakeTime = rst[29];
            ticket.version = parseInt(rst[30]);

            console.log(ticket);
            table.save(ticket, [], function(err, data){
                if (last) {
                    callback(false); // stop reading
                }
                else
                {
                    callback();
                }
            });
        }).then(function () {
            cb(null, "finished--------------------------");
        });;
    }
], function (err, rst) {
    log.info("执行结果---------------");
    log.info(err);
    log.info(rst);
});

