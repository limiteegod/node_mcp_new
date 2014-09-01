KISSY.add("vs-list", ["./node", "./base"], function(S, require) {
    var Node = require("./node");
    var Base = require("./base");
    var Json = require("./json");
    function VsList(container, config) {
        var self = this;
        if (!(self instanceof VsList)) {
            return new VsList(container, config);
        }
        self.container = container = S.one(container);
        if (!container) return;
        VsList.superclass.constructor.call(self, config);
        self._init();
    };

    S.extend(VsList, Base);

    VsList.ATTRS = {
        icoWidth:{
            value:20
        },
        icoHeight:{
            value:20
        },
        rowHeight:{
            value:24
        },
        ico:{
            value:'vs_list_ico.png'
        },
        selected:{
            value:-1
        },
        selectedId:{
            value:""
        }
    };

    S.augment(VsList, {
        _init:function()
        {
            var self = this;
            self.set("width", self.container.width());
            self.set("height", self.container.height());
            var data = [];
            var domList = self.container.one("ol");
            domList.all("li").each(function(li){
                data[data.length] = {_id:li.attr("value"), name:li.html()};
            });
            self.set("data", data);
            console.log(data);

            self.container.html("");
            for(var key in data)
            {
                self.container.append(self._getRowHtml(key));
            }

            var selected = self.get("selected");
            var selectedId = self.get("selectedId");
            if(selected == -1 && selectedId.length > 0)
            {
                self.setSelectedId(selectedId);
            }
            else
            {
                self.setSelected(selected);
            }
            self._setActionListener();
        },
        _getRowHtml:function(row)
        {
            var self = this;
            var icoWidth = self.get("icoWidth");
            var icoHeight = self.get("icoHeight");
            var rowHeight = self.get("rowHeight");
            var width = self.get("width");
            var textWidth = width - icoWidth;
            var data = self.get("data")[row];
            var rowStr = '<div class="clearfix" row="' + row + '">';
            rowStr += '<div row="' + row + '" col="0" class="vs_grid_content" style="width:' + icoWidth + 'px;height:' + rowHeight + 'px;">';
            rowStr += '<img src="' + CurSite.getAbsolutePath("img/vs_list_ico.png") + '" width="' + icoWidth + '" height="' + icoHeight + '">';
            rowStr += '</div>';
            rowStr += '<div row="' + row + '" col="1" class="vs_grid_content" style="margin-top:2px;width:' + textWidth + 'px;height:' + (rowHeight - 2) + 'px;">' + data.name + '</div>';
            rowStr += '</div>';
            return rowStr;
        },
        _setActionListener:function()
        {
            var self = this;
            //绑定事件
            self.container.children("div").each(function(item){
                console.log(item);
                item.on("click", function(){
                    var curNode = Node.one(this);
                    var clickRow = parseInt(curNode.attr("row"));
                    self.setSelected(clickRow);
                });
            });

            self.container.on("focusout", function(){
                console.log("list focusout.");
            });
        },
        setSelected:function(index)
        {
            var self = this;
            if(self.get("selected") > -1)
            {
                var srcNode = self.container.one('div[row="' + self.get("selected") + '"]');
                srcNode.css("background", "none");
            }
            if(index > -1)
            {
                var selector = 'div[row="' + index + '"]';
                var tNode = self.container.one(selector);
                tNode.css("background", "#DDDDDD");

                var selectedDataNode = self.get("data")[index];
                self.set("selectedId", selectedDataNode._id);
            }
            else
            {
                self.set("selectedId", "");
            }
            self.set("selected", index);
        },
        //set selection by data._id
        setSelectedId:function(id)
        {
            var self = this;
            var data = self.get("data");
            for(var key in data)
            {
                if(data[key]._id == id)
                {
                    self.setSelected(key);
                    break;
                }
            }
        },
        getSelectedData:function()
        {
            var self = this;
            if(self.get("selected") > -1)
            {
                return self.get("data")[self.get("selected")];
            }
            else
            {
                return null;
            }
        }
    });
    return VsList;
});