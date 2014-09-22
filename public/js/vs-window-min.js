KISSY.add("vs-window", ["./node", "./base"], function(S, require) {
    var Node = require("./node");
    var Base = require("./base");
    var Json = require("./json");
    function VsWindow(container, config) {
        var self = this;
        if (!(self instanceof VsWindow)) {
            return new VsWindow(container, config);
        }
        /**
         * 容器元素
         * @type {Element}
         */
        self.container = container = S.one(container);
        if (!container) return;
        VsWindow.superclass.constructor.call(self, config);
        self._init();
    };

    S.extend(VsWindow, Base);

    VsWindow.ATTRS = {
        width:{
            value:310
        },
        height:{
            value:310
        },
        title:{
            value:''
        },
        url:{
            value:'pages/admin/operation/selectParent.html'
        },
        model: {
            value:true
        },
        sureEvent:{
            value:undefined
        }
    };

    S.augment(VsWindow, {
        _init:function()
        {
            var self = this;
            var wId = CurSite.createUUID();
            var body = Node.one("body");
            var bodyWidth = document.body.clientWidth;
            var bodyHeight = window.innerHeight;
            var left = (bodyWidth - self.get("width"))/2;
            var top = (bodyHeight - self.get("height"))/2;
            var html = self.container.html();
            self.container.html("");
            self.widowDiv = Node.one('<div class="vs_div_talbe_border" style="position: absolute;left:' + left + 'px;top:' + top + 'px;width:' + self.get("width") + 'px"></div>');
            self.widowDiv.append('<div class="clearfix"><div class="vs_div_table_border_head_left"></div><div class="vs_div_table_border_head"></div><div class="vs_div_table_border_head_right"></div></div>');
            self.widowDiv.append('<div class="clearfix"><div class="vs_div_table_border_content_left"></div><div class="vs_div_table_border_content"></div><div class="vs_div_table_border_content_right"></div></div>');
            self.widowDiv.append('<div class="clearfix"><div class="vs_div_table_border_bottom_left"></div><div class="vs_div_table_border_bottom"></div><div class="vs_div_table_border_bottom_right"></div></div>');
            var divList = self.widowDiv.children();
            S.each(divList, function(row){
                Node.one(row.childNodes[1]).css("width", self.get("width") - 40);
            });
            var setHDiv = divList[1];
            S.each(setHDiv.childNodes, function(item){
                Node.one(item).css("height", self.get("height") - 40);
            });
            var cWidth = self.get("width") - 10;
            var cHeight = self.get("height") - 10;
            var cTable = Node.one('<div style="overflow-x: hidden;position:absolute;left:5px;top:26px;width:' + cWidth + 'px;height:' + (cHeight - 25 - 32) + 'px;"></div>');
            var title = Node.one('<div style="overflow-x: hidden;border-bottom:1px solid #28afae;left:5px;top:7px;position:absolute;width:' + cWidth + 'px;height:18px;">&nbsp;' + self.get("title") + '</div>');
            var frame = Node.one('<iframe id="' + wId + '" frameborder="no" border="0" style="width:' + cWidth + 'px;height:' + (cHeight - 25) + 'px;"></iframe>');
            var bottomField = Node.one('<div style="overflow-x: hidden;border-top:1px solid #28afae;left:5px;top:' + (cHeight - 30) + 'px;position:absolute;width:' + cWidth + 'px;height:28px;"></div>');
            var sureButton = Node.one('<input type="button" value="确定" style="width:50px;margin-left:' + (cWidth - 120) + 'px"/>');
            var cancelButton = Node.one('<input type="button" value="取消" style="width:50px;margin-left:5px;"/>');
            bottomField.append(sureButton);
            bottomField.append(cancelButton);
            frame.attr("src", CurSite.getAbsolutePath(self.get("url")) + "&frameId=" + wId);
            cTable.append(frame);
            self.widowDiv.append(title);
            self.widowDiv.append(cTable);
            self.widowDiv.append(bottomField);

            self.cTable = cTable;

            sureButton.on("click", function(){  //点击了确定按钮
                var sureEvent = self.get("sureEvent");
                if(sureEvent != undefined)
                {
                    var cDoc = window.frames[wId].contentDocument;
                    if(cDoc == undefined)
                    {
                        cDoc = window.frames[wId].document;
                    }
                    var backValueElement = cDoc.getElementById("backValue");
                    var backValueKissyNode = Node.one(backValueElement);
                    sureEvent(Json.parse(backValueKissyNode.val()));
                }
                self.close();
            });

            cancelButton.on("click", function(){
                self.close();
            });

            self.backDiv = Node.one('<div class="div_window_back" style="position: absolute;;left:0px;top:0px;width:' + bodyWidth + 'px;height:' + bodyHeight + 'px"></div>');
            body.append(self.backDiv);
            body.append(self.widowDiv);
        },
        setHtml:function(html)
        {
            var self = this;
            self.cTable.html(html);
        },
        close:function()    //关闭窗口
        {
            var self = this;
            self.widowDiv.remove();
            self.backDiv.remove();
        }
    });
    return VsWindow;
});