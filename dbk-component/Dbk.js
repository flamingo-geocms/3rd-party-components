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
 * Dbk component
 * 
 * @author <a href="mailto:eddy.scheper@aris.nl">Eddy Scheper</a>
 * @author <a href="mailto:anke.keuren@aris.nl">Anke Keuren</a>
 */

Ext.define ("viewer.components.Dbk",{
    extend: "viewer.components.Component",
    
    basePath: "",
    dataPath: "",
    mediaPath: "",
    imageBasePath: "",
    detailsPanel: null,
    infoPanel: null,
    
    constructor: function(conf){
        
        console.log("Dbk.constructor");

        viewer.components.Dbk.superclass.constructor.call(this, conf);
        
        this.initConfig(conf);
        
        this.initApp();

        return this;
    },
    initApp: function(){
        var me = this;
        
        console.log("Dbk.initSafetyMapsDbk");

        // Set the base path.
        this.basePath = "/viewer/3rd-party-components/dbk-component";

        // Set data path for feature and object info.
        this.dataPath = this.basePath + "/data";
            
        // Set the media path for object media info.
        this.mediaPath = this.dataPath + "/media";
        
        // Set icon path for dbkjs.config.styles.dbkfeature.
        this.imageBasePath = this.basePath + "/public";
        
        // Set the map.
        dbkjs.map = this.viewerController.mapComponent.getMap().getFrameworkMap();

        // Make sure i18n is initialized. Set the proper resource directory.
        i18n.init({
            lng: "nl", 
            debug: false,
            resGetPath: this.basePath + "/locales/__lng__/translation.json"
        }, function() {
            
            // @@ TODO: Dit nog anders. Hele dbk object in dbkjs zetten???
            //          Of met dbkjs.gui werken.
            // Set paths of dbkjs.
            dbkjs.dataPath = me.dataPath;
            dbkjs.mediaPath = me.mediaPath;
            dbkjs.imageBasePath = me.imageBasePath;

            // Set the viewcontroller.
            dbkjs.viewerController = me.viewerController;

            // Load css file.
            me.loadCssFile(me.basePath+"/public/css/bootstrap.min.css");
            me.loadCssFile(me.basePath+"/public/css/dbk.css");
            me.loadCssFile(me.basePath+"/public/css/dbk-zeeland.css");
            //me.loadCssFile(me.basePath+"/public/css/font-awesome.min.css");            
            
            // Initialize.
            dbkjs.init();
            
            // Get organisation info.
            me.initOrganisation();
            
            // Create the dialogs.
            me.createDialogs();
        
            // Initialize jsonDBK.init and register modules.
            dbkjs.successAuth();
            
            // Zoom to zeeland.
            //dbkjs.map.setCenter([45700,391000],8);
            // Zoom to Utrecht.
            //dbkjs.map.setCenter([134400,456000],8);
            dbkjs.map.setCenter([134400,456000],6);
             
       });
    },
    createDialogs: function(){
        console.log("Dbk.createDialogs");
        
        this.detailsPanel = Ext.create("viewer.components.DbkDialog",
            {id: "detailspanel", divId: "detailsTable"});
        this.infoPanel = Ext.create("viewer.components.DbkDialog",
            {id: "infopanel", x: 1200, y: 100, width: 490, height: 500,
             dbk: this});
    },
    getExtComponents: function() {
        return [];
    },
    getSelectedDBKObject: function () {
        return dbkjs.options.feature;
    },
    // See dbkjs.challengeAuth and organisation.json.
    initOrganisation: function(){
        dbkjs.options.organisation = {
            "gid": 1,
            "id": "zeeland",
            "logo": null,
            "workspace": "dbk",
            "title": "Zeeland",
            "area": {
                "geometry": {
                    "type": "Polygon",
                    "crs": {
                        "type": "name",
                        "properties": {
                            "name": "EPSG:28992"
                        }
                    },
                    "coordinates": [[[9686.56473944118, 358820.0255055], [11531.6167866597, 423478.950481169], [78565.4071192693, 422010.348564292], [77582.5899359003, 357338.412841884], [9686.56473944118, 358820.0255055]]]
                }
            },
            "support": {
                "mail": "milo@dogodigi.net",
                "button": "Fout in de kaart melden?"
            },
            //"modules": ["search", "measure", "print", "feature", "support"],
            "modules": ["feature"],
            "wms": [],
            "care": null
        };
    },
    loadCssFile: function(filename){
        var fileref = document.createElement("link");
        fileref.setAttribute("rel","stylesheet");
        fileref.setAttribute("type","text/css");
        fileref.setAttribute("href",filename);
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }
});
