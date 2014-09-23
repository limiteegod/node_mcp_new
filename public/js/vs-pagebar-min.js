KISSY.add("vs-pagebar", ["./node", "./base"], function(S, require) {
    var Node = require("./node");
    var Base = require("./base");
    function VsPagebar(container, config) {
        var self = this;
        if (!(self instanceof VsPagebar)) {
            return new VsPagebar(container, config);
        }
        /**
         * 容器元素
         * @type {Element}
         */
        self.container = container = S.one(container);
        if (!container) return;
        VsPagebar.superclass.constructor.call(self, config);
        self._init();
    };

    S.extend(VsPagebar, Base);

    VsPagebar.ATTRS = {
        count:{
            value:0
        },
        cur:{
            value:1
        },
        limit:{
            value:20
        },
        toPage:{
            value:undefined
        }
    };

    S.augment(VsPagebar, {
        _init:function()
        {
            var self = this;
            var count = self.get("count");
            var size = self.get("limit");
            var cur = self.get("cur");
            var pageCount = parseInt(count/size);
            self.set("pageCount", pageCount);
            if(count%size > 0)
            {
                pageCount++;
            }

            var pStr = self._getDetailPage(cur, pageCount);
            var html = '<div class="vs_grid_plain">共' + count + '条记录,</div>';
            html += '<div class="vs_grid_plain">共' + pageCount + '页</div>';
            if(count > 0)
            {
                html += '<div class="vs_grid_plain">,第</div>';
                html += pStr;
                html += '<div class="vs_grid_plain">页</div>';
            }
            self.container.html(html);

            //绑定事件
            self.container.all(".vs_page_index_unselected").each(function(item){
                item.on("click", function(){
                    var toPage = parseInt(Node.one(this).html());
                    var toPageFunc = self.get("toPage");
                    if(toPageFunc)
                    {
                        toPageFunc(toPage);
                    }
                });
            });
        },
        _getDetailPage:function(cur, pageCount)
        {
            var self = this;
            var pArray;
            if(pageCount <= 9)
            {
                pArray = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            }
            else
            {
                if(cur <= 3)
                {
                    pArray = [1, 2, 3, 4, -1, pageCount - 1, pageCount];
                }
                else if(pageCount - cur <= 2)
                {
                    pArray = [1, 2, -1, pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
                }
                else
                {
                    pArray = [1, 2, -1, cur -1, cur, cur + 1, -1, pageCount - 1, pageCount];
                }
            }
            return self._getIndexHtml(cur, pArray, pageCount);
        },
        _getIndexHtml:function(cur, pArray, pageCount)
        {
            var str = '';
            for(var key in pArray)
            {
                var pIndex = pArray[key];
                if(pIndex < 0)
                {
                    str += '<div class="vs_grid_plain">...&nbsp;</div>';
                }
                else if(pIndex <= pageCount)
                {
                    var cls = 'vs_page_index_unselected';
                    if(pIndex == cur)
                    {
                        cls = 'vs_page_index_selected';
                    }
                    str += '<div class="' + cls + '">' + pIndex + '</div>';
                }
            }
            return str;
        }
    });
    return VsPagebar;
});