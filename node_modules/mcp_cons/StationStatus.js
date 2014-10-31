var StationStatus = function(){
    var self = this;
    self.info = [{id:0, code:'OPEN', des:"可用"},
        {id:1, code:'STOP', des:"不可用"}];
    self.infoArray = {};
    self.init();
};

StationStatus.prototype.init = function()
{
    var self = this;
    for(var key in self.info)
    {
        var set = self.info[key];
        self.infoArray[set.id] = set;
        self[set.code] = set.id;
    };
};

StationStatus.prototype.getInfoById = function(id)
{
    var self = this;
    var obj = self.info;
    if(id != undefined)
    {
        obj = self.infoArray;
        obj = obj[id];
    }
    return obj;
};

module.exports = new StationStatus();

