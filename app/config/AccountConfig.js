var AccountConfig = function(){
    var self = this;
    self.info = [
        {id:'RU', code:'customer', name:'彩民', accounts:[
            {id:'00', code:'cash', name:'彩金账户', types:
                [{id:'0', code:'in', name:'收入', subjects:[
                ]},
                 {id:'1', code:'out', name:'支出', subjects:[
                 ]}]
            },
            {id:'02', code:'prize', name:'奖金账户', types:
                [{id:'0', code:'in', name:'收入', subjects:[
                ]},
                {id:'1', code:'out', name:'支出', subjects:[
                ]}]
            }
        ]},
        {id:'RS', code:'station', name:'机构', accounts:[
            {id:'00', code:'cash', name:'结算账户', types:
                [{id:'0', code:'in', name:'收入', subjects:[
                    {id:'0300', code:'print', name:'出票'}
                ]},
                {id:'1', code:'out', name:'支出', subjects:[
                    {id:'0202', code:'lot', name:'投注'}
                ]}]
            }
        ]}
    ];
    self.infoArray = {};
    self.init();
};

//init the game tree
AccountConfig.prototype.init = function(){
    var self = this;
    for(var key in self.info)
    {
        var role = self.info[key];
        self[role.code] = {id:role.id};
        self.infoArray[role.id] = role;
        var accounts = role.accounts;
        for(var akey in accounts)
        {
            var account = accounts[akey];
            var aId = role.id + account.id;
            self.infoArray[aId] = account;
            self[role.code][account.code] = {id:aId};
            for(var tkey in account.types)
            {
                var type = account.types[tkey];
                var tId = aId + type.id;
                self.infoArray[tId] = type;
                self[role.code][account.code][type.code] = {id:tId};
                for(var sId in type.subjects)
                {
                    var subject = type.subjects[sId];
                    var sId = tId + subject.id;
                    self.infoArray[sId] = subject;
                    self[role.code][account.code][type.code][subject.code] = {id:sId};
                }
            }
        }
    }
};

/**
 * 根据id获得账户的详细明细
 * @param roleId
 * @param accountId
 * @param typeId
 * @param subjectId
 * @returns {*}
 */
AccountConfig.prototype.getInfo = function(roleId, accountId, typeId, subjectId)
{
    var self = this;
    if(!roleId)
    {
        return self.info;
    }
    else
    {
        var id = roleId;
        if(accountId)
        {
            id += accountId;
        }
        if(typeId)
        {
            id += typeId;
        }
        if(subjectId)
        {
            id += subjectId;
        }
        return self.infoArray[id];
    }
};

module.exports = new AccountConfig();