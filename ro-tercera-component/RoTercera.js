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
    minWidth: 250,
    minHeight: 500,        
    comboWidth: 200,    
    //stores
    ownerStore: null,
    typeStore: null,
    statusStore: null,
    docStore: null,
    //combo boxes
    ownerCombo: null,
    typeCombo: null,
    statusCombo: null,
    docCombo: null,
    
    currentPlans:null,
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
        roonlineServiceUrl: null
        
    },
    /**
     * @constructor
     * creating a print module.
     */
    constructor: function (conf){  
        conf=this.setDefaults(conf);
        viewer.components.RoTercera.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        var me = this;
        if(this.hasButton == null || this.hasButton){
            this.renderButton({
                handler: function(){
                    me.buttonClick();
                },
                text: me.title,
                icon: me.titlebarIcon,
                tooltip: me.tooltip,
                label: me.label
            });
        }
        
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
                {code: "0355",name: 'Zeist'},
                {code: "0344",name: 'Utrecht'},
                {code: "0351",name: 'Woudenberg'}
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
        this.docCombo = Ext.create('viewer.components.FlamingoCombobox', {
            fieldLabel: 'Plan documenten',
            labelAlign: 'top',
            store: this.docStore,
            queryMode: 'local',
            displayField: 'naam',
            valueField: 'code',
			width: this.comboWidth,
            listeners: {
                change:{
                    scope: this,
                    fn: this.docChanged
                }
            }
        });
        this.planContainer = Ext.create('Ext.panel.Panel',{
            layout: { 
                type: 'vbox',
                align: 'stretch'
            },
            height: 200,            
            autoScroll: true
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
                this.planContainer,
                this.docCombo,
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
        var plans= this.filterCurrentPlans(value);        
        var uniqueStatus = this.getUniqueStatus(plans);        
        this.setStatus(uniqueStatus);
        this.updatePlansContainer(plans);
    },
    statusChanged: function(obj,value){
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
        this.planContainer.removeAll();
        for (var planId in plans){  
            var plan = plans[planId];
            var el=this.createPlanItem(plan);
            this.planContainer.add(el);
        }
    },
    /**
     * Get a unique list of values of a property
     * @param {object} plans a object of the plans
     * @param {String} a string that represents the name of the property
     */        
    getUniqueValues: function (plans,property){
        var uniqueStatus=[];
        for (var planId in plans){
            var plan = plans[planId];            
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
                ogcProps.layers=this.roonlineLayers;
                /*ogcProps.query_layers=this.roonlineLayers;*/
                options.layers= this.roonlineLayers;
                this.setLayer(this.roonlineServiceUrl,ogcProps,options);
            }
        }
        if (plan.bbox){
            var map=this.viewerController.mapComponent.getMap();
            map.zoomToExtent(new viewer.viewercontroller.controller.Extent(plan.bbox.minx,plan.bbox.miny,plan.bbox.maxx,plan.bbox.maxy));
        }
    },
    
    setLayer: function (url,props,options){
        this.wmsLayer = this.viewerController.mapComponent.createWMSLayer("rolayer", url ,props, options,this.viewerController);
        this.viewerController.mapComponent.getMap().addLayer(this.wmsLayer);
    },
    
    filterCurrentPlans: function (type,status){
        var plans=[];
        for (var planId in this.currentPlans){
            var plan = this.currentPlans[planId];
            var cmp = Ext.getCmp(planId);
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
            xtype: 'label',
            id: planObj.identificatie,
            text: planObj.naam,
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
            
    isPlanLoaded: function(plan){
        if(plan.wms!=null){
            return true;
        }
        return false;
    },
    getExtComponents: function() {
        return [ (this.panel !== null) ? this.panel.getId() : '' ];
    }
});

