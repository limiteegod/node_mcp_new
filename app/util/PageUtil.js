var PageUtil = function(){};

PageUtil.prototype.get = function(skip, limit, count)
{
    var pi = {};
    pi.number = parseInt(skip/limit) + 1; //当前页号，从1开始
    pi.size = limit; //每页记录条数
    pi.totalPages = parseInt(count/limit); //总共有多少页
    var tmp = count%limit;
    if(tmp > 0)
    {
        pi.totalPages + 1;
    }
    //当前页记录条数
    if(tmp > 0 && pi.number == pi.totalPages)
    {
        pi.numberOfElements = tmp;
    }
    else
    {
        pi.numberOfElements = limit;
    }
    //所有记录条数
    pi.totalElements = count;
    if(pi.number > 1)
    {
        pi.hasPreviousPage = true;
    }
    else
    {
        pi.hasPreviousPage = false;
    }
    //是否是第一页
    if(pi.number == 1)
    {
        pi.firstPage = true;
    }
    else
    {
        pi.firstPage = false;
    }
    //是否有后一页
    if(pi.number < pi.totalPages)
    {
        pi.hasNextPage = true;
    }
    else
    {
        pi.hasNextPage = false;
    }
    //是否是最后一页
    if(pi.number == pi.totalPages)
    {
        pi.lastPage = true;
    }
    else
    {
        pi.lastPage = false;
    }
    return pi;
};


module.exports = new PageUtil();