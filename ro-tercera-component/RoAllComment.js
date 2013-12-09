Ext.define ("viewer.components.rotercera.RoAllComment",{
    
    window: null,
    featureService: null,
    
    config: {
        viewerController: null,
        layers: null
    },
    constructor: function(conf){
        this.initConfig(conf);
        this.featureService = this.viewerController.getAppLayerFeatureService(this.viewerController.getAppLayerById(this.layers[0]));        
    },
            
    getAllComments: function(){
        this.featureService.loadFeatures(this.layers[0],this.showFeatures,this.onFail);
    },
    showFeatures: function(features){
        if (this.window==null){
            this.createWindow();
        }
    },
    onFail: function (message){
        Ext.MessageBox.alert('Foutmelding', "Fout bij laden features" + message);
    },
    createWindow: function(){
        this.window = Ext.create("Ext.window.Window",{
            title: "Ro-TOC",
            height: 600,
            width: 200,
            layout: 'fit',
            closeAction: 'hide',
            items: [{
                xtype: 'container'                
            }]
        });
    }
});