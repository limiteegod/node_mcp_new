var esut = require('easy_util');
var digestUtil = esut.digestUtil;
var prop = require("../config/Prop.js");
var dc = require("../config/DbCenter.js");
var ec = require("../config/ErrCode.js");
var log = esut.log;

var DigestService = function(){};

/**
 * 暂时支持3种密钥来源
 * @param fromType
 */
DigestService.prototype.getKey = function(info, cb)
{
    if(info.fromType == prop.digestFromType.NONE)
    {
        cb(null, digestUtil.getEmptyKey());
    }
    else if(info.fromType == prop.digestFromType.DB)
    {
        if(info.userType == prop.userType.ADMINISTRATOR)
        {
            var adminiTable = dc.main.get("admini");
            adminiTable.findOne({name:info.userId}, {}, [], function(err, data){
                log.info(data);
                if(err)
                {
                    cb(ec.E9999);
                }
                else
                {
                    if(data)
                    {
                        cb(null, digestUtil.md5(data.password));
                    }
                    else
                    {
                        cb(ec.E9001);
                    }
                }
            });
        }
    }
    else if(info.fromType == prop.digestFromType.CACHE)
    {
        var stInfoTable = dc.mg.get("stInfo");
        stInfoTable.findOne({_id:info.userId}, {}, [], function(err, data){
            if(err)
            {
                cb(ec.E9999);
            }
            else
            {
                if(data)
                {
                    var now = new Date();
                    if(now.getTime() - data.lastActiveTime > prop.loginExpiredSeconds*1000)
                    {
                        cb(ec.E9004);
                    }
                    else
                    {
                        var key = data.st;
                        stInfoTable.update({_id:info.userId}, {$set:{lastActiveTime:new Date().getTime()}}, [], function(err, data){
                            cb(null, key);
                        });
                    }
                }
                else
                {
                    cb(ec.E9001)
                }
            }
        });
    }
    else
    {
        cb(ec.E9002);
    }
};

module.exports = new DigestService();