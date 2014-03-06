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
Ext.define ("viewer.components.rotercera.RoAllComment",{
    
    window: null,
    featureService: null,
    featureContainer: null,
    planContainer:null,
    planId: null,
    config: {
        viewerController: null,
        layers: null,
        component: null
    },
    constructor: function(conf,component){
        conf.component=component;
        this.initConfig(conf);
    },
            
    getAllComments: function(planId,show){
        if (show==undefined){
            show=true;
        }
        this.planId = planId;
        var fs = this.getFeatureService();
        var options = {limit: 1000,edit:true};
        var me = this;
        fs.loadFeatures(this.viewerController.getAppLayerById(this.layers[0]),
                function(features){
                    me.showFeatures(features);
                    if (show){
                        me.window.show();
                    }
                },
                this.onFail,
                options,
                this);
    },
    reload: function (planId){
        this.getAllComments(this.planId,false);
    },
    showFeatures: function(features){
        if (this.window==null){
            this.createWindow();
        }
        this.featureContainer.removeAll();
        this.planContainer.update(this.component.selectedPlan.identificatie);
        
        
        for (var i=0; i < features.length; i++){
            var f = features[i];
            var el = this.createCommentElement(f);
            this.featureContainer.add(el);
        }
    },
    createCommentElement: function(feature){
        var tekst= feature.tekst? feature.tekst : "";
        var thema= feature.thema? feature.thema : "";
        var eigenaar= feature.eigenaar? feature.eigenaar : "";
        var openbaar= feature.openbaar? feature.openbaar : false;
        var compleetplan= feature.compleetplan? feature.compleetplan : false;
        
        var me = this;
        
        var topItems=[{
                xtype: 'container',
                html: eigenaar,
                flex: 1
            },{
                xtype: 'container',
                html: thema,
                flex: 1
            }];
            
        if (user!=null && user.name == eigenaar){
            topItems.push({
                type: "container",
                html: "Wijzig",
                flex: 1,
                listeners:{
                    element: 'el',
                    click: function(){
                        me.onEditClick(feature);
                    }
                }
            });
        }
        
        var el = Ext.create("Ext.container.Container",{            
            items: [{
                xtype: 'container',
                style: {
                    "background-color": '#FFCC00'                    
                },
                height: "10px"
            },{
                //top
                xtype: 'container',
                layout: {
                    type: 'hbox'
                },
                items: topItems,
                flex: 1
            },{
                //bottom
                xtype: 'container',
                html: tekst,
                style: {
                    "background-color": "#DDD"
                },
                flex: 1
            }],
            border: 1    
        });
        
        return el;
    },
    onFail: function (message){
        Ext.MessageBox.alert('Foutmelding', "Fout bij laden features" + message);
    },
    onEditClick: function(feature){
        this.component.roComment.editComment(this.planId,feature);
    },
    createWindow: function(){        
        this.planContainer = Ext.create("Ext.container.Container",{
            xtype: 'container',            
            width: "100%",
            height: 40
        });
        this.featureContainer = Ext.create("Ext.container.Container",{
            xtype: 'container',
            id: 'allCommentContainer',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            autoScroll: true,
            height: 560
        });
        this.window = Ext.create("Ext.window.Window",{
            title: "Ro-TOC",
            height: 600,
            width: 400,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            closeAction: 'hide',
            items: [this.planContainer,this.featureContainer]
        });
    },    
            
    getFeatureService: function(){
        if (this.featureService==null){
            this.featureService = this.viewerController.getAppLayerFeatureService(this.viewerController.getAppLayerById(this.layers[0]));        
        }
        return this.featureService;
    }
});
