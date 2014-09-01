KISSY.add("vs-step", ["./node", "./base"], function(S, require) {
    var Node = require("./node");
    var Base = require("./base");
    var Json = require("./json");
    function VsStep(container, config) {
        var self = this;
        if (!(self instanceof VsStep)) {
            return new VsStep(container, config);
        }
        /**
         * 容器元素
         * @type {Element}
         */
        self.container = container = S.one(container);
        if (!container) return;
        VsStep.superclass.constructor.call(self, config);
        self._init();
    };

    S.extend(VsStep, Base);

    VsStep.ATTRS = {
        width:{
            value:310
        },
        height:{
            value:310
        },
        title:{
            value:''
        },
        pages:{
            value:new Array()
        },
        model: {
            value:true
        },
        sureEvent:{
            value:undefined
        },
        step: {
            //from 0 to pages.length - 1
            value:-1
        },
        data: {
            //array to save the step data
            value:[]
        }
    };

    S.augment(VsStep, {
        _init:function()
        {
            var self = this;
            var title = "第" + self.get("step") + "步，共" + self.get("pages").length + "步";
            var step = parseInt(self.get("step") - 1);
            var url = self.get("pages")[step];
            self.wId = CurSite.createUUID();
            var body = self.container;
            var bodyWidth = self.container.width();
            var bodyHeight = self.container.height();
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
            self.cTable = Node.one('<div style="overflow-x: hidden;position:absolute;left:5px;top:30px;width:' + cWidth + 'px;height:' + (cHeight - 25 - 30 - 4) + 'px;"></div>');
            self.titleNode = Node.one('<div style="overflow-x: hidden;border-bottom:1px solid #28afae;left:5px;top:7px;position:absolute;width:' + cWidth + 'px;height:18px;">&nbsp;' + title + '</div>');
            var iFrame = document.createElement("iframe");

            //iframe onload event
            iFrame.onload = function() {
                self.setTitle();
            };

            self.frame = Node.one(iFrame);
            self.frame.attr("id", self.wId);
            self.frame.attr("frameborder", "no");
            self.frame.attr("border", "0");
            self.frame.attr("style", 'width:' + cWidth + 'px;height:' + (cHeight - 25) + 'px;');

            //self.frame = Node.one('<iframe id="' + self.wId + '" frameborder="no" border="0" style="width:' + cWidth + 'px;height:' + (cHeight - 25) + 'px;"></iframe>');

            var bottomField = Node.one('<div style="overflow-x: hidden;border-top:1px solid #28afae;left:5px;top:' + (cHeight - 30) + 'px;position:absolute;width:' + cWidth + 'px;height:28px;"></div>');
            self.sureButton = Node.one('<input type="button" value="上一步" style="margin-left:' + (cWidth - 160) + 'px"/>');
            self.cancelButton = Node.one('<input type="button" value="下一步" style="margin-left: 4px;"/>');
            bottomField.append(self.sureButton);
            bottomField.append(self.cancelButton);
            self.cTable.append(self.frame);

            self.widowDiv.append(self.titleNode);
            self.widowDiv.append(self.cTable);
            self.widowDiv.append(bottomField);

            //last step
            self.sureButton.on("click", function(){
                self.toLastPage();
            });

            //next step
            self.cancelButton.on("click", function(){
                self.toNextPage();
            });
            body.append(self.widowDiv);

            self.toPage(0);
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
        },
        //when step changes, change the status of control buttons
        resetStepButton:function()
        {
            var self = this;
            var step = self.get("step");
            console.log("step..........." + step);
            //first step, disable the last step button
            if(step == 0)
            {
                self.sureButton.attr("disabled", true);
            }
            else
            {
                self.sureButton.removeAttr("disabled");
            }
            //the end, disable the next button
            if(step == self.get("pages").length - 1)
            {
                self.cancelButton.attr("disabled", true);
            }
            else
            {
                self.cancelButton.removeAttr("disabled");
            }
        },
        setTitle:function()
        {
            var self = this;
            var cDoc = CurSite.getFrameDocById(self.wId);
            var title = cDoc.getElementsByTagName("title")[0];
            if(title)
            {
                self.titleNode.html(title.innerText);
            }
        },
        toPage:function(index)
        {
            var self = this;
            var step = self.get("step");
            if(step > -1)
            {
                //get step data from page
                var cDoc = CurSite.getFrameDocById(self.wId);
                var backValueElement = cDoc.getElementById("backValue");
                var backValueKissyNode = Node.one(backValueElement);
                backValueKissyNode.fire("click");
                self.get("data")[step] = Json.parse(CurSite.decrypt({digestType:"3des-empty"}, null, backValueKissyNode.val()));
            }
            console.log(step);
            self.set("step", index);
            var url = self.get("pages")[index];
            var data = self.get("data");
            var encodedBody = CurSite.encrypt({digestType:"3des-empty"}, null, Json.stringify(data)).body;
            console.log(encodedBody);
            self.frame.attr("src", url + "?data=" + encodeURIComponent(encodedBody));
            self.setTitle();
            self.resetStepButton();
            //alert(dataStr);
        },
        toNextPage:function()
        {
            var self = this;
            var step = self.get("step");
            if(step < self.get("pages").length - 1)
            {
                self.toPage(step + 1);
            }
        },
        toLastPage:function()
        {
            var self = this;
            var step = self.get("step");
            if(step > 0)
            {
                self.toPage(step - 1);
            }
        }
    });
    return VsStep;
});