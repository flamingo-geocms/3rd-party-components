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
    planStore: null,
    docStore: null,
    //combo boxes
    ownerCombo: null,
    typeCombo: null,
    statusCombo: null,
    planCombo: null,
    docCombo: null,
    
    currentPlans:null,
    config:{
        name: "Ro-Tercera client",
        title: "",
        titlebarIcon : "",
        tooltip : "",
        label: "",
        roServiceUrl: ""
    },
    /**
     * @constructor
     * creating a print module.
     */
    constructor: function (conf){  
        //set minWidth:
        if(conf.details.width < this.minWidth || !Ext.isDefined(conf.details.width)) conf.details.width = this.minWidth; 
        //set minHeight:
        if(conf.details.height < this.minHeight || !Ext.isDefined(conf.details.height)) conf.details.height = this.minHeight; 
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
                {code: "0355",name: 'Zeist2'},
                {code: "0355",name: 'Zeist3'}
            ]
        });        
        this.typeStore = Ext.create('Ext.data.Store',{
            fields: ['key','value']
        });
        this.statusStore = Ext.create('Ext.data.Store',{
            fields: ['key','value']
        });        
        this.planStore;
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
        this.planCombo = Ext.create('viewer.components.FlamingoCombobox', {
            fieldLabel: 'Plan',
            labelAlign: 'top',
            store: this.planStore,
            queryMode: 'local',
            displayField: 'naam',
            valueField: 'code',
			width: this.comboWidth,
            listeners: {
                change:{
                    scope: this,
                    fn: this.planChanged
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
        //create panel
        this.panel = Ext.create('Ext.panel.Panel', {
            frame: false,
            bodyPadding: 5,
            width: "100%",
            height: "100%",
            border: 0,
            renderTo: me.getContentDiv(),
            items: [
                this.ownerCombo,
                this.typeCombo,
                this.statusCombo,
                this.planCombo,
                this.docCombo
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
                this.setLoading(false);
            }, 
            failure: function ( result, request) {
                Ext.MessageBox.alert('Foutmelding', "Fout bij ophalen plannen" + result.responseText);
                this.panel.setLoading(false);
            } 
        });
    },
    typeChanged: function(){        
    },
    statusChanged: function(){},
    planChanged: function(){},
    docChanged: function(){},
    
    setPlans: function (plans){
        this.currentPlans = plans;
        
        var uniqueTypes = [];
        var uniqueStatus = [];
        for (var planId in this.currentPlans){
            var plan = this.currentPlans[planId];
            if (plan.typePlan &&
                    !Ext.Array.contains(uniqueTypes,plan.typePlan)){
                uniqueTypes.push(plan.typePlan);
            }
            if (plan.planstatus &&
                !Ext.Array.contains(uniqueStatus,plan.planstatus)){
                uniqueStatus.push(plan.planstatus);
            }
        }
        this.setTypes(uniqueTypes);
        this.setStatus(uniqueStatus);
    },
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
    getExtComponents: function() {
        return [ (this.panel !== null) ? this.panel.getId() : '' ];
    }
});

