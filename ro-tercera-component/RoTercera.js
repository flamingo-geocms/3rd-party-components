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
        this.roComment = Ext.create("viewer.components.rotercera.RoComment",conf);
        this.roAllComment = Ext.create("viewer.components.rotercera.RoAllComment",conf);
        
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
                    this.roAllComment.getAllComments();
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
        }else{
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
                    noCache: true
                };
                var options={};
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
            this.roComment.startComment(this.selectedPlan.identificatie);
        }
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
            
    getExtComponents: function() {
        return [ (this.panel !== null) ? this.panel.getId() : '' ];
    }
});

