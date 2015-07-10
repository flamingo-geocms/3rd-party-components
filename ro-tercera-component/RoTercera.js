/*
 * Copyright (C) 2012-2014 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Ro Tercera component
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.RoTercera",{
    extend: "viewer.components.Component",
    panel: null,
    minWidth: 280,
    minHeight: 580,
    comboWidth: 200,
    resourceUrl: null,
    //stores
    ownerStore: null,
    typeStore: null,
    statusStore: null,
    //combo boxes
    ownerCombo: null,
    typeCombo: null,
    statusCombo: null,

    docContainer: null,
    planContainer: null,
    legendaButton: null,
    drawCommentButton: null,
    showAllCommentButton: null,
    selectedPlanContainer: null,

    currentPlans:null,
    selectedPlan:null,
    previouslySelectedPlan:null,

    wmsLayer: null,
    highlightLayer: null,
    sldUrl: null,

    roToc: null,
    roComment: null,

    roLegendUrl: null,

    publicCommentfilter: null,
    planCommentFilter: null,

    commentAppLayer: null,
    commentMapLayer: null,
    commentLayerIndex: null,

    customInfoEnabled: false,
    previousSLDFid: null,
    wmsLayerId: "ulRooTercera",

    previousState: null,
    zoomToPlan :null,
    config:{
        name: "Ro-Tercera client",
        title: "",
        titlebarIcon : "",
        tooltip : "",
        label: "",
        //TODO: make configurable
        roServiceUrl: "",
        terceraRequestPage: "https://tercera.provincie-utrecht.nl/RequestPage.aspx",
        roonlineLayers: null,
        roonlineServiceUrl: null,
        layers: null
    },
    /**
     * @constructor
     * creating a Ro tercera component
     */
    constructor: function (conf){
        conf=this.setDefaults(conf);
        this.zoomToPlan = true;
        this.resourceUrl = "";
        if (actionBeans && actionBeans["componentresource"]){
            this.resourceUrl=actionBeans["componentresource"];
        }
        this.resourceUrl=Ext.String.urlAppend(this.resourceUrl,"className=viewer.components.RoTercera")

        conf.iconUrl=Ext.String.urlAppend(this.resourceUrl,"resource=resources/images/icon16_gray.png");
        this.roLegendUrl = Ext.String.urlAppend(this.resourceUrl,"resource=resources/images/roLegend.png");
        viewer.components.RoTercera.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        var me = this;

        if(this.hasButton == null || this.hasButton){
            this.renderButton({
                handler: function(){
                    me.buttonClick();
                },
                text: me.config.title,
                icon: Ext.String.urlAppend(me.resourceUrl,"resource=resources/images/icon38_gray.png"),
                tooltip: me.config.tooltip,
                label: me.config.label
            });
        }
        this.roToc = Ext.create("viewer.components.rotercera.RoToc",{});
        this.roComment = Ext.create("viewer.components.rotercera.RoComment",conf,this);
        this.roAllComment = Ext.create("viewer.components.rotercera.RoAllComment",conf,this);
        this.parser = Ext.create("viewer.components.rotercera.IdentifyParser",{},this);
        var me = this;

        this.addStyleSheet();

        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,this.onAddLayer,this);

        return this;
    },
    getBookmarkState : function(shortUrl){
    	if(this.ownerCombo === null || this.selectedPlan === null){ // not yet opened or no plan selected. In both situations, do not use it in the bookmark
    		return null;
    	}
        var state = {
            selectedPlan: this.selectedPlan,
            commentAppLayerId: this.commentAppLayer ? this.commentAppLayer.id : -1,
            overheidscode: this.ownerCombo.getValue(),
            enableType: this.typeCombo.getValue() !== null,
            enableStatus: this.statusCombo.getValue() !== null,
            openWindow: this.popup.isVisible()
        };
        return state;
    },
    loadVariables : function(state){
        var jsonState = Ext.JSON.decode(state);
        this.previousState = jsonState;
        this.getViewerController().addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE,this.restoreState,this);
    },

    restoreState : function(){
        this.zoomToPlan = false;
        this.removeListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE,this.restoreState,this);
        if(this.previousState ){
            var me = this;
            var plan = this.previousState.selectedPlan;
            var eigenaar = this.previousState.overheidscode;
            var commentAppLayerId = this.previousState.commentAppLayerId;
            for (var i=0; i< me.viewerController.app.selectedContent.length; i++){
                var contentItem = me.viewerController.app.selectedContent[i];
                if (contentItem && contentItem.id === "l"+me.wmsLayerId){
                    Ext.Array.remove(me.viewerController.app.selectedContent, contentItem);
                    break;
                }
            }

            for (var i=0; i< me.viewerController.app.selectedContent.length; i++){
                var contentItem = me.viewerController.app.selectedContent[i];
                if (contentItem && contentItem.id === "l"+commentAppLayerId){
                    Ext.Array.remove(me.viewerController.app.selectedContent, contentItem);
                    break;
                }
            }
            

            Ext.Array.remove(this.viewerController.app.levels, this.viewerController.app.levels["l"+me.wmsLayerId]);
            Ext.Array.remove(this.viewerController.app.levels, this.viewerController.app.levels["l"+commentAppLayerId]);
            var f = function(){
                if(this.previousState.enableType){
                    this.typeCombo.setValue(plan.typePlan);    
                }
                if(this.previousState.enableStatus){
                    this.statusCombo.setValue(plan.planstatus);
                }
                this.onPlanClicked (plan);
                this.removeListener("ownerchanged",f,this);
            };
            this.addListener("ownerchanged",f,this);
            this.buttonClick();
            if(!this.previousState.openWindow){
                this.popup.hide();
            }
            if(eigenaar){
                this.ownerCombo.setValue(eigenaar);
            }
        }
    },
    setDefaults: function(conf){
        //set minWidth:
        if(conf.details.width < this.minWidth || !Ext.isDefined(conf.details.width)) conf.details.width = this.minWidth;
        //set minHeight:
        if(conf.details.height < this.minHeight || !Ext.isDefined(conf.details.height)) conf.details.height = this.minHeight;

        if (Ext.isEmpty(conf.roonlineServiceUrl)){
            conf.roonlineServiceUrl="http://afnemers.ruimtelijkeplannen.nl/afnemers/services";
        }if (Ext.isEmpty(conf.roonlineLayers)){
            conf.roonlineLayers="BP:Bestemmingsplangebied,BP:Wijzigingsplangebied,BP:Enkelbestemming,\
BP:Figuur,BP:Lettertekenaanduiding,BP:Maatvoering,BP:Dubbelbestemming,BP:Bouwvlak,\
BP:Gebiedsaanduiding,BP:Inpassingsplangebied,BP:Bouwaanduiding,BP:Functieaanduiding,\
PP:ProvinciaalPlangebied,PP:ProvinciaalGebied,PP:ProvinciaalComplex,\
PP:ProvinciaalVerbinding,NP:NationaalPlangebied,XGB:Besluitvlak,XGB:Besluitsubvlak,\
XGB:Exploitatieplangebied,XGB:Gerechtelijkeuitspraakgebied,XGB:Projectbesluitgebied,\
XGB:Tijdelijkeontheffingbuitenplansgebied,XGB:Voorbereidingsbesluitgebied,PCP:Plangebied";
        }
        return conf;
    },

    /**
     * Called when the button is clicked. Opens the print window (if not already opened) and creates a form.
     * If the window was invisible the preview will be redrawn
     */
    buttonClick: function(){
        if(!this.popup.popupWin.isVisible()){
            this.popup.show();
        }
        if (this.panel==null){
            this.createPanel();
        }
    },

    createPanel: function (){
        var me = this;
        //creates stores:
        this.ownerStore=Ext.create('Ext.data.Store', {
            fields: ['code', 'name'],
            data: [
                {name: "Abcoude", code: "0305"},
                {name: "Amersfoort", code: "0307"},
                {name: "Baarn", code: "0308"},
                {name: "Breukelen", code: "0311"},
                {name: "Bunnik", code: "0312"},
                {name: "Bunschoten", code: "0313"},
                {name: "De Bilt", code: "0310"},
                {name: "De Ronde Venen", code: "0736"},
                {name: "Eemnes", code: "0317"},
                {name: "Houten", code: "0321"},
                {name: "IJsselstein", code: "0353"},
                {name: "Leusden", code: "0327"},
                {name: "Loenen", code: "0329"},
                {name: "Lopik", code: "0331"},
                {name: "Maarssen", code: "0333"},
                {name: "Montfoort", code: "0335"},
                {name: "Nieuwegein", code: "0356"},
                {name: "Oudewater", code: "0589"},
                {name: "Provincie Utrecht", code: "9926"},
                {name: "Renswoude", code: "0339"},
                {name: "Rhenen", code: "0340"},
                {name: "Soest", code: "0342"},
                {name: "Stichtse Vecht", code: "1904"},
                {name: "Utrecht", code: "0344"},
                {name: "Utrechtse Heuvelrug", code: "1581"},
                {name: "Veenendaal", code: "0345"},
                {name: "Vianen", code: "0620"},
                {name: "Wijk bij Duurstede", code: "0352"},
                {name: "Woerden", code: "0632"},
                {name: "Woudenberg", code: "0351"},
                {name: "Zeist", code: "0355"}
            ]
        });
        this.typeStore = Ext.create('Ext.data.Store',{
            fields: ['key','value']
        });
        this.statusStore = Ext.create('Ext.data.Store',{
            fields: ['key','value']
        });
        this.docStore;
        //create comboboxes
        this.ownerCombo = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Eigenaar',
            labelAlign: 'top',
            store: this.ownerStore,
            editable: false,
            queryMode: 'local',
            displayField: 'name',
            valueField: 'code',
            width: this.comboWidth,
            listeners: {
                change:{
                    scope: this,
                    fn: this.ownerChanged
                }
            }
        });
        this.typeCombo = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Plan type',
            labelAlign: 'top',
            store: this.typeStore,
            editable: false,
            queryMode: 'local',
            displayField: 'value',
            valueField: 'key',
            width: this.comboWidth,
            listeners: {
                change:{
                    scope: this,
                    fn: this.typeChanged
                }
            }
        });
        this.statusCombo = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Plan status',
            labelAlign: 'top',
            store: this.statusStore,
            queryMode: 'local',
            displayField: 'value',
            valueField: 'key',
            width: this.comboWidth,
            listeners: {
                change:{
                    scope: this,
                    fn: this.statusChanged
                }
            }
        });
        var pContainer = Ext.create('Ext.panel.Panel',{
            layout: {
                type: 'vbox'
            },
            height: 190,
            width: '100%',
            items: [{
                xtype: 'container',
                name: 'planContainerValues',
                id: "planContainerValues",
                autoScroll: true,
                height: 190,
                width: '100%'
            }]
        });
        var docContainer = Ext.create('Ext.panel.Panel',{
            layout: {
                type: 'vbox'
            },
            height: 100,
            width: '100%',
            items: [{
                xtype: 'container',
                name: 'docContainerValues',
                id: "docContainerValues",
                autoScroll: true,
                height: 100,
                width: '100%'
            }]
        });

        this.legendaButton = Ext.create('Ext.button.Button',{
            html: "Bestemmingen aan/uit",
            listeners:{
                element: 'el',
                scope: this,
                click: function(){
                    this.showToc();
                }
            }
        });

        this.drawCommentButton = Ext.create('Ext.button.Button',{
            html: "Teken commentaar",
            listeners:{
                element: 'el',
                scope: this,
                click: function(){
                    this.drawComment();
                }
            },
            hidden: true
        });
        this.showAllCommentButton = Ext.create('Ext.button.Button',{
            html: "Toon alle commentaar",
            listeners:{
                element: 'el',
                scope: this,
                click: function(){
                    this.showAllComment();
                }
            },
            hidden: true
        });

        this.selectedPlanContainer = Ext.create('Ext.container.Container',{
            xtype: "container",
            html: "Geen plan geselecteerd"
        });
        this.uploadPlanButton = Ext.create('Ext.button.Button',{
            html: "Planregister",
            listeners:{
                element: 'el',
                scope: this,
                click: function(){
                    if (user){
                        var link = document.getElementById("linkForVerwerk");
                        link.target = "_blank";
                        var url= this.config.terceraRequestPage;
                        url+= url.indexOf("?")>0 ? "&" : "?";
                        url+= "user="+user.name;
                        link.href = url;
                        link.click();
                    }
                }
            },
            hidden: user===null
        });
        //create panel
        this.panel = Ext.create('Ext.panel.Panel', {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            padding: 5,
            width: "100%",
            height: '100%',
            border: 0,
            renderTo: me.getContentDiv(),
            items: [
                this.ownerCombo,
                this.typeCombo,
                this.statusCombo,
                {
                    xtype: 'label',
                    text: 'Plannen:'
                },
                pContainer,
                {
                    xtype: 'label',
                    text: 'Documenten:'
                },
                docContainer,
                this.legendaButton,
                this.drawCommentButton,
                this.showAllCommentButton,
                this.uploadPlanButton,
                this.selectedPlanContainer,
                {
                    xtype: "container",
                    html: "<a id='linkForVerwerk' href='javascript:void(0)' style='visibility:hidden;position:absolute;'></a>",
                    style: {
                        visibility: "hidden"
                    }
                }
            ]

        });

        // Listen to clicks on plans
        var planContainer = Ext.getCmp('planContainerValues');
        // Add listener on container, use delegation
        planContainer.getEl().dom.addEventListener('click', function(e) {
            // planselect item clicked
            if(e.target && e.target.className && e.target.className.indexOf('planselect') !== -1 && me.currentPlans) {
                // get identificatie
                var planId = e.target.getAttribute('data-planid');
                // Find plan
                for(var i = 0; i < me.currentPlans.length; i++) {
                    if(me.currentPlans[i].identificatie === planId) {
                        // Execute planClicked function
                        me.onPlanClicked(me.currentPlans[i]);
                        return;
                    }
                }
            }
        });

        //make sure the info html elements function is created.
        this.setCreateInfoHtmlElements();
    },
    getDomId: function(identificatie) {
        return identificatie.replace(/\W+/g, "");
    },
    onAddLayer: function(map,options){
        var mapLayer=options.layer;
        if (mapLayer==null)
            return;
        if (mapLayer.id==this.wmsLayerId){
            this.wmsLayer = mapLayer;

            if (this.sldUrl){
                this.wmsLayer.setOGCParams({
                    "SLD" : this.sldUrl
                });
            }

            this.roToc.reset({
                type: this.selectedPlan.origin,
                planId: this.selectedPlan.identificatie,
                wmsLayer: this.wmsLayer
            });
            if (this.commentMapLayer) {
                var index = this.viewerController.mapComponent.getMap().getLayerIndex(this.wmsLayer);
                if (index >= 0) {
                    this.viewerController.mapComponent.getMap().setLayerIndex(this.commentMapLayer, index);
                }
            } else {
                if (user){
                    this.viewerController.logger.error("Commentlayer does not yet exist, but is expected to.");
                }// When no user is present, no comment layer will be added
            }
        }else if (mapLayer.id == this.config.layers[0]){
            this.commentMapLayer = mapLayer;

            var cql = "("+this.roComment.config.publicAttributeName.toLowerCase()+"='Y'";
            if (user){
                cql+= " OR "+this.roComment.config.ownerAttributeName.toLowerCase()+ "='"+user.name+"'";
            }
            cql+=")";
            this.publicCommentfilter = Ext.create("viewer.components.CQLFilterWrapper",{
                id: "publicFilter_"+this.getName(),
                cql: cql,
                operator : "AND",
                type: "ATTRIBUTE"
            });
            if (this.selectedPlan){
                this.setPlanCommentFilter(this.selectedPlan.identificatie);
            }
            this.viewerController.setFilter(this.publicCommentfilter, this.commentAppLayer);

            this.commentMapLayer.setVisible(true);
            //ugly fix: DB has attributes in uppercase, WMS in lowercase. To avoid this filter to override the filter set as a SLD, register a handler. This handler
            // is executed AFTER the filter (with lowerceesing) is set on the WMS layer. This filter is used for queries to the featureSource (Oracle Db in this cees)
            var setDBAttributesHandler = function(){
                this.viewerController.removeListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE, setDBAttributesHandler ,this);
                var cql2 = "("+this.roComment.config.publicAttributeName+"='Y'";
                if (user){
                    cql2+= " OR "+this.roComment.config.ownerAttributeName+ "='"+user.name+"'";
                }
                cql2+=")";
                var ar = Ext.create("viewer.components.CQLFilterWrapper",{
                    id: "publicFilter_"+this.getName(),
                    cql: cql2,
                    operator : "AND",
                    type: "ATTRIBUTE"
                });
                this.commentAppLayer.filter.addOrReplace(ar);
            };
            this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE, setDBAttributesHandler ,this);

        }
    },
    /**
     * Changed functions:
     */
    ownerChanged: function(obj,value){
        this.setSelectedPlan(null);
        this.panel.setLoading("Bezig met laden plannen");
        Ext.Ajax.request({
            url: this.config.roServiceUrl,
            timeout: 240000,
            scope:this,
            params: {
                overheidsCode: value
            },
            success: function ( result, request ) {
                var res = Ext.JSON.decode(result.responseText);
                if(res.success){
                    this.setPlans(res.results);
                }else{
                    Ext.MessageBox.alert('Foutmelding', "Fout bij laden plannen" + res.error);
                }
                this.panel.setLoading(false);
                this.fireEvent("ownerchanged", this);
            },
            failure: function ( result, request) {
                Ext.MessageBox.alert('Foutmelding', "Fout bij ophalen plannen" + result.responseText);
                this.panel.setLoading(false);
            }
        });
    },
    typeChanged: function(obj,value){
        this.setSelectedPlan(null);
        var plans= this.filterCurrentPlans(value);
        var uniqueStatus = this.getUniqueStatus(plans);
        this.setStatus(uniqueStatus);
        this.updatePlansContainer(plans);
    },
    statusChanged: function(obj,value){
        this.setSelectedPlan(null);
        var typeValue= this.typeCombo.getValue();
        var plans= this.filterCurrentPlans(typeValue,value);
        this.updatePlansContainer(plans);
    },

    /**
     * Set the loaded plans.
     * @param {object} plans a object array with plans.
     */
    setPlans: function (plans) {
        this.currentPlans = plans;
        this.updatePlansContainer(plans);
        var uniqueTypes = this.getUniqueType(this.currentPlans);
        var uniqueStatus = this.getUniqueStatus(this.currentPlans);
        this.setTypes(uniqueTypes);
        this.setStatus(uniqueStatus);
    },
    /**
     * Update the container with the list of plans.
     * @param {object} plans a object array with plans.
     */
    updatePlansContainer: function(plans){
        if (this.planContainer===null){
            this.planContainer = Ext.getCmp("planContainerValues");
        }
        this.planContainer.removeAll();
        for (var i=0; i < plans.length; i++){
            var plan = plans[i];
            var el=this.createPlanItem(plan);
            this.planContainer.add(el);
        }
        this.planContainer.doLayout();
    },
    /**
     * Get a unique list of values of a property
     * @param {object} plans a object of the plans
     * @param {String} a string that represents the name of the property
     */
    getUniqueValues: function (plans,property){
        var uniqueStatus=[];
        for (var i=0; i < plans.length; i++){
            var plan = plans[i];
            if (plan[property] &&
                !Ext.Array.contains(uniqueStatus,plan[property])){
                uniqueStatus.push(plan[property]);
            }
        }
        return uniqueStatus;
    },
    getUniqueStatus: function(plans){
        return this.getUniqueValues(plans,"planstatus");
    },
    getUniqueType: function(plans){
        return this.getUniqueValues(plans,"typePlan");
    },
    /**
     * Set the available types
     */
    setTypes: function(types){
        var values= [];
        values.push({key: null,value: "Alle typen"});
        for (var i=0; i < types.length; i ++){
            values.push({key: types[i],value : types[i]})
        }
        this.typeStore.loadData(values,false);
    },
    setStatus: function(status){
        var values= [];
        values.push({key: null,value: "Alle statussen"});
        for (var i=0; i < status.length; i ++){
            values.push({key: status[i],value : status[i]})
        }
        this.statusStore.loadData(values,false);
    },

    /**
     * Called when plan is clicked
     */
    onPlanClicked: function(plan){
        if(this.highlightLayer !== null){
            this.highlightLayer.destroy();
            this.highlightLayer = null;
        }
        this.setSelectedPlan(plan);
    },
    setSelectedPlan: function(plan){
        this.sldUrl=null;
        if (this.selectedPlan !==null){
            Ext.get(this.getDomId(this.selectedPlan.identificatie)).removeCls("selected");
        }
        this.previouslySelectedPlan = this.selectedPlan;
        this.selectedPlan = plan;

        this.highlight(null,null);
        if (this.selectedPlan==null){
            this.clearLayer();
            this.selectedPlanContainer.update("Geen plan geselecteerd");
            this.drawCommentButton.hide();
            this.showAllCommentButton.hide();
            this.setPlanCommentFilter(null);
            this.customInfoEnabled=false
        }else{
            Ext.get(this.getDomId(this.selectedPlan.identificatie)).addCls("selected");
            if(this.roComment.vectorLayer){
                this.viewerController.mapComponent.getMap().removeLayer(this.roComment.vectorLayer);
                this.roComment.vectorLayer = null;
            }
            this.customInfoEnabled=true
            if(plan.origin == 'Tercera' && plan.wms==undefined){
                var me=this;
                var id=plan.identificatie;
                Ext.MessageBox.confirm({titel:'Verwerk plan',
                    msg:'Plan is niet verwerkt, wilt u het plan alsnog verwerken?',
                    width: 100,
                    buttons: Ext.Msg.YESNO,
                    buttonText: {
                        yes: "Ja",
                        no: "Nee"
                    },
                    fn: function(button,event){
                        if(button=="yes"){
                            var username=null;
                            if (user!=null){
                                username= encodeURIComponent(user.name);
                            }
                            var url= me.config.terceraRequestPage;
                            url+= url.indexOf("?")>0 ? "&" : "?";
                            url+="idn="+encodeURIComponent(plan.identificatie);
                            if (username){
                                url+="&user="+username;
                            }
                            var link = document.getElementById("linkForVerwerk");
                            link.target = "_parent";
                            link.href = url;
                            link.click();
                        }
                    }
                });
            }else {
                var prePlanText="";
                var ogcProps={
                    exceptions: "application/vnd.ogc.se_inimage",
                    srs: "EPSG:28992",
                    version: "1.1.1",
                    styles: "",
                    format: "image/png",
                    transparent: true,
                    noCache: true
                };
                var options={id: "RoTerceraLayer"};
                if (plan.origin == 'Tercera'){
                    prePlanText = "(L0K) ";
                    Ext.Ajax.request({
                        url: this.config.roServiceUrl,
                        timeout: 240000,
                        scope:this,
                        params: {
                            wmsUrl: plan.wms,
                            getTerceraWMSLayers: 'b'
                        },
                        success: function ( result, request ) {
                            var res = Ext.JSON.decode(result.responseText);
                            if(res.success){
                                ogcProps.layers=res.layers;
                                ogcProps.query_layers=res.layers;
                                options.layers=res.layers;
                            }else{
                                Ext.MessageBox.alert('Foutmelding', "Fout bij laden plannen" + res.error);
                            }
                            this.setLayer(plan.wms,ogcProps,options);
                        },
                        failure: function ( result, request) {
                            Ext.MessageBox.alert('Foutmelding', "Fout bij ophalen plannen" + result.responseText);
                        }
                    });
                }else{ //Ro-online plan
                    prePlanText="(RO) ";
                    ogcProps.layers=this.config.roonlineLayers.split(",");
                    ogcProps.query_layers=this.config.roonlineLayers.split(",");
                    options.layers= this.config.roonlineLayers.split(",");
                    this.sldUrl= Ext.create("viewer.SLD").createURL(options.layers,null,null,null,null,"app:plangebied='"+plan.identificatie+"'");
                    if(this.viewerController.isDebug() && this.sldUrl.indexOf("http://192.168.1.29:8084/viewer/action/sld")===0){
                        this.sldUrl=this.sldUrl.replace("http://192.168.1.29:8084","http://webkaarttest.b3p.nl")
                    }
                    this.setLayer(this.config.roonlineServiceUrl,ogcProps,options);

                }
                this.selectedPlanContainer.update(prePlanText+this.selectedPlan.identificatie);
            }

            if (plan.bbox){
                if(this.zoomToPlan){
                    var map=this.viewerController.mapComponent.getMap();
                    map.zoomToExtent(new viewer.viewercontroller.controller.Extent(plan.bbox.minx,plan.bbox.miny,plan.bbox.maxx,plan.bbox.maxy));
                }else{
                    this.zoomToPlan = true;
                }
            }
            if (plan.verwijzingNaarTekst){
                var docs = plan.verwijzingNaarTekst.split(",");
                this.setDocs(docs);
            }
            if (user){
                this.drawCommentButton.show();
                this.showAllCommentButton.show();
            }
        }
    },
    setDocs: function (docs){
        if (this.docContainer === null){
            this.docContainer = Ext.getCmp("docContainerValues");
        }
        this.docContainer.removeAll();
        Ext.Array.forEach(docs, function(item,index){
            var key=item.replace(" ","");
            var value=key;
            var name=this.getDocType(key);
            var el={
                xtype: 'container',
                html: name,
                width: '100%',
                listeners:{
                    element: 'el',
                    click: function(){
                        window.open(value,"name",'location=no,status=no,toolbar=no,menubar=no,scrollbars=yes');
                    }
                },
                style: {
                    cursor: 'pointer'
                }
            };
            this.docContainer.add(el);
        },this);
    },

    setPlanCommentFilter: function(planId){
        if (planId==null && this.planCommentFilter!==null){
            this.viewerController.removeFilter(this.planCommentFilter.id,this.getCommentAppLayer());
            this.planCommentFilter=null;
            this.commentMapLayer.setVisible(false);
        }else if (planId !=null){
            this.planCommentFilter = Ext.create("viewer.components.CQLFilterWrapper",{
                id: "planFilter_"+this.getName(),
                cql: this.roComment.config.planIdAttributeName.toLowerCase()+"='"+planId+"'",
                operator : "AND",
                type: "ATTRIBUTE"
            });
            this.viewerController.setFilter(this.planCommentFilter,this.getCommentAppLayer());
            var sldUrl = this.commentMapLayer.frameworkLayer.params.SLD;
            sldUrl = sldUrl.replace("https","http");
            this.commentMapLayer.setOGCParams ({ "SLD": sldUrl});
            this.commentMapLayer.reload();
            this.commentMapLayer.setVisible(true);

            //ugly fix: DB has attributes in uppercase, WMS in lowercase. To avoid this filter to override the filter set as a SLD, register a handler. This handler
            // is executed AFTER the filter (with lowerceesing) is set on the WMS layer. This filter is used for queries to the featureSource (Oracle Db in this cees)
            var setDBAttributesHandler = function(){
                this.viewerController.removeListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE, setDBAttributesHandler ,this);

                this.planCommentFilter = Ext.create("viewer.components.CQLFilterWrapper",{
                    id: "planFilter_"+this.getName(),
                    cql: this.roComment.config.planIdAttributeName+"='"+planId+"'",
                    operator : "AND",
                    type: "ATTRIBUTE"
                });
                this.getCommentAppLayer().filter.addOrReplace(this.planCommentFilter);
                var sldUrl = this.commentMapLayer.frameworkLayer.params.SLD;
                sldUrl = sldUrl.replace("https", "http");
                this.commentMapLayer.setOGCParams({"SLD": sldUrl});
                this.commentMapLayer.reload();

            };
            this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE, setDBAttributesHandler ,this);
        }
    },
    getCommentAppLayer: function(){
        if (this.commentAppLayer==null || this.commentAppLayer == undefined){
            if (this.config.layers){
                this.commentAppLayer = this.viewerController.getAppLayerById(this.config.layers[0]);
                if (this.commentAppLayer){
                    var found=false;
                    for (var i=0; i< this.viewerController.app.selectedContent.length; i++){
                        var contentItem = this.viewerController.app.selectedContent[i];
                        if (contentItem && contentItem.id == "l"+this.commentAppLayer.id){
                            found=true;
                            break;
                        }
                    }
                    if (!found){
                       this.viewerController.app.selectedContent.push({
                            id: "l"+this.commentAppLayer.id,
                            type: 'level',
                            checked:true
                        });
                        this.viewerController.app.levels["l"+this.commentAppLayer.id]={
                            background: false,
                            layers: [
                                ""+this.commentAppLayer.id
                            ],
                            name: "Commentaar"
                        };
                        this.commentAppLayer.checked=true;
                    }
                }
            }
        }
        return this.commentAppLayer;
    },
    showToc: function(){
        this.roToc.show();
    },
    drawComment: function(){
        if(this.selectedPlan && this.selectedPlan.identificatie){
            this.roComment.newComment(this.selectedPlan.identificatie);
        }
    },
    showAllComment: function(){
        this.roAllComment.getAllComments(this.selectedPlan.identificatie);
    },
    /**
     * Load layer in map
     */
    setLayer: function (url,props,options){
        var me = this;
        var si = Ext.create("viewer.ServiceInfo", {
            protocol: "wms",
            url: url
        });

        si.loadInfo(
            function(info) {
                info.id = "usRooTercera";
                info.status = 'added';
                info.layers["usRooTercera"]={
                    name: options.layers.join(","),
                    queryable: true
                }
                me.viewerController.addOrReplaceService(info);

                var appLayer={
                    background: false,
                    checked: true,
                    id: me.wmsLayerId,
                    layerName: "usRooTercera",
                    alias: "Udrop planlaag",
                    serviceId: "usRooTercera",
                    status: 'added',
                    details:{
                        "summary.description" : "",
                        "summary.link": "",
                        "summary.image": "",
                        "summary.title": " ",
                        "transparency": 30,
                        "legendImageUrl": me.roLegendUrl
                    }
                };
                me.viewerController.addOrReplaceAppLayer(appLayer);
                var found=false;
                for (var i=0; i< me.viewerController.app.selectedContent.length; i++){
                    var contentItem = me.viewerController.app.selectedContent[i];
                    if (contentItem && contentItem.id == "l"+me.wmsLayerId){
                        found=true;
                        break;
                    }
                }
                if (!found){
                    this.viewerController.app.selectedContent.push({
                        id: "l"+me.wmsLayerId,
                        type: 'level'
                    });
                    this.viewerController.app.levels["l"+me.wmsLayerId]={
                        background: false,
                        layers: [
                            me.wmsLayerId
                        ],
                        name: "Bestemmingsplannen"
                    }
                }
                //init the comment layer
                me.getCommentAppLayer();

                me.viewerController.setSelectedContent(me.viewerController.app.selectedContent);
            },
            function(msg) {
                Ext.MessageBox.alert("Foutmelding", msg);
            }
        );

    },
    clearLayer: function (){
        //todo: hier de layer uit zetten.
    },
    /**
     * Filter the plans
     */
    filterCurrentPlans: function (type,status){
        var plans=[];
        for (var i=0; i < this.currentPlans.length; i++){
            var plan = this.currentPlans[i];
            var cmp = Ext.getCmp(this.currentPlans[i].identificatie);
            var filtered=false;
            if (type && plan.typePlan != type){
                filtered=true;
            }
            if (status && plan.planstatus != status){
                filtered=true;
            }
            if (!filtered){
                plans.push(plan);
            }
        }
        return plans;
    },
    /**
     * Create a plan item.
     */
    createPlanItem: function(planObj){
        var me = this;
        var color = "#000000";
        if (planObj.origin == "Tercera"){
            if (planObj.wms){
                color="green";
            }else{
                color="#888888";
            }
        }
        var el = {
            xtype: 'container',
            html: '<div id="' + me.getDomId(planObj.identificatie) + '" class="planselect" data-planid="' + planObj.identificatie + '">' + planObj.naam + '</div>',
            width: '100%',
            border: 1,
            style: {
                color: color,
                cursor: 'pointer'
            }
        };
        return el;
    },
    /**
     * Get the full type name of the document.
     */
    getDocType: function(key){
        var returnValue=key;
        if (key.toLowerCase().indexOf("r_nl")>=0){
            returnValue="Regels";
        }else if(key.toLowerCase().indexOf("rb_nl")>=0){
            returnValue="Bijlagen bij de regels";
        }else if(key.toLowerCase().indexOf("t_nl")>=0){
            returnValue="Toelichting";
        }else if(key.toLowerCase().indexOf("tb_nl")>=0){
            returnValue="Bijlagen bij de toelichting";
        }else if(key.toLowerCase().indexOf("i_nl")>=0){
            returnValue="Illustratie";
        }else if(key.toLowerCase().indexOf("vb_nl")>=0){
            returnValue="Vaststellingsbesluit";
        }else if(key.toLowerCase().indexOf("v_nl")>=0){
            returnValue="Voorschriften";
        }else if(key.toLowerCase().indexOf("pt_nl")>=0){
            returnValue="Plantekst";
        }else if(key.toLowerCase().indexOf("g_nl")>=0){
            returnValue="Geleideformulier";
        }else if(key.toLowerCase().indexOf("d_nl")>=0){
            returnValue="Besluitdocument";
        }else if(key.toLowerCase().indexOf("db_nl")>=0){
            returnValue="Bijlagen bij besluitdocument";
        }else if(key.toLowerCase().indexOf("b_nl")>=0){
            returnValue="Beleidstekst/besluittekst";
        }else if(key.toLowerCase().indexOf("bb_nl")>=0){
            returnValue="Bijlage bij beleidstekst/besluittekst";
        }else if(key.toLowerCase().indexOf("p_nl")>=0){
            returnValue="Plankaart";
        }
        return returnValue;
    },

    setCreateInfoHtmlElements: function(){
        var comps=this.viewerController.getComponentsByClassName("viewer.components.FeatureInfo");
        var me = this;
        Ext.each(comps,function(comp,index,array){
            var oldFunction = comp.createInfoHtmlElements;
            comp.createInfoHtmlElements = function(data){
                var roData=[];
                var otherData=[]
                for (var i=0; i < data.length; i++){
                    var d= data[i];
                    if (me.wmsLayer == d.appLayer){
                        roData.push(d);
                    }else{
                        otherData.push(d);
                    }
                }
                var els = oldFunction.call(comp,otherData);
                var roEls=null;
                if (roData.length >0){
                    roEls=me.createInfoHtmlElements(roData);
                }
                if (roEls!=null){
                    els = roEls.concat(els);
                }
                return els;
            }
        });
    },
    createInfoHtmlElements: function (data){
        var origin = this.selectedPlan ? this.selectedPlan.origin : this.previouslySelectedPlan.origin;
        var planId = this.selectedPlan ? this.selectedPlan.identificatie : this.previouslySelectedPlan.identificatie;
        this.parser.resetData();
        var info=this.parser.parse(data,origin,planId);
        var el = null;
        if (!Ext.isEmpty(info)){
            el = new Ext.Element(document.createElement("div"));
            el.update(info);
            el.addCls("planinfo-feature");
        }
        var returnVal=null;
        if (el!=null){
            returnVal = [];
            returnVal.push(el);
        }
        return returnVal;
    },

    addStyleSheet: function(){
        var css=".planinfo-table tbody tr .td0{font-weight: bold;}\
                .planinfo-table tbody tr td{padding-right: 5px;}\
                .featureinfo-table tbody tr td{padding-right: 5px;}\
                .planinfo-feature{border-bottom: 1px solid #D7D7D7;}\
                .selected{background-color: #F79481;color: #000000;}";
        Ext.util.CSS.createStyleSheet(css);
    },

    highlight: function (fid,sldLayer){
        //first handle the images buttons.
        if (this.previousSLDFid!=null){
            if (document.getElementById("image_"+this.previousSLDFid)){
                document.getElementById("image_"+this.previousSLDFid).src=this.parser.highlightImage;
            }
        }
        //toggle
        if (fid==null || (this.previousSLDFid!=null && this.previousSLDFid==fid)){
            if (this.highlightLayer){
                this.highlightLayer.setVisible(false);
            }
            this.previousSLDFid=null;
        }//set new
        else{
            this.previousSLDFid=fid;
            document.getElementById("image_"+this.previousSLDFid).src=this.parser.highlightedImage;


            var useRuleFilter = false;
            if (this.selectedPlan.origin == 'Tercera'){
                useRuleFilter=true;
            }
            var url=this.wmsLayer.url;
            var sldUrl = Ext.create("viewer.SLD").createURL(sldLayer,null,"fid='"+fid+"'",null,null,null,"#FF0000",useRuleFilter);
            if(this.viewerController.isDebug() && sldUrl.indexOf("http://192.168.1.29:8084/viewer/action/sld")===0){
                sldUrl=sldUrl.replace("http://192.168.1.29:8084","http://webkaarttest.b3p.nl")
            }
            if (!this.highlightLayer){
                 var ogcProps={
                    exceptions: "application/vnd.ogc.se_inimage",
                    srs: "EPSG:28992",
                    version: "1.1.1",
                    styles: "",
                    format: "image/png",
                    transparent: true,
                    noCache: true,
                    layers: sldLayer,
                    sld: sldUrl
                };
                var options={
                    layers :sldLayer,
                    id: "RoHighlightLayer",
                    alpha: 50
                }
                this.highlightLayer = this.viewerController.mapComponent.createWMSLayer("highlightLayer", url ,ogcProps,options,this.viewerController);

                this.viewerController.mapComponent.getMap().addLayer(this.highlightLayer);
            }else{
                this.highlightLayer.setOGCParams({
                    "SLD" : sldUrl,
                    "LAYERS" : sldLayer
                });
                this.highlightLayer.setUrl(url);
            }
            this.highlightLayer.setVisible(true);
        }
    },

    getExtComponents: function() {
        return [ (this.panel !== null) ? this.panel.getId() : '' ];
    }
});
