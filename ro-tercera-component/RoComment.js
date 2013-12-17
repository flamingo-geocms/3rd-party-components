Ext.define ("viewer.components.rotercera.RoComment",{
    extend: "viewer.components.Edit",
    
    window: null,
    planId: null,
    config: {
        planIdAttributeName : "bestemmingsplangebiedid",
        publicAttributeName:  "openbaar",
        ownerAttributeName: "eigenaar",
        component: null
    },
    constructor: function(conf,component){
        conf.isPopup=true;
        conf.component=component;
        this.initConfig(conf);
        viewer.components.Edit.superclass.constructor.call(this, conf);        
        var div = this.getContentDiv();        
        this.loadWindow();
    },
    
    createLayerSelector: function(){
        var me = this;
        //dummy layer selector
        this.layerSelector= {
            initLayers: function(){                
            },getValue: function(){
                if (me.layers){
                    return me.viewerController.getAppLayerById(me.layers[0]);
                }else{
                    return null;
                }
            },combobox: {
                select: function(){}
            },getSelectedAppLayer: function(){
                if (me.layers){
                    return me.viewerController.getAppLayerById(me.layers[0]);
                }else{
                    return null;
                }
            }
        };
    },
    startComment: function(planId){
        this.planId=planId;
        if (this.vectorLayer==null){
            this.createVectorLayer();
            this.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
        }
        if (this.window==null){
            this.createInputWindow();
        }
        this.layerChanged(this.layerSelector.getValue(),this.createNew);
        this.window.show();
    },
        
    createNew : function(){
        this.vectorLayer.removeAllFeatures();
        this.viewerController.mapComponent.getMap().removeMarker("edit");
        this.mode = "new";
        if(this.newGeomType != null && this.geometryEditable){
            this.vectorLayer.drawFeature(this.newGeomType);
        }
    },
    
    createInputWindow: function(){
        var me = this;
        this.inputContainer = Ext.create("Ext.form.Panel",{             
            id: this.name + 'InputPanel',
            border: 0,
            autoScroll: true,
            width: '100%',
            height: 300
        });
        this.window = Ext.create("Ext.window.Window",{
            title: "Ro-Commentaar",
            height: 600,
            width: 400,            
            closeAction: 'hide',
            items: [
                this.inputContainer,
                {
                    id: this.name + 'savePanel',
                    xtype: "container",
                    width: '100%',
                    height: MobileManager.isMobile() ? 45 : 30,
                    layout: {
                        type: 'hbox',
                        pack: 'end'
                    },
                    defaults: {
                        xtype: 'button',
                        componentCls: 'mobileLarge'
                    },
                    items:[
                    {
                        id : this.name + "cancelButton",
                        tooltip: "Annuleren",
                        text: "Annuleren",
                        listeners: {
                            click:{
                                scope: me,
                                fn: me.cancel
                            }
                        }
                    },
                    {
                        id : this.name + "saveButton",
                        tooltip: "Opslaan",
                        text: "Opslaan",
                        listeners: {
                            click:{
                                scope: me,
                                fn: me.save
                            }
                        }
                    }
                    ]
                }
            ] 
        });
    },
        
    /**
     * @override
     */ 
    cancel: function (){
        this.callParent(arguments);
        if (this.window){
            this.window.hide();
        }
        this.vectorLayer.stopDrawing();
    },
    changeFeatureBeforeSave: function(feature){
        if (this.planId ==null || this.planId == undefined){
            throw "Geen plan geselecteerd";
        }
        if (user==null){
            throw "Er is niet ingelogd. Er kan geen commentaar worden aangemaakt";
        }
        feature[this.planIdAttributeName]=this.planId;
        //add user
        feature.eigenaar=user.name;
        return feature;
    },
    /**
     * @override
     */
    saveSucces  : function(fid){
        this.component.roAllComment.reload();
        this.callParent(arguments);
    }
});