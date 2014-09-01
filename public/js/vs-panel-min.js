KISSY.add("vs-panel", ["./node", "./base"], function(S, require) {
    var Node = require("./node");
    var Base = require("./base");
    function VsPanel(container, config) {
        var self = this;
        if (!(self instanceof VsPanel)) {
            return new VsPanel(container, config);
        }
        /**
         * 容器元素
         * @type {Element}
         */
        self.container = container = S.one(container);
        if (!container) return;
        VsPanel.superclass.constructor.call(self, config);
        self._init();
    };

    S.extend(VsPanel, Base);

    VsPanel.ATTRS = {
    };

    S.augment(VsPanel, {
        _init:function()
        {
            var self = this;
            self.set("width", self.container.width());
            self.set("height", self.container.height());
            var html = self.container.html();
            self.set("title", self.container.attr("title"));
            self.container.html("");
            self.container.addClass("vs_div_talbe_border");
            self.container.append('<div class="clearfix"><div class="vs_div_table_border_head_left"></div><div class="vs_div_table_border_head"></div><div class="vs_div_table_border_head_right"></div></div>');
            self.container.append('<div class="clearfix"><div class="vs_div_table_border_content_left"></div><div class="vs_div_table_border_content"></div><div class="vs_div_table_border_content_right"></div></div>');
            self.container.append('<div class="clearfix"><div class="vs_div_table_border_bottom_left"></div><div class="vs_div_table_border_bottom"></div><div class="vs_div_table_border_bottom_right"></div></div>');
            var divList = self.container.children();
            S.each(divList, function(row){
                Node.one(row.childNodes[1]).css("width", self.get("width") - 40);
            });
            var setHDiv = divList[1];
            S.each(setHDiv.childNodes, function(item){
                Node.one(item).css("height", self.get("height") - 40);
            });
            var cWidth = self.get("width") - 10 - 12;
            var cHeight = self.get("height") - 10 - 12;
            var title = Node.one('<div style="overflow-x: hidden;border-bottom:1px solid #28afae;left:5px;top:7px;position:absolute;width:' + (self.get("width") - 10) + 'px;height:18px;">&nbsp;' + self.get("title") + '</div>');
            var cTable = Node.one('<div style="overflow-x: hidden;padding:6px;position:absolute;left:5px;top:25px;width:' + cWidth + 'px;height:' + (cHeight - 20) + 'px;"></div>');
            self.container.append(title);
            self.container.append(cTable);
            cTable.html(html);
            self.cTable = cTable;
        },
        setHtml:function(html)
        {
            var self = this;
            self.cTable.html(html);
        }
    });
    return VsPanel;
});