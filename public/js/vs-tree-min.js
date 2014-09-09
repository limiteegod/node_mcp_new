KISSY.add("vs-tree", ["./node", "./base"], function(S, require) {
    var Node = require("./node");
    var Base = require("./base");
    var Json = require("./json");
    function VsTree(container, config) {
        var self = this;
        if (!(self instanceof VsTree)) {
            return new VsTree(container, config);
        }
        self.container = container = S.one(container);
        if (!container) return;
        VsTree.superclass.constructor.call(self, config);
        self._init();
    };

    S.extend(VsTree, Base);

    VsTree.ATTRS = {
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
            value:'img/vs_tree_parent_node.png'
        },
        selected:{
            value:-1
        },
        selectedId:{
            value:""
        },
        getChildren:{
            value:undefined
        }
    };

    S.augment(VsTree, {
        _init:function()
        {
            var self = this;
            self.set("width", self.container.width());
            self.set("height", self.container.height());
            var data = [];
            var domList = self.container.one("ol");
            domList.all("li").each(function(li){
                var hasChildren = parseInt(li.attr("hasChildren"));
                data[data.length] = {_id:li.attr("value"), name:li.html(), hasChildren:hasChildren, level:0};
            });

            //build the index data,contain the position and the id of the data
            var indexData = [];
            for(var key in data)
            {
                indexData[data._id] = key + "";
            }
            self.set("indexData", indexData);

            self.set("data", data);
            console.log(data);

            self.container.html("");
            var contentDiv = '<div style="position: absolute;left: 0px;top: 0px;padding: 0px;width: ' + self.get("width") + 'px;height:' + self.get("height") + 'px;"></div>';
            self.contentDiv = Node.one(contentDiv);
            self.container.append(self._getLineHtml());
            self.container.append(self.contentDiv);
            for(var key in data)
            {
                self.contentDiv.append(self._getRowHtml(key));
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
            var data = self.get("data")[row];
            var ctlPath, ico;
            if(data.hasChildren)
            {
                ctlPath = 'img/vs_tree_parent_control_button.png';
                ico = 'img/vs_tree_parent_node.png';
            }
            else
            {
                ctlPath = 'img/vs_tree_child_control_button.png';
                ico = 'img/vs_list_ico.png';
            }
            var icoWidth = self.get("icoWidth");
            var icoHeight = self.get("icoHeight");
            var rowHeight = self.get("rowHeight");
            var width = self.get("width");
            var textWidth = width - icoWidth - 12;
            var rowStr = '<div class="clearfix" row="' + row + '">';
            //control button
            var margin_top = 4;
            rowStr += '<div _id="' + data._id + '" row="' + row + '" col="-1" class="vs_grid_content" style="width:' + 12 + 'px;height:' + rowHeight + 'px;margin-top:' + margin_top + 'px;cursor:pointer;">';
            rowStr += '<img src="' + CurSite.getAbsolutePath(ctlPath) + '" width="12" height="12">';
            rowStr += '</div>';
            //img
            rowStr += '<div row="' + row + '" col="0" class="vs_grid_content" style="width:' + icoWidth + 'px;height:' + rowHeight + 'px;">';
            rowStr += '<img src="' + ico + '" width="' + icoWidth + '" height="' + icoHeight + '">';
            rowStr += '</div>';
            rowStr += '<div row="' + row + '" col="1" class="vs_grid_content" style="margin-top:2px;width:' + textWidth + 'px;height:' + (rowHeight - 2) + 'px;">' + data.name + '</div>';
            rowStr += '</div>';
            return rowStr;
        },
        //get dotted line of tree
        _getLineHtml:function()
        {
            var self = this;
            var rowHeight = self.get("rowHeight");
            var dataLen = self.get("data").length;
            var height = rowHeight*dataLen;
            var lineStr = '<div style="width:6px;border-left:1px dotted #000000;background: none;position:absolute;left:5px;top:0px;height:' + height + 'px;">';
            lineStr += '</div>';
            return lineStr;
        },
        _setActionListener:function()
        {
            var self = this;
            //绑定事件
            self.contentDiv.children("div").each(function(item){
                console.log(item);

                item.children('div[col="-1"]').each(function(cItem){
                    cItem.on("click", function(){
                        var cNode = Node.one(this);
                        var row = cNode.attr("row");
                        var _id = cNode.attr("_id");
                        self.expand(_id);
                    });
                });

                item.children('div[col="1"]').each(function(cItem){
                    cItem.on("click", function(){
                        var cNode = Node.one(this);
                        var row = cNode.attr("row");
                        self.setSelected(row);
                    });
                });
            });

            self.contentDiv.on("focusout", function(){
                console.log("list focusout.");
            });
        },
        setSelected:function(index)
        {
            var self = this;
            if(self.get("selected") > -1)
            {
                var srcNode = self.contentDiv.one('div[row="' + self.get("selected") + '"]').one('div[col="1"]');
                srcNode.css("background", "none");
            }
            if(index > -1)
            {
                var selector = 'div[row="' + index + '"]';
                var tNode = self.contentDiv.one(selector).one('div[col="1"]');
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
        },
        //get children
        getChildren:function(_id)
        {
            var self = this;
            var cb = self.get("getChildren");
            if(cb != undefined)
            {
                return cb(_id);
            }
        },
        //expand a node
        expand:function(_id)
        {
            var self = this;
            console.log(_id);
            self.getChildren(_id);
        }
    });
    return VsTree;
});