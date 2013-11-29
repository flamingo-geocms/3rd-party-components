Ext.define ("viewer.components.rotercera.RoComment",{
    extend: "viewer.components.Edit",
    constructor: function(conf){
        conf.isPopup=true;
        viewer.components.Edit.superclass.constructor.call(this, conf);        
        var div = this.getContentDiv();
        
        this.inputContainer =  Ext.getCmp(this.name + 'InputPanel');
        //todo: remove and use other functions
        this.loadWindow();
    },
    createLayerSelector: function(){
        var me = this;
        //dummy layer selector
        this.layerSelector= {
            initLayers: function(){                
            },getValue: function(){
                return me.viewerController.getAppLayerById(me.layers[0]);
            },comboselect: {
                select: function(){}
            },getSelectedAppLayer: function(){
                return me.viewerController.getAppLayerById(me.layers[0]);
            }
        };
    },
    createNew: function(){
        if (this.vectorLayer==null){
            this.createVectorLayer();
        }else{
            this.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
        }
        this.layerChanged(this.layerSelector.getValue());
        this.callParent(arguments);
        this.loadWindow();
    }
});