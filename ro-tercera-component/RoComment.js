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
Ext.define ("viewer.components.rotercera.RoComment",{
    extend: "viewer.components.Edit",

    window: null,
    planId: null,
    config: {
        planIdAttributeName : "BESTEMMINGSPLANGEBIEDID",
        publicAttributeName:  "OPENBAAR",
        ownerAttributeName: "EIGENAAR",
        component: null
    },
    constructor: function(conf,component){
        conf.isPopup=true;
        conf.component=component;
        conf.allowDelete = true;
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
    newComment: function (planId){
        this.startComment(planId,this.createNew);
        Ext.getCmp(this.name + "CommentDeleteButton").hide();
    },
    editComment: function(planId,feature){
        this.startComment(planId,function(){
            //if scope ommited: the scope is the component
            this.planId=planId;
            this.mode = "edit";
            this.handleFeature(feature);
            Ext.getCmp(this.name + "CommentDeleteButton").show();
        });
    },
    startComment: function(planId,afterLoadAttributes){
        this.planId=planId;
        if (this.vectorLayer==null){
            this.createVectorLayer();
        }
        if (this.window==null){
            this.createInputWindow();
        }
        this.layerChanged(this.layerSelector.getValue(),null,null,afterLoadAttributes);
        Ext.getCmp(this.name + "CommentSaveButton").enable();
        this.window.show();
    },

    createNew : function(){
        this.vectorLayer.removeAllFeatures();
        this.viewerController.mapComponent.getMap().removeMarker("edit");
        this.mode = "new";
        if(this.newGeomType != null && this.geometryEditable){
            this.vectorLayer.drawFeature(this.newGeomType);
        }
        Ext.getCmp(this.name + "CommentDeleteButton").hide();
    },

    createInputWindow: function(){
        var me = this;
        this.inputContainer = Ext.create("Ext.form.Panel",{
            id: this.name + 'CommentInputPanel',
            border: 0,
            autoScroll: true,
            flex: 1
        });
        this.window = Ext.create("Ext.window.Window",{
            title: "Ro-Commentaar",
            height: 350,
            width: 290,
            closeAction: 'hide',
            listeners:{
                hide:{
                    scope:this,
                    fn: function(){
                        this.vectorLayer.stopDrawing();
                    }
                }
            },
            resizable: false,
            layout: {
                type: "vbox",
                align: 'stretch',
                pack: 'start'
            },
            items: [
                this.inputContainer,
                {
                    id: this.name + 'CommentSavePanel',
                    xtype: "container",
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
                        id : this.name + "CommentCancelButton",
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
                        id : this.name + "CommentSaveButton",
                        tooltip: "Opslaan",
                        text: "Opslaan",
                        listeners: {
                            click:{
                                scope: me,
                                fn: function(){
                                    if(this.vectorLayer.getActiveFeature() !== null){
                                        Ext.getCmp(this.name + "CommentSaveButton").disable();
                                        me.save();
                                    }else{
                                         Ext.MessageBox.alert('Foutmelding', "Commentaar niet compleet: geometrie mist.");
                                    }
                                }
                            }
                        }
                    },
                    {
                        id : this.name + "CommentDeleteButton",
                        tooltip: "Verwijder",
                        text: "Verwijder",
                        listeners: {
                            click:{
                                scope: me,
                                fn: me.remove
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
        feature[this.config.planIdAttributeName]=this.planId;
        //add user
        feature[this.config.ownerAttributeName] = user.name;
        return feature;
    },
    /**
     * @override
     */
    saveSucces  : function(fid){
        Ext.getCmp(this.name + "saveButton").enable();
        this.config.component.roAllComment.reload();
        this.callParent(arguments);
        Ext.getCmp(this.name + "CommentDeleteButton").show();
    },
    /**
     * @override
     */
    saveFailed : function(fid){
        Ext.getCmp(this.name + "CommentSaveButton").enable();
        this.callParent(arguments);
    },
    /**
     * @override
     */
    deleteSucces: function(){
        this.config.component.roAllComment.reload();
        this.callParent(arguments);
    },
    /**
     * @override
     */
    allowedEditable: function(attribute){
        if (attribute.name === this.config.ownerAttributeName){
            return false;
        }else{
            return true;
        }
    }

});