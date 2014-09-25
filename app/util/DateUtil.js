var moment = require("moment");

var DateUtil = function(){};

DateUtil.prototype.toString = function(date)
{

};

DateUtil.prototype.oracleToString = function(date)
{
    var self = this;
    return moment(date).format("YYYY-MM-DD HH:mm:ss");
};

DateUtil.prototype.oracleObj = function(table, obj)
{
    var self = this;
    for(var key in obj)
    {
        if(table.columns[key].type == 'date')
        {
            obj[key] = moment(date).format("YYYY-MM-DD HH:mm:ss");
        }
    }
};

DateUtil.prototype.getLogTime = function()
{
    var self = this;
    return moment(new Date()).format("YYYY-MM-DD HH:mm:ss") + ",";
};

module.exports = new DateUtil();