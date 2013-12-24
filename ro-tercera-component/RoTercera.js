/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
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
    minHeight: 540,        
    comboWidth: 200,    
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
    wmsLayer: null,    
    
    roToc: null,
    roComment: null,
    
    publicCommentfilter: null,
    planCommentFilter: null,
    
    commentAppLayer: null,
    commentMapLayer: null,
    commentLayerIndex: null,
    
    customInfoEnabled: false,
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
        var resourceUrl = "";
        if (actionBeans && actionBeans["componentresource"]){
            resourceUrl=actionBeans["componentresource"];
        }
        resourceUrl=Ext.String.urlAppend(resourceUrl,"className=viewer.components.RoTercera")
        
        conf.iconUrl=Ext.String.urlAppend(resourceUrl,"resource=resources/images/icon16_gray.png");;
        viewer.components.RoTercera.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        var me = this;
        
        if(this.hasButton == null || this.hasButton){
            this.renderButton({
                handler: function(){
                    me.buttonClick();
                },
                text: me.title,
                icon: Ext.String.urlAppend(resourceUrl,"resource=resources/images/icon38_gray.png"),
                tooltip: me.tooltip,
                label: me.label
            });
        }
        //this.test();
        this.roToc = Ext.create("viewer.components.rotercera.RoToc",{});
        this.roComment = Ext.create("viewer.components.rotercera.RoComment",conf,this);
        this.roAllComment = Ext.create("viewer.components.rotercera.RoAllComment",conf,this);
        this.parser = Ext.create("viewer.components.rotercera.IdentifyParser",{},this);
        var me = this;
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_COMPONENTS_FINISHED_LOADING,function(){
            me.setCreateInfoHtmlElements();
        });
        
        this.addStyleSheet();
        
        return this;
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
        this.ownerCombo = Ext.create('viewer.components.FlamingoCombobox', {
            fieldLabel: 'Eigenaar',
            labelAlign: 'top',
            store: this.ownerStore,
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
        this.typeCombo = Ext.create('viewer.components.FlamingoCombobox', {
            fieldLabel: 'Plan type',
            labelAlign: 'top',
            store: this.typeStore,
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
        this.statusCombo = Ext.create('viewer.components.FlamingoCombobox', {
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
        
        this.legendaButton = Ext.create('Ext.container.Container',{
            xtype: "container",
            html: "Legenda",
            style: {
                fontWeight: 'bold',
                cursor: 'pointer'
            },
            listeners:{
                element: 'el',
                scope: this,
                click: function(){
                    this.showToc();
                }
            }
        });
        
        this.drawCommentButton = Ext.create('Ext.container.Container',{
            xtype: "container",
            html: "Teken commentaar",
            style: {
                fontWeight: 'bold',
                cursor: 'pointer',
            },
            listeners:{
                element: 'el',
                scope: this,
                click: function(){
                    this.drawComment();
                }
            },
            hidden: true
        });
        this.showAllCommentButton = Ext.create('Ext.container.Container',{
            xtype: "container",
            html: "Toon alle commentaar",
            style: {
                fontWeight: 'bold',
                cursor: 'pointer',
            },
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
            html: "Geen plan geselecteerd",            
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
    },
    /**
     * Changed functions:
     */     
    ownerChanged: function(obj,value){
        this.setSelectedPlan(null);
        this.panel.setLoading("Bezig met laden plannen");
        Ext.Ajax.request({ 
            url: this.roServiceUrl,
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
    setPlans: function (plans){
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
        for (var i=0; i < types.length; i ++){
            values.push({key: types[i],value : types[i]})
        }
        this.typeStore.loadData(values,false);
    },
    setStatus: function(status){
        var values= [];
        for (var i=0; i < status.length; i ++){
            values.push({key: status[i],value : status[i]})
        }
        this.statusStore.loadData(values,false);
    },    
    
    /**
     * Called when plan is clicked
     */
    onPlanClicked: function(plan){
        this.setSelectedPlan(plan);
    },
    setSelectedPlan: function(plan){
        this.selectedPlan = plan;
        if (this.selectedPlan==null){
            this.clearLayer();
            this.selectedPlanContainer.update("Geen plan geselecteerd");
            this.drawCommentButton.hide();
            this.showAllCommentButton.hide();
            this.setPlanCommentFilter(null);
            this.customInfoEnabled=false
        }else{
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
                            var url= me.terceraRequestPage;
                            url+= url.indexOf("?">0) ? "&" : "?";
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
                    noCache: true,
                };
                var options={id: "RoTerceraLayer"};
                if (plan.origin == 'Tercera'){
                    prePlanText = "(L0K) ";
                    Ext.Ajax.request({ 
                        url: this.roServiceUrl,
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

                            this.roToc.reset({
                                type: this.selectedPlan.origin,
                                planId: this.selectedPlan.identificatie,
                                wmsLayer: this.wmsLayer
                            });
                        }, 
                        failure: function ( result, request) {
                            Ext.MessageBox.alert('Foutmelding', "Fout bij ophalen plannen" + result.responseText);                        
                        } 
                    });                
                }else{ //Ro-online plan
                    prePlanText="(RO) ";
                    ogcProps.layers=this.roonlineLayers.split(",");
                    ogcProps.query_layers=this.roonlineLayers.split(",");
                    options.layers= this.roonlineLayers.split(",");
                    if (window.location.hostname ==undefined || window.location.hostname != "localhost"){
                        ogcProps.sld = Ext.create("viewer.SLD").createURL(options.layers,null,null,null,null,"app:plangebied='"+plan.identificatie+"'");
                    }
                    this.setLayer(this.roonlineServiceUrl,ogcProps,options);

                    this.roToc.reset({
                        type: this.selectedPlan.origin,
                        planId: this.selectedPlan.identificatie,
                        wmsLayer: this.wmsLayer
                    });
                }
                this.selectedPlanContainer.update(prePlanText+this.selectedPlan.identificatie);
            }
            this.setPlanCommentFilter(plan.identificatie);
            if (plan.bbox){
                var map=this.viewerController.mapComponent.getMap();
                map.zoomToExtent(new viewer.viewercontroller.controller.Extent(plan.bbox.minx,plan.bbox.miny,plan.bbox.maxx,plan.bbox.maxy));
            }
            if (plan.verwijzingNaarTekst){
                var docs = plan.verwijzingNaarTekst.split(",");
                this.setDocs(docs);            
            }
            this.drawCommentButton.show();
            this.showAllCommentButton.show();
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
                        window.open(value,key.replace(/ /g,"_"),{});
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
                cql: this.roComment.planIdAttributeName+"='"+planId+"'",
                operator : "AND",
                type: "ATTRIBUTE"
            });
            this.viewerController.setFilter(this.planCommentFilter,this.getCommentAppLayer());
            this.commentMapLayer.setVisible(true);
        }
    },
    getCommentAppLayer: function(){
        if (this.commentAppLayer==null || this.commentAppLayer == undefined){
            if (this.layers){
                this.commentAppLayer = this.viewerController.getAppLayerById(this.layers[0]);
                if (this.commentAppLayer){
                    this.commentMapLayer = this.viewerController.getOrCreateLayer(this.commentAppLayer);

                    var cql = "("+this.roComment.publicAttributeName+"=true"
                    if (user){
                        cql+= " OR "+this.roComment.ownerAttributeName+ "='"+user+"'";
                    }
                    cql+=")"
                    this.publicCommentfilter = Ext.create("viewer.components.CQLFilterWrapper",{
                        id: "publicFilter_"+this.getName(),
                        cql: cql,
                        operator : "AND",
                        type: "ATTRIBUTE"
                    });
                    this.viewerController.setFilter(this.publicCommentfilter,this.commentAppLayer);            
                }
            }
        }
        return this.commentAppLayer;
    },
    showToc: function(){
        this.roToc.show();
        if (this.selectedPlan){
            this.roToc.reset({
                type: this.selectedPlan.origin,
                planId: this.selectedPlan.identificatie,
                wmsLayer: this.wmsLayer
            });
        }
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
        var index =-1;
        if (this.wmsLayer!=null){
            index = this.viewerController.mapComponent.getMap().getLayerIndex(this.wmsLayer);
        }else if (this.layers){
            index = this.viewerController.mapComponent.getMap().getLayerIndex(this.commentMapLayer);
            //index--;
        }
        this.clearLayer();
        
        this.wmsLayer = this.viewerController.mapComponent.createWMSLayer("rolayer", url ,props, options,this.viewerController);
        this.wmsLayer.setDetails({
            "summary.description" : "Omschrijving lalala",
            "summary.link": "",
            "summary.image": "",
            "summary.title": ""
        });
        this.viewerController.mapComponent.getMap().addLayer(this.wmsLayer);
        if (index>=0){
            this.viewerController.mapComponent.getMap().setLayerIndex(this.wmsLayer,index);
            this.viewerController.mapComponent.getMap().setLayerIndex(this.commentMapLayer,index+1);
        }
    },
    clearLayer: function (){
        if (this.wmsLayer!=null){
            this.viewerController.mapComponent.getMap().removeLayer(this.wmsLayer);
            delete this.wmsLayer;
        }
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
        var me=this;
        var color="#000000";
        if (planObj.origin == "Tercera"){
            if (planObj.wms){
                color="green";
            }else{
                color="#888888";
            }
        }
        var el={
            xtype: 'container',
            id: planObj.identificatie,
            html: planObj.naam,
            width: '100%',
            border: 1,
            listeners:{
                element: 'el',
                click: function(){
                    me.onPlanClicked(planObj);
                }
            },
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
                var els = oldFunction.call(this,data);
                var thisEls=me.createInfoHtmlElements(data);
                var els = thisEls.concat(els);
                return els;
            }
        });
    },
    createInfoHtmlElements: function (data){
        var origin = this.selectedPlan.origin;
        var planId = this.selectedPlan.identificatie;
        this.parser.prepareData(data,origin,planId);
        var el = new Ext.Element(document.createElement("div"));        
        el.update(this.parser.getInfo());
        var returnVal = [];
        returnVal.push(el);
        return returnVal;
    },
            
    addStyleSheet: function(){
        var css=".planinfo-table tbody tr .td0{font-weight: bold;}\
                .planinfo-table tbody tr td{padding-right: 5px;}\
                .featureinfo-table tbody tr td{padding-right: 5px;}";
        Ext.util.CSS.createStyleSheet(css);
    },
            
    getExtComponents: function() {
        return [ (this.panel !== null) ? this.panel.getId() : '' ];
    }
});


Ext.define("viewer.components.rotercera.IdentifyParser",{
    //statics
    BESLUITGEBIED_X : 6,
    COMMENTAARLAYOUT:5,
    STRUCTUURVISIELAYOUT:2,
    BESTEMMINGSPLANLAYOUT:1,
    UNKNOWNLAYOUT:0,

    TERCERALAYERID:"Tercera",

    checkForIdentification: [],
    
    wfsToWmsLayer: {},
    
    terceraMapping: null,
    
    //info placeholders
    info: "",
    commentaarInfo: "",
    
    component: null,
    config: {
        domElement: null
    },
    constructor: function (conf,component){
        this.component = component;
        this.initConfig(conf);
        
        this.checkForIdentification.push("identificatie");
        this.checkForIdentification.push("plangebied");
        this.checkForIdentification.push("bestemmingsplangebiedid");
        
        this.wfsToWmsLayer['Besluitvlak_P'] = "PV:Besluitvlak";
        this.wfsToWmsLayer['Besluitgebied_P'] = "PV:Besluitgebied";
        this.wfsToWmsLayer['Besluitvlak_X'] = "XGB:Besluitvlak";
        this.wfsToWmsLayer['Besluitgebied_X'] = "XGB:Besluitgebied";
        this.wfsToWmsLayer['Besluitvlak_A'] = "AMB:Besluitgebied";      
        this.wfsToWmsLayer['Besluitgebied_A'] = "AMB:Besluitgebied";

        this.terceraMapping={
            enkelbestemming: [
                {key: "agrarisch", title: "Agrarisch"},
                {key: "agrarisch_met_waarden", title: "Agrarisch met waarden"},
                {key: "bedrijf", title: "Bedrijf"},
                {key: "bedrijventerrein", title: "Bedrijventerrein"},
                {key: "bos", title: "Bos"},
                {key: "centrum", title: "Centrum"},
                {key: "cultuur_en_ontspanning", title: "Cultuur en ontspanning"},
                {key: "detailhandel", title: "Detailhandel"},
                {key: "dienstverlening", title: "Dienstverlening"},
                {key: "gemengd", title: "Gemengd"},
                {key: "groen", title: "Groen"},
                {key: "horeca", title: "Horeca"},
                {key: "kantoor", title: "Kantoor"},
                {key: "maatschappelijk", title: "Maatschappelijk"},
                {key: "natuur", title: "Natuur"},
                {key: "overig", title: "Overig"},
                {key: "recreatie", title: "Recreatie"},
                {key: "sport", title: "Sport"},
                {key: "tuin", title: "Tuin"},
                {key: "verkeer", title: "Verkeer"},
                {key: "water", title: "Water"},
                {key: "wonen", title: "Wonen"},
                {key: "woongebied", title: "Woongebied"}
            ],
            dubbelbestemming: [
                {key: "leiding", title: "Leiding"},
                {key: "waarde", title: "Waarde"},
                {key: "waterstaat", title: "Waterstaat"}
            ],
            gebiedsaanduiding: [
                {key: "geluidzone", title: "Geluidzone"},
                {key: "luchtvaartverkeerzone", title: "Luchtvaartverkeerzone"},
                {key: "milieuzone", title: "Milieuzone"},
                {key: "reconstructiewetzone", title: "Reconstructiewetzone"},
                {key: "veiligheidszone", title: "Veiligheidszone"},
                {key: "vrijwaringszone", title: "Vrijwaringszone"},
                {key: "wro-zone", title: "Wro-zone"},
                {key: "overig", title: "Overig"},
                {key: "wetgevingzone  ", title: "Wetgevingzone  "},
                {key: "overige_zone", title: "Overige zone"}
            ]
        };     
    },
    resetData : function(){
        this.info="";
        this.commentaarInfo="";
    },
    /**
    *Is this feature part of the plan
    */
    isPartOfPlan : function(feature,plangebiedId){
        for (var i=0; i < this.checkForIdentification.length; i++){
            if (feature[this.checkForIdentification[i]]!=undefined){
                if (feature[this.checkForIdentification[i]].toLowerCase()==plangebiedId.toLowerCase()){
                    return true;
                }
            }
        }
        return false;
    },
            
    /**
     *Returns 1 if bestemmingsplan layout.
     */
    hasInfoWithLayout :function (obj,hetPlanObject,layoutType){
        if (hetPlanObject!=null){
            var typePlan=hetPlanObject["typeplan"];
            if (typePlan==undefined){
                typePlan="bestemmingsplan";
            }
            if (layoutType==this.BESTEMMINGSPLANLAYOUT){
                if(typePlan.indexOf("bestemmingsplan")>=0 ||
                    typePlan.indexOf("inpassingsplan")>=0 ||
                    typePlan.indexOf("wijzigingsplan")>=0 ||
                    typePlan.indexOf("uitwerkingsplan")>=0)
                    return true;                     
            }else if (layoutType==this.STRUCTUURVISIELAYOUT){
                if(typePlan.indexOf("structuurvisie")>=0)
                    return true;

            }else if (layoutType==this.BESLUITGEBIED_X){
                if (obj["besluitgebied_x"] || obj["besluitvlak_x"]){ 
                    return true;
                }
            }
        }else if (layoutType==this.COMMENTAARLAYOUT){
            if (obj["plannenbank_commentaar"])
                return true;
        }
        return false;
    },
            
    /**
    *Make the layer head.
    */
    makeLayerHead : function (obj){
        var head="<h1>";
        head+=obj["naam"];
        head+="(";
        head+=obj["planstatus"];
        head+=", ";
        head+=obj["typeplan"];
        head+=")";
        head+="</h1>"
        return head;
    },
            
    /**
    *Create the a table row with 3 columns
    */
    createRow : function(field1,field2,field3,field4){
       var array= new Array();
       if (field1)
           array.push(field1);
       else
           array.push("");
       if (field2)
           array.push(field2);
       else
           array.push("");
       if (field3)
           array.push(field3);
       else
           array.push("");
       if (field4)
           array.push(field4);
       else
           array.push("");

       var row="<tr>";
       for (var i=0; i < array.length; i++){
           row+="<td class=\"td"+i+"\" valign=\"top\">"+array[i]+"</td>";
       }           
       row+="</tr>";
       return row;
    },

    /**
    *Create a bestemming table row (
    */
    createBestemmingRow : function(name,bestemmingFeatures,plangebied,sldLayer,forceIsPartOfPlan){  
        if (forceIsPartOfPlan==undefined){
            forceIsPartOfPlan=false;
        }
        var infoPart="";
        for (var featureCount in bestemmingFeatures){          
            var feature=bestemmingFeatures[featureCount];
            //skip crap objects
            if (feature[null]){}
            else{
                if (forceIsPartOfPlan ||(plangebied!=undefined && this.isPartOfPlan(feature,plangebied))){   
                    var sldFilter=null;
                    if (feature["fid"] && sldLayer){
                        sldFilter=this.createSLDButton(feature["fid"],sldLayer);                        
                    }
                    infoPart+=this.createRow(name,
                        feature["naam"],
                        this.createLinks(feature["verwijzingnaartekst"]),
                        sldFilter);
                }
            }
        }
        return infoPart;
    },
            
    createSLDButton : function (id,layer){
        if (this.wfsToWmsLayer[layer]!=undefined){
            layer= this.wfsToWmsLayer[layer];
        }
        var html="<a href='javascript: void(0)'";
        html+=" onclick='showElementWithFid("+id+",\""+layer+"\")'>";
        html+="<img src=\"<html:rewrite module='' page='/images/map.png'/>\" id=\"image_"+id+"\"/>";
        html+="</a>";
        return html;
    },
    /**
    *Create the links
    */
    createLinks : function(verwijzingNaarTekst){            
       var linkText="";
       if (verwijzingNaarTekst && verwijzingNaarTekst!="null"){
           var links=verwijzingNaarTekst.split(",");
           for (var i=0; i < links.length; i++){
               links[i]=links[i].replace(" ","");
               var theUrl=links[i];               
               var typeDoc=this.component.getDocType(links[i]);
               if (linkText.length>0){
                   linkText+="<br/>";
               }
               linkText+="<a href=\"#\" onclick=\"planDocWindow=popUp('"+theUrl+"','plantekst',650,550)\">"+typeDoc+"</a><br>";
           }
       }
       return linkText;
    },
            
    /**
     *Create a plan info element
     */
    createPlanInfo : function(layerObj){
        if (layerObj){
            var infoPart="<h2>Algemene planinfo</h2>";
            infoPart+=this.createLinks(layerObj["verwijzingnaartekst"]);
            if (layerObj["verwijzingnaarvaststellingsbesluit"]){
                infoPart+=this.createLinks(layerObj["verwijzingnaarvaststellingsbesluit"]);
                infoPart+="<br/>";
            }
            infoPart+='<br/>';
            infoPart+="<table class='planinfo-table'>";
            infoPart+=this.createRow("Planstatus",layerObj["planstatus"]+" ("+layerObj["datum"]+")");
            infoPart+=this.createRow("Type plan", layerObj["typeplan"]);
            infoPart+=this.createRow("Overheid", layerObj["naamoverheid"]);
            infoPart+="</table>";
            return infoPart;
        }else{
            return "";
        }
    },
    dataToObj: function(data){
        var newObj = {};
        for (var i=0; i < data.length; i++){
            var resp = data[i];
            if (resp.features){
                newObj[resp.request.serviceLayer] = resp.features;                
            }
        }
        return newObj;
    },
    makeSimpleName : function (s){            
        var newS=s.toLowerCase();
        if (newS.indexOf(":")>=0){
            newS=newS.substring(newS.indexOf(":")+1);
        }
        return newS;
    },
    makeSimple : function (obj){
        var newObj= new Object();
        for (var featureName in obj){
            var simpleFeatureName=this.makeSimpleName(featureName)
            newObj[simpleFeatureName] = new Object();
            for (var featureIndex in obj[featureName]){
                newObj[simpleFeatureName][featureIndex]= new Object();
                for (var attributeName in obj[featureName][featureIndex]){
                    var simpleAttributeName=this.makeSimpleName(attributeName);
                    newObj[simpleFeatureName][featureIndex][simpleAttributeName]= obj[featureName][featureIndex][attributeName];
                }
            }
        }
        return newObj;
    },
            
    /**
    *Get complex name for ROOnline layers
    */
    getComplexName : function(complexObj,simpleName){            
        for (var featureName in complexObj){
            if (featureName.toLowerCase().indexOf(simpleName)>=0){
                return featureName;
            }
        }
        return simpleName;
    },
    /**
     *Get Complex name for Tercera layers
     */
    getComplexTerceraName : function (complexObj,simpleName){
        var simple=complexObj[simpleName];
        if (simple){                
            var fid;
            for (var i=0; i < simple.length; i++){
                fid=simple[i].fid;
                if (fid){
                    break;
                }
            }
            for (var featureName in complexObj){
                //find the complex name and return
                if (featureName!=simpleName){                        
                    var complex =complexObj[featureName];
                    //check if the complex has 1 feature with fid == fid of 1 of the simple
                    for (var i=0; i < complex.length; i++){
                        if (complex[i].fid==fid){
                            return featureName;
                        }
                    }    
                }
            }
        }
        return simpleName;
    },
            
    /*Get the correct plan that is selected*/        
    getCorrectPlan : function(planObjects,plangebied){
        for (fcount in planObjects){
            if (this.isPartOfPlan(planObjects[fcount],plangebied)){
                return planObjects[fcount];                        
            }                    
        }
    },
            
    
    /**
     *Makes the html.
     */
    prepareData : function (data,layerId,plangebied){  
        var objcomplex = this.dataToObj(data);
        //remove all ':' and set all names to lowercase.
        var obj = this.makeSimple(objcomplex);
        //Zoek het juiste bestemmingsplan object
        var hetPlanObject=null;
        //if tercera layer then the info is always of the loaded plan
        var forcePartOfPlan=false;            
        if (layerId==this.TERCERALAYERID){
            forcePartOfPlan=true;
        }
        if(obj["bestemmingsplangebied"])
            hetPlanObject=this.getCorrectPlan(obj["bestemmingsplangebied"],plangebied);            
        //if still null then it's not given as a bestemmingsplangebied'
        if (hetPlanObject == null && obj["plangebied"]){
            hetPlanObject=this.getCorrectPlan(obj["plangebied"],plangebied);
        }
        if (hetPlanObject == null && obj["plangebied_pcp"]){
            hetPlanObject=this.getCorrectPlan(obj["plangebied_pcp"],plangebied);
        }
        if (hetPlanObject == null && obj["besluitgebied_x"]){
            hetPlanObject = this.getCorrectPlan(obj["besluitgebied_x"],plangebied);
        }
        if (hetPlanObject == null && obj["besluitvlak_x"]){
            hetPlanObject = this.getCorrectPlan(obj["besluitvlak_x"],plangebied);                
        }
        if (hetPlanObject!=null && this.hasInfoWithLayout(obj,hetPlanObject,this.BESTEMMINGSPLANLAYOUT)){
            var infoPart="";
            if (hetPlanObject)
                infoPart+=this.makeLayerHead(hetPlanObject);
            infoPart+="<table class='featureinfo-table'>";
            //enkel
            if (obj["enkelbestemming"]){
                infoPart+=this.createBestemmingRow("Enkelbestemming",obj["enkelbestemming"],plangebied,this.getComplexName(objcomplex,"enkelbestemming"));
            }else if (layerId==this.TERCERALAYERID){
                //maybe it's a tercera feature?
                for (var i=0; i < this.terceraMapping.enkelbestemming.length; i++){
                    var mapping = this.terceraMapping.enkelbestemming[i];
                    if (obj[mapping.key]){                            
                        infoPart+=this.createBestemmingRow("Enkelbestemming",obj[mapping.key],plangebied,this.getComplexTerceraName(objcomplex,mapping.key),forcePartOfPlan);
                    }
                }
            }
            if (obj["dubbelbestemming"]){
                infoPart+=this.createBestemmingRow("Dubbelbestemming",obj["dubbelbestemming"],plangebied,this.getComplexName(objcomplex,"dubbelbestemming"));
            }else if (layerId==this.TERCERALAYERID){
                for (var i=0; i < this.terceraMapping.dubbelbestemming.length; i++){
                    var mapping = this.terceraMapping.dubbelbestemming[i];
                    if (obj[mapping.key]){
                        infoPart+=this.createBestemmingRow("Dubbelbestemming",obj[mapping.key],plangebied,this.getComplexTerceraName(objcomplex,mapping.key),forcePartOfPlan);
                    }
                }
            }
            if (obj["gebiedsaanduiding"]){ 
                infoPart+=this.createBestemmingRow("Gebiedsaanduiding",obj["gebiedsaanduiding"],plangebied,this.getComplexName(objcomplex,"gebiedsaanduiding"));
            }else if (layerId==this.TERCERALAYERID){
                for (var i=0; i < this.terceraMapping.gebiedsaanduiding.length; i++){
                    var mapping = this.terceraMapping.gebiedsaanduiding[i];
                    if (obj[mapping.key]){
                        infoPart+=this.createBestemmingRow(mapping.title,obj[mapping.key],plangebied,this.getComplexTerceraName(objcomplex,mapping.key),forcePartOfPlan);
                    }
                }
            }
            if (obj["bouwvlak"]){  
                for (var featureCount in obj["bouwvlak"]){
                    var feature=obj["bouwvlak"][featureCount];
                    if (forcePartOfPlan || this.isPartOfPlan(feature,plangebied))
                        if (feature["fid"]){
                            infoPart+=this.createRow("Bouwvlak","","",this.createSLDButton(feature["fid"],this.getComplexName(objcomplex,"bouwvlak")));
                        }
                }
            }
            if (obj["bouwaanduiding"]){          
                infoPart+=this.createBestemmingRow("Bouwaanduiding",obj["bouwaanduiding"],plangebied,forcePartOfPlan);

            }
            if (obj["maatvoering"]){
                for (var featureCount in obj["maatvoering"]){    
                    var feature=obj["maatvoering"][featureCount];
                    if (forcePartOfPlan || this.isPartOfPlan(feature,plangebied)){
                        var newValue="";
                        var maatVoeringen=[];
                        //roonline
                        if (feature["maatvoering"]){
                            maatVoeringen=feature["maatvoering"].split(", ");
                        //tercera
                        }else if (feature["waarde"]){
                            maatVoeringen = feature["waarde"].split(", ");
                        }
                        for (var m =0; m < maatVoeringen.length; m++){
                            if (newValue.length!=0){
                                newValue+="<br/>";
                            }
                            newValue+=maatVoeringen[m].replace(/\"/g,"");
                        }
                        infoPart+=this.createRow("Maatvoering",
                            /*feature["naam"]+*/newValue);
                    }

                }                    
            }
            if (obj["functieaanduiding"]){
                infoPart+=this.createBestemmingRow("Functieaanduiding",obj["functieaanduiding"],plangebied,this.getComplexName(objcomplex,"functieaanduiding"),forcePartOfPlan);
            }
            if (obj["figuur"]){
                for (var featureCount in obj["figuur"]){    
                    var feature=obj["figuur"][featureCount];
                    if (forcePartOfPlan || this.isPartOfPlan(feature,plangebied)){
                        infoPart+=this.createRow("figuur",
                            feature["naam"],
                            this.createLinks(feature["verwijzingnaarillustratie"]));
                    }
                }
            }
            infoPart+="</table>";

            infoPart+=this.createPlanInfo(hetPlanObject);

            this.info+=infoPart;
        }else if(hetPlanObject!=null && this.hasInfoWithLayout(obj,hetPlanObject,this.STRUCTUURVISIELAYOUT)){//hetPlanObject["typeplan"].indexOf("structuurvisie")>=0){
            var infoPart="";
            /*var layerObject=null;
            if (obj["structuurvisiegebied"])
                layerObject=obj["structuurvisiegebied"];                                    
            if (obj["structuurvisiecomplex"])
                layerObject=obj["structuurvisiecomplex"];  */

            infoPart+=this.makeLayerHead(hetPlanObject);
            infoPart+="<table class='featureinfo-table'>"; 
            infoPart+=this.createBestemmingRow("Structuurvisie",obj["functieaanduiding"],plangebied);
            infoPart+="</table>";                

            infoPart+=this.createPlanInfo(hetPlanObject);

            this.info=infoPart;                
        }else if(hetPlanObject!=null && this.hasInfoWithLayout(obj,hetPlanObject,this.BESLUITGEBIED_X)){
            var infoPart="";
            infoPart+=this.makeLayerHead(hetPlanObject);                
            infoPart+="<table class='featureinfo-table'>";                
            if (obj["besluitvlak_x"]){
                infoPart+=this.createBestemmingRow("Besluitvlak",obj["besluitvlak_x"],plangebied,this.getComplexName(objcomplex,"besluitvlak_x"),forcePartOfPlan);
            }
            infoPart+="</table>";
            infoPart+=this.createPlanInfo(hetPlanObject);

            this.info=infoPart;
        }else if(this.hasInfoWithLayout(obj,hetPlanObject,this.COMMENTAARLAYOUT)){
            //commentaar opmaak.
            var commentaarInfoPart="";
            commentaarInfoPart+="<h2>Commentaar</h2>";
            commentaarInfoPart+="<table class='featureinfo-table'>"
            var count=0;
            for (fcount in obj["plannenbank_commentaar"]){
                var feature=obj["plannenbank_commentaar"][fcount];
                if (this.isPartOfPlan(feature,plangebied)){
                    var openbaar=false;
                    if(feature["openbaar"]=="true"){
                        openbaar=true;
                    }
                    var eigenaar=feature["eigenaar"];                    
                    if(openbaar || username == eigenaar || (isUtrechtOrg(username) && isUtrechtOrg(eigenaar))){
                        commentaarInfoPart+=this.createRow(eigenaar,feature["thema"],feature["tekst"]);
                        var owner=feature["eigenaar"];
                        if (username == owner /*|| (isUtrechtOrg(username) && isUtrechtOrg(owner))*/){
                            var wijzigUrl=commentaarUrl+"?id="+feature["id"];
                            commentaarInfoPart+=this.createRow("<a href=\"javascript: var d=flamingoWindow.openPlanCommentaar('"+wijzigUrl+"');\">Wijzig</a>" );                        
                        }
                        count++;
                    }
                }
            }     
            commentaarInfoPart+="</table>"
            if (count>0){
                this.commentaarInfo+=commentaarInfoPart;
            }
        }else{
            var infoPart="";
            if (hetPlanObject){
                try{
                    var head=this.makeLayerHead(hetPlanObject);
                    if (head)
                        infoPart+=head;
                }catch(err){                        
                }                    
            }
            infoPart+=this.createPlanInfo(hetPlanObject);
            this.info+=infoPart;
        }

    },   
    getInfo : function(){
        return this.info+this.commentaarInfo;
    }      
});
