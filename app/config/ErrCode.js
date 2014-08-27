var ErrCode = function()
{
    var self = this;
    self.E0000 = {code:"0000", description:"系统处理成功"};
    self.E0001 = {code:"0001", description:"参数错误"};
    self.E0002 = {code:"0002", description:"user not exists"};
    self.E0003 = {code:"0003", description:"wrong name or wrong password."};
    self.E0004 = {code:"0004", description:"message has expired"};
    self.E0005 = {code:"0005", description:"user not login"};
    self.E9999 = {code:"9999", description:"unhandled exception"};
};
module.exports = new ErrCode();