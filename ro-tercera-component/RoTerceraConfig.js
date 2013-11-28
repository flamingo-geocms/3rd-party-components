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
 * Custom configuration object for RoTercera configuration configuration
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.SelectionWindowConfig",
    constructor: function (parentId,configObject){
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId,configObject);        
        //this.createCheckBoxes(this.configObject.layers);
        this.addFormItems(configObject);
        this.createCheckBoxes(this.configObject.layers,{editable:true});
    },
    addFormItems: function(){
        var me =this;        
        this.form.add([{
                xtype: "textfield",
                name: "width",
                value: me.configObject.width ? me.configObject.width : 250,
                fieldLabel: "width",
                labelWidth: this.labelWidth
            },{
                xtype: "textfield",
                name: "height",
                value: me.configObject.height ? me.configObject.height: 500,
                fieldLabel: "height",
                labelWidth: this.labelWidth
            },{
                xtype: "textfield",
                name: "roServiceUrl",
                value: me.configObject.roServiceUrl,
                fieldLabel: "roServiceUrl",
                labelWidth: this.labelWidth
            },{
                xtype: "textfield",
                name: "terceraRequestPage",
                value: me.configObject.terceraRequestPage? me.configObject.terceraRequestPage : "https://tercera.provincie-utrecht.nl/RequestPage.aspx",
                fieldLabel: "terceraRequestPage",
                labelWidth: this.labelWidth
            },{
                xtype: "textfield",
                name: "roonlineLayers",
                value: me.configObject.roonlineLayers? me.configObject.roonlineLayers : "BP:Bestemmingsplangebied,BP:Wijzigingsplangebied,BP:Enkelbestemming,\
BP:Figuur,BP:Lettertekenaanduiding,BP:Maatvoering,BP:Dubbelbestemming,BP:Bouwvlak,\
BP:Gebiedsaanduiding,BP:Inpassingsplangebied,BP:Bouwaanduiding,BP:Functieaanduiding,\
PP:ProvinciaalPlangebied,PP:ProvinciaalGebied,PP:ProvinciaalComplex,\
PP:ProvinciaalVerbinding,NP:NationaalPlangebied,XGB:Besluitvlak,XGB:Besluitsubvlak,\
XGB:Exploitatieplangebied,XGB:Gerechtelijkeuitspraakgebied,XGB:Projectbesluitgebied,\
XGB:Tijdelijkeontheffingbuitenplansgebied,XGB:Voorbereidingsbesluitgebied,PCP:Plangebied",
                fieldLabel: "roonlineLayers",
                labelWidth: this.labelWidth
            },{
                xtype: "textfield",
                name: "roonlineServiceUrl",
                value: me.configObject.roonlineServiceUrl ? me.configObject.roonlineServiceUrl : "http://afnemers.ruimtelijkeplannen.nl/afnemers/services",
                fieldLabel: "roonlineServiceUrl",
                labelWidth: this.labelWidth
            }
        ]);
                 
    }
});

