Ext.define ("viewer.components.rotercera.RoComment",{
    extend: "viewer.components.Edit",
    
    window: null,
    
    constructor: function(conf){
        conf.isPopup=true;
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
                return me.viewerController.getAppLayerById(me.layers[0]);
            },combobox: {
                select: function(){}
            },getSelectedAppLayer: function(){
                return me.viewerController.getAppLayerById(me.layers[0]);
            }
        };
    },
    startComment: function(){
        if (this.vectorLayer==null){
            this.createVectorLayer();
        }else{
            this.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
        }
        if (this.window==null){
            this.createInputWindow();
        }
        this.layerChanged(this.layerSelector.getValue());
        this.window.show();
    },
            
    initAttributeInputs: function(){
        this.callParent(arguments);
        this.createNew();
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
            height: 200
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
    }
});