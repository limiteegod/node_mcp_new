var Game = function(){
    var self = this;
    self.info = [
        {id:'F01', name:'双色球', playTypes:
            [
                {id:'00', name:'普通', price:200, betTypes:
                    [
                        {id:'00', name:'单式'},
                        {id:'01', name:'复式'},
                        {id:'02', name:'胆拖'}
                    ]
                }
            ]
        },
        {id:'T51', name:'竞彩足球', playTypes:
            [
                {id:'01', name:'让球胜平负', price:200, betTypes:[]},
                {id:'02', name:'胜平负', price:200, betTypes:[]}
            ]
        }
    ];
    self.infoArray = {};
    self.init();
};

//init the game tree
Game.prototype.init = function(){
    var self = this;
    for(var key in self.info)
    {
        var game = self.info[key];
        self.infoArray[game.id] = game;
        for(var pKey in game.playTypes)
        {
            var playType = game.playTypes[pKey];
            playType.parent = game;
            game[playType.id] = playType;
            for(var bkey in playType.betTypes)
            {
                var betType = playType.betTypes[bkey];
                betType.parent = playType;
                playType[betType.id] = betType;
            }
        }
    };
};

/**
 * get the game info
 * @param gameCode
 * @param playTypeCode
 * @param betTypeCode
 * @returns {*}
 */
Game.prototype.getInfo = function(gameCode, playTypeCode, betTypeCode)
{
    var self = this;
    var obj;
    if(gameCode)
    {
        obj = self.infoArray[gameCode];
    }
    else
    {
        return self.info;
    }
    if(playTypeCode)
    {
        obj = obj[playTypeCode];
    }
    if(betTypeCode)
    {
        obj = obj[betTypeCode];
    }
    return obj;
};

module.exports = new Game();