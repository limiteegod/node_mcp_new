var os = require('os');
var p = require('procstreams');

var OsUtil = function(){
    var self = this;
    self.ipReg = /^192\.168/;
};

OsUtil.prototype.getLocaleIp = function()
{
    var self = this;
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
        var faceArray = ifaces[dev];
        for(var faceArrayKey in faceArray)
        {
            var face = faceArray[faceArrayKey];
            if(face.address.match(self.ipReg))
            {
                return face.address;
            }
        }
    }
    return null;
};

/**
 * get process info, return null if not exist
 * @param key
 */
OsUtil.prototype.getProcessInfo = function(key, cb)
{
    p("ps aux").pipe('grep ' + key).data(function (err, stdout, stderr) {
        if(err)
        {
            cb(null);
        }
        else
        {
            if(stdout)
            {
                var backStr = stdout.toString("utf8").trim();
                //console.log(backStr);
                var lines = backStr.split("\n");
                for(var index in lines)
                {
                    var line = lines[index];
                    var lineArray = line.split(/\s+/);
                    if(lineArray[10] == key)
                    {
                        cb(lineArray);
                        return;
                    }
                }
            }
            cb(null);
        }
    });
};

module.exports = new OsUtil();