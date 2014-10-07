var ErrCode = function()
{
    var self = this;
    self.E0000 = {repCode:"0000", description:"系统处理成功"};
    self.E0001 = {repCode:"0001", description:"校验签名失败"};
    self.E0002 = {repCode:"0002", description:"user not exists"};
    self.E0003 = {repCode:"0003", description:"wrong name or wrong password."};
    self.E0004 = {repCode:"0004", description:"message has expired"};
    self.E0005 = {repCode:"0005", description:"user not login"};
    self.E1007 = {repCode:"1007", description:'账户余额不足'};
    self.E2003 = {repCode:'2003', description:'期次不存在'};
    self.E2005 = {repCode:'2005', description:'订单不存在'};
    self.E2008 = {repCode:'2008', description:'不是当前期'};
    self.E2035 = {repCode:"2035", description:"投注站不存在"};
    self.E2057 = {repCode:"2057", description:"处于不允许的状态"};
    self.E0999 = {repCode:"0999", description:"系统内部错误"};
    self.E9000 = {repCode:"9000", description:"不支持的数据库类型"};
    self.E9999 = {repCode:"9999", description:"unhandled exception"};

    self.E2058 = {repCode:'2058', description:'JSON格式转换出错'};
    self.E2059 = {repCode:'2059', description:'系统繁忙'};

    self.E3001 = {repCode:'3001', description:'票据不存在'};
    self.E3002 = {repCode:'3002', description:'票据已经失效'};
};
module.exports = new ErrCode();