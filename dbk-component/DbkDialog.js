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
    store: null,
    config:{
        id: "window",
        dbk: null,
        x: 0,
        y: 100,
        width: 350,
        height: 300,
        divId: null,
        align: "br-br"
    },
    constructor: function(config){
        console.log("DbkDialog.constructor");

        this.initConfig(config);
        
        this.createWindow(this.getId());
    },
    createWindow: function(itemId) {
        var me = this;
        var headerId = itemId+"Header";
        var panelId = itemId+"Panel";
        var footerId = itemId+"Footer";
        var windowX = this.x;
        var windowY = this.y;
        var windowWidth = this.width;
        var windowHeight = this.height;
        this.dialog = Ext.create("Ext.window.Window", {
            itemId: itemId,
            title: "Informatie",
            width: windowWidth,
            height: windowHeight,
//            x: windowX,
//            y: windowY,
            right: 0,
            bottom: 0,
            resizable: false,
            closeAction: "hide",
            constrain: true,
            //header: false,
            layout: {
                type: "vbox"//,
                //align: "left"
            },
            items: [{
                itemId: headerId,
                width: "100%",
                height: 50,
                border: false,
                hidden: true,
                html: "header"
            },{
//                itemId: panelId,
                id: panelId,
                width: "100%",
                //layout: "fit",
                //width: "auto",
                //autoWidth: true,
                flex: 1,
                border: false,
                html: "panel"
            },{
                itemId: footerId,
                width: "100%",
                height: 50,
                border: false,
                hidden: true,
                bodyStyle: "background-color: #F5F5F5; padding: 10px;",
                //bodyStyle: "background-color:#F5F5F5;",
//                bodyStyle: {
//                    "background-color": "#F5F5F5",
//                    "padding": "10px"
//                },
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
//                   resize: function() {
//                       if (me.divId) {
//                           var panel = me.getPanel();
//                           if (panel) {
//                               var child = Ext.get(me.divId);
//                               if (child) {
//                                   child.setWidth(panel.getWidth());
//                                   child.setHeight(panel.getHeight());
//                               }
//                           }
//                       }
//                   }
               //}
        });
        // Align dialog.
        //this.dialog.alignTo(Ext.getBody(),"r-r",[-75, 0]);
        //this.dialog.alignTo(Ext.getBody(),"br-br");
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
    show: function() {
        if (this.dialog) {
            this.dialog.show();
            //this.dialog.alignTo(Ext.getBody(),"r-r",[-75, 0]);
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
        this.getPanel().update(html);
    },
    /* 
     * Wordt aangeroepen in feature.getfeatureinfo().
     */
    updateTitle: function(title) {
      this.dialog.setTitle(title);
    }
});
