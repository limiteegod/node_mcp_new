var crypto = require('crypto');

var DigestUtil = function(){
};

DigestUtil.prototype.getIv = function()
{
    var iv8 = new Buffer(8);
    for(var i = 0; i < iv8.length;)
    {
        iv8.writeInt32BE(0x00000000, i);
        i += 4;
    }
    return iv8;
}

//解密
DigestUtil.prototype.check = function(headNode, key, bodyStr)
{
    var self = this;
    if(headNode.digestType == "3des" || headNode.digestType == "3des-empty")
    {
        console.log(bodyStr);
        var decipher = crypto.createDecipheriv('des-ede3-cfb', new Buffer(key, "base64"), self.getIv());
        var dec = decipher.update(bodyStr, 'base64', 'utf8');
        dec += decipher.final('utf8');
        return dec;
    }
    return bodyStr;
};

//加密
DigestUtil.prototype.generate = function(headNode, key, bodyStr)
{
    console.log(bodyStr);
    var self = this;
    if(headNode.digestType == "3des" || headNode.digestType == "3des-empty")
    {
        var cipher = crypto.createCipheriv('des-ede3-cfb', new Buffer(key, "base64"), self.getIv());
        var crypted = cipher.update(bodyStr, 'utf8', 'base64');
        crypted += cipher.final('base64');
        return crypted;
    }
    return;
};

//md5
DigestUtil.prototype.md5 = function(text)
{
    var hasher=crypto.createHash("md5");
    hasher.update(text);
    return hasher.digest('hex'); //hashmsg为加密之后的数据
};

DigestUtil.prototype.getEmptyKey = function()
{
    var iv24 = new Buffer(24);
    for(var i = 0; i < iv24.length;)
    {
        iv24.writeInt32BE(0x00000000, i);
        i += 4;
    }
    return iv24.toString("base64");
};

/**
 * get a random key of 32
 * @returns {string}
 */
DigestUtil.prototype.createUUID = function() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "";
    var uuid = s.join("");
    return uuid;
};

var digestUtil = new DigestUtil();
module.exports = digestUtil;