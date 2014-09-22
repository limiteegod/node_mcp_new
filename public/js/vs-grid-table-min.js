KISSY.add("vs-grid-table", ["./node", "./base"], function(S, require) {
    var Node = require("./node");
    var Base = require("./base");
    function VsGridTable(container, config) {
        var self = this;
        if (!(self instanceof VsGridTable)) {
            return new VsGridTable(container, config);
        }
        /**
         * 容器元素
         * @type {Element}
         */
        self.container = container = S.one(container);
        if (!container) return;
        VsGridTable.superclass.constructor.call(self, config);
        self._init();
    };

    S.extend(VsGridTable, Base);

    VsGridTable.ATTRS = {
        head:{
            value:[]
        },
        colName:{
            value:[]
        },
        data:{
            value:[]
        },
        select:{
            value:0
        },
        selectEvent:{
            value:undefined
        },
        rowHeight:{
            value:32
        }
    };

    S.augment(VsGridTable, {
        _init:function()
        {
            var self = this;
            var table = self.container.one("table");
            self.set("width", self.container.width());
            var theadNode = table.one("thead");
            var theadTrNode = theadNode.one("tr");
            var tbodyNode = table.one("tbody");
            var tfootNode = table.one("tfoot");

            var trNodeList = tbodyNode.all("tr");
            var rowCount = trNodeList.length + 1;   //行数
            if(tfootNode)
            {
                rowCount++;
            }
            var colCount = theadTrNode.all("td").length;    //列数目

            self.set("row", rowCount);
            self.set("col", colCount);

            table.remove();
            var widthArray = [];    //save the width of each col
            //self.divNode = Node.one('<div class="container"></div>');
            var data = new Array();
            var i = 0, j = 0;
            data[i] = new Array();
            theadTrNode.all("td").each(function(col){
                widthArray[widthArray.length] = col.width();
                data[i][j] = col.html();
                j++;
            });
            i++;
            trNodeList.each(function(row){
                j = 0;
                data[i] = new Array();
                var tdNodeList = row.all("td");
                tdNodeList.each(function(col){
                    data[i][j] = col.html();
                    j++;
                });
                i++;
            });
            //if defines the tfoot, then add to data
            if(tfootNode)
            {
                j = 0;
                data[i] = new Array();
                tfootNode.one("tr").all("td").each(function(col){
                    data[i][j] = col.html();
                    j++;
                });
            }
            console.log(widthArray);
            self.set("data", data);

            var autoHeight = rowCount*self.get("rowHeight") + 10;
            self.set("height", autoHeight);

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
            var cWidth = self.get("width") - 10;
            var cHeight = self.get("height") - 10;
            var cTable = Node.one('<div style="overflow-x: hidden;padding:0px;position:absolute;left:5px;top:5px;width:' + cWidth + 'px;height:' + cHeight + 'px;"></div>');
            var col = self.get("col");
            var row = self.get("row");
            var colWidth = cWidth/col - 1;
            var rowHeight = cHeight/row - 1 - 2;

            //the table head
            var head = data[0];
            var rowStr = '<div class="clearfix">';
            for(var i = 0; i < col - 1; i++)
            {
                rowStr += '<div row="0" col="' + i + '" class="vs_div_table_content" style="text-align:center;font-weight:bolder;width:' + colWidth + 'px;height:' + rowHeight + 'px;">' + head[i] + '</div>';
            }
            rowStr += '<div row="0" col="' + (col - 1) + '" class="vs_div_table_content_right" style="text-align:center;font-weight:bolder;width:' + (colWidth + 1) + 'px;height:' + rowHeight + 'px;">' + head[col - 1] + '</div></div>';
            cTable.append(rowStr);

            //the table content, except the bottom
            for(var j = 1; j < row - 1; j++)
            {
                var rowStr = '<div class="clearfix">';
                for(var i = 0; i < col - 1; i++)
                {
                    rowStr += '<div row="' + j + '" col="' + i + '" class="vs_div_table_content" style="width:' + colWidth + 'px;height:' + rowHeight + 'px;">' + data[j][i] + '</div>';
                }
                rowStr += '<div row="' + j + '" col="' + (col - 1) + '" class="vs_div_table_content_right" style="width:' + (colWidth + 1) + 'px;height:' + rowHeight + 'px;">' + data[j][col - 1] + '</div></div>';
                cTable.append(rowStr);
            }

            //have records, init the bottom
            if(row > 1)
            {
                var rowStr = '<div class="clearfix">';
                for(var i = 0; i < col - 1; i++)
                {
                    rowStr += '<div row="' + (row - 1) + '" col="' + i + '" class="vs_div_table_content_bottom" style="width:' + colWidth + 'px;height:' + (rowHeight + 1) + 'px;">' + data[row-1][i] + '</div>';
                }
                rowStr += '<div row="' + (row - 1) + '" col="' + (col - 1) + '" class="vs_div_table_content_bottom_right" style="width:' + (colWidth + 1) + 'px;height:' + (rowHeight + 1) + 'px;">' + data[row-1][col-1] + '</div></div>';
                cTable.append(rowStr);
            }

            self.container.append(cTable);
            self.cTable = cTable;

            //绑定事件
            cTable.all(".vs_div_table_content").each(function(item){
                var colIndex = parseInt(item.attr("col"));
                item.width(widthArray[colIndex] - 2);
                item.on("click", function(){
                    var clickRow = Node.one(this).attr("row");
                    self.setSelected(clickRow);
                });
            });

            //绑定事件
            cTable.all(".vs_div_table_content_right").each(function(item){
                var colIndex = parseInt(item.attr("col"));
                item.width(widthArray[colIndex] - 2);
                item.on("click", function(){
                    var clickRow = Node.one(this).attr("row");
                    self.setSelected(clickRow);
                });
            });

            //绑定事件
            cTable.all(".vs_div_table_content_bottom").each(function(item){
                var colIndex = parseInt(item.attr("col"));
                item.width(widthArray[colIndex] - 2);
                item.on("click", function(){
                    var clickRow = Node.one(this).attr("row");
                    self.setSelected(clickRow);
                });
            });

            //绑定事件
            cTable.all(".vs_div_table_content_bottom_right").each(function(item){
                var colIndex = parseInt(item.attr("col"));
                item.width(widthArray[colIndex] - 2);
                item.on("click", function(){
                    var clickRow = Node.one(this).attr("row");
                    self.setSelected(clickRow);
                });
            });

        },
        setSelected:function(index)
        {
            var self = this;
            //先取消上一次选中
            var select = self.get("select");
            self.setUnSelected(select);

            self.set("select", index);
            var row = self.cTable.children();
            for(var i = 0; i < row.length; i++)
            {
                if(i == index)       //改变当前行
                {
                    var rItem = row[i];
                    S.each(rItem.childNodes, function(tItem){
                        Node.one(tItem).css("background-color", "#EEEEEE");
                    });
                }
            }
            //触发外部定义的选择事件
            if(index > 0)
            {
                var selectEvent = self.get("selectEvent");
                if(selectEvent != undefined)
                {
                    selectEvent(self.get("data")[index - 1]);
                }
            }
        },
        setUnSelected:function(index)
        {
            var self = this;
            self.set("select", -1);
            var row = self.cTable.children();
            for(var i = 0; i < row.length; i++)
            {
                if(i == index)       //改变当前行
                {
                    var rItem = row[i];
                    S.each(rItem.childNodes, function(tItem){
                        Node.one(tItem).css("background", "none");
                    });
                }
            }
        },
        getSelectedId:function()
        {
            var self = this;
            var select = self.get("select");
            if(select > 0)
            {
                return self.get("data")[select - 1]["id"];
            }
            else {
                return null;
            }
        }
    });
    return VsGridTable;
});