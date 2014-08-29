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
            //value:'pages/admin/operation/selectUserType.jsp'
        },
        model: {
            value:true
        },
        sureEvent:{
            value:undefined
        },
        step: {
            //from 1 to pages.length
            value:1
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
            var wId = CurSite.createUUID();
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
            var cTable = Node.one('<div style="overflow-x: hidden;position:absolute;left:5px;top:30px;width:' + cWidth + 'px;height:' + (cHeight - 25 - 30 - 4) + 'px;"></div>');
            self.titleNode = Node.one('<div style="overflow-x: hidden;border-bottom:1px solid #28afae;left:5px;top:7px;position:absolute;width:' + cWidth + 'px;height:18px;">&nbsp;' + title + '</div>');
            var frame = Node.one('<iframe id="' + wId + '" frameborder="no" border="0" style="width:' + cWidth + 'px;height:' + (cHeight - 25) + 'px;"></iframe>');
            var bottomField = Node.one('<div style="overflow-x: hidden;border-top:1px solid #28afae;left:5px;top:' + (cHeight - 30) + 'px;position:absolute;width:' + cWidth + 'px;height:28px;"></div>');
            var sureButton = Node.one('<input type="button" value="上一步" style="margin-left:' + (cWidth - 160) + 'px"/>');
            var cancelButton = Node.one('<input type="button" value="下一步" style="margin-left: 4px;"/>');
            bottomField.append(sureButton);
            bottomField.append(cancelButton);
            frame.attr("src", CurSite.getAbsolutePath(url));
            cTable.append(frame);
            self.widowDiv.append(self.titleNode);
            self.widowDiv.append(cTable);
            self.widowDiv.append(bottomField);

            self.cTable = cTable;

            //last step
            sureButton.on("click", function(){
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

            //next step
            cancelButton.on("click", function(){
                var cDoc = window.frames[wId].contentDocument;
                if(cDoc == undefined)
                {
                    cDoc = window.frames[wId].document;
                }
                var backValueElement = cDoc.getElementById("backValue");
                var backValueKissyNode = Node.one(backValueElement);
                alert(backValueKissyNode.val());

                var nextStep = parseInt(self.get("step") + 1);
                var url = self.get("pages")[nextStep - 1];
                self.frame.attr("src", CurSite.getAbsolutePath(url));
                self.set("step", nextStep);
                self.resetStepButton();
                self.setTitle();
            });
            body.append(self.widowDiv);
            self.frame = frame;
            self.sureButton = sureButton;
            self.cancelButton = cancelButton;
            self.resetStepButton();
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
            var step = parseInt(self.get("step"));
            //first step, disable the last step button
            if(step == 1)
            {
                self.sureButton.attr("disabled", true);
            }
            else
            {
                self.sureButton.removeAttr("disabled");
            }
            //the end, disable the next button
            if(step == self.get("pages").length)
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
            var title = "&nbsp;第" + self.get("step") + "步，共" + self.get("pages").length + "步";
            self.titleNode.html(title);
        }
    });
    return VsStep;
});