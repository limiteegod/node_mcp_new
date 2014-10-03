var moment = require("moment");

var DateUtil = function(){};

DateUtil.prototype.toString = function(date)
{
    var self = this;
    return moment(date).format("YYYY-MM-DD HH:mm:ss");
};

DateUtil.prototype.oracleToString = function(date)
{
    var self = this;
    return moment(date).format("YYYY-MM-DD HH:mm:ss");
};

DateUtil.prototype.oracleObj = function(table, obj)
{
    var self = this;
    var newObj = {};
    for(var key in obj)
    {
        var col = table.colList[key];
        if(col.type == 'date')
        {
            newObj[col.name] = moment(obj[key]).subtract("8", "h").format("YYYY-MM-DD HH:mm:ss");
        }
        else
        {
            newObj[col.name] = obj[key];
        }
    }
    return newObj;
};

DateUtil.prototype.getCurTime = function()
{
    var self = this;
    return moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
};

DateUtil.prototype.getLogTime = function()
{
    var self = this;
    return moment(new Date()).format("YYYY-MM-DD HH:mm:ss") + ",";
};

module.exports = new DateUtil();