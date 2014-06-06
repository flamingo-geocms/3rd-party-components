/* 
 * Copyright (C) 2014 ARIS B.V.
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
 * DbkDialog class
 * Creates a floating window.
 * 
 * @author <a href="mailto:eddy.scheper@aris.nl">Eddy Scheper</a>
 * @author <a href="mailto:anke.keuren@aris.nl">Anke Keuren</a>
 */

    
//Ext.define("viewer.components.DbkDialog",{
//    // DUMMY CODE
//    extend: "Ext.window.Window",
//    title: "Window",
//    layout: "fit",
//    items: [],
//    constructor : function (config){
//        console.log("viewer.components.DbkDialog.constructor");
//        viewer.components.DbkDialog.superclass.constructor.call(this, config);
//    }
//});
    
Ext.define("viewer.components.DbkDialog",{
    dialog: null,
    deltaWidth: null,
    deltaHeight: null,
    config:{
        id: "window",
        dbk: null,
        width: 350,
        height: 300,
        divId: null,
        align: "br-br",
        fitWindow: false
    },
    constructor: function(config){
        console.log("DbkDialog.constructor");

        this.initConfig(config);
        
        this.createWindow(this.getId());
    },
    createWindow: function(itemId) {
        var me = this;
        var panelId = itemId+"Panel";
        var footerId = itemId+"Footer";
        var htmlId = itemId+"Html";
        var windowWidth = this.width;
        var windowHeight = this.height;
        this.dialog = Ext.create("Ext.window.Window", {
            itemId: itemId,
            title: "Informatie",
            width: windowWidth,
            height: windowHeight,
            right: 0,
            bottom: 0,
            resizable: false,
            closeAction: "hide",
            constrain: true,
            layout: {
                type: "vbox"
            },
            items: [{
                id: panelId,
                width: "100%",
                flex: 1,
                border: false,
                html: "<div id='"+htmlId+"' style='width:100%;height:100%;'></div>"
            },{
                itemId: footerId,
                width: "100%",
                height: 50,
                border: false,
                hidden: true,
                bodyStyle: "background-color: #F5F5F5; padding: 10px;",
                html: "footer"
           }],
           listeners: {
               hide: function() {
                   if (me.getId() === "infopanel") {
                       dbkjs.options.feature = null;
                   }
               },
               show: function() {
                   me.dialog.alignTo(Ext.getBody(), me.align);
               }
           }
        });
    },
    getPanel: function() {
        var panelId;
        panelId = this.dialog.getItemId()+"Panel";
        return this.dialog.getComponent(panelId);
    },
    getFooterPanel: function() {
        var panelId;
        panelId = this.dialog.getItemId()+"Footer";
        return this.dialog.getComponent(panelId);
    },
    hide: function() {
        if (this.dialog) {
            this.dialog.hide();
        }
    },
    hideFooterPanel: function() {
        this.getFooterPanel().hide();
    },
    initDeltaWidthHeight: function() {
        // Not yet set?
        if (!this.deltaWidth) {
            var htmlId = this.getId()+"Html";
            // Force rendering.
            this.dialog.show();
            // Get default html div.
            var div = Ext.get(htmlId);
            if (div) {
                this.deltaWidth = this.dialog.getWidth() - div.dom.clientWidth;
                this.deltaHeight = this.dialog.getHeight()- div.dom.clientHeight;
            }
        }
    },
    resizeWindow: function() {
        if (!this.deltaWidth)
            return;
        var panel = this.getPanel();
        if (!panel)
            return;
        var panelBody = panel.el.down("div");
        if (!panelBody)
            return;
        // Get first div of html content.
        var htmlDiv = panelBody.down("div");
        if (!htmlDiv)
            return;
        // Resize window to content.
        var width = htmlDiv.dom.clientWidth;
        var height = htmlDiv.dom.clientHeight;
        this.dialog.setWidth(width+this.deltaWidth);
        this.dialog.setHeight(height+this.deltaHeight);
    },
    show: function() {
        if (this.dialog) {
            this.dialog.show();
        }
    },
    showFooterPanel: function() {
        this.getFooterPanel().show();
    },
    updateFooterHtml: function(html) {
        if (html !== '') {
            this.showFooterPanel();
        }
        else {
            this.hideFooterPanel();
        }
        this.getFooterPanel().update(html);
    },
    updateHtml: function(html) {
        console.log("DbkDialog.updateHtml");
        
        // Need to grow or shrink window later?
        if (this.fitWindow) {
            // Get delta width and height.
            this.initDeltaWidthHeight();
        };
        
        // Update content.
        this.getPanel().update(html);
        
        // Need to grow or shrink window?
        if (this.fitWindow) {
            // Need grow or shrink window.
            this.resizeWindow();
        }
    },
    /* 
     * Is being called in feature.getfeatureinfo().
     */
    updateTitle: function(title) {
      this.dialog.setTitle(title);
    }
});
