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
 * Custom configuration object for DBK component configuration
 * @author <a href="mailto:eddy.scheper@aris.nl">Eddy Scheper</a>
 */

Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.ConfigObject",
    form: null,
    constructor: function (parentId, configObject, configPage){
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);

        this.labelWidth = 150;
        this.form = new Ext.form.FormPanel({
            url: 'Home/SubmitForm',
            frame: false,
            title: 'Configureer dit component',
            width: this.formWidth,
            bodyPadding: this.formPadding,
            defaultType: 'textfield',
            defaults: {
                anchor: '100%',
                labelWidth: this.labelWidth
            },
            items: [{
                    xtype: 'label',
                    text: 'Data',
                    style: 'font-weight:bold;'
                },{
                    name: 'dataPath',
                    fieldLabel: 'Url van DBK data service:',
                    value: this.configObject.dataPath || ''
                },{
                    xtype: 'label',
                    text: 'WMS service met lagen voor het printen',
                    style: 'font-weight:bold;'
                },{
                    name: 'printWMSPath',
                    fieldLabel: 'Url van de service',
                    value: this.configObject.printWMSPath || ''
                },{
                    name: 'printLayerNames',
                    fieldLabel: 'Namen van de lagen',
                    value: this.configObject.printLayerNames || ''
                },{
                    xtype: 'combo',
                    name: 'printFormat',
                    fieldLabel: 'Formaat',
                    anchor: '50%',
                    value: this.configObject.printFormat || 'image/png',
                    fields: ['value','text'],
                    store: [
                        ['image/png','image/png'],
                        ['image/png8','image/png8'],
                        ['image/jpeg','image/jpeg']
                    ]
                },{
                    xtype: 'combo',
                    name: 'printSRS',
                    fieldLabel: 'SRS',
                    anchor: '50%',
                    value: this.configObject.printSRS || 'EPSG%3A28992',
                    fields: ['value','text'],
                    store: [
                        ['EPSG%3A28992','EPSG:28992'],
                        ['EPSG%3A4326','EPSG:4326']
                    ]
                },{
                    xtype: 'checkbox',
                    name: 'printTransparent',
                    fieldLabel: 'Transparant',
                    checked: typeof this.configObject.printTransparent !== "undefined" ? this.configObject.printTransparent : true
                },{
                    xtype: 'numberfield',
                    name: 'printAlpha',
                    fieldLabel: 'Transparantie %',
                    anchor: '35%',
                    minValue: 0,
                    maxValue: 100,
                    value: this.configObject.printAlpha || 100
                },{
                    name: 'floorTabName',
                    fieldLabel: 'Naam verdiepingentabblad',
                    value: this.configObject.floorTabName || ''
                },{
                    xtype: 'checkbox',
                    name: 'showFloorName',
                    fieldLabel: 'Laat gekoppelde DBK naam zien',
                    checked: typeof this.configObject.showFloorName !== "undefined" ? this.configObject.showFloorName : false
                },{
                    xtype: 'checkbox',
                    name: 'useInformalName',
                    fieldLabel: 'Gebruik informele naam in scherm',
                    checked: typeof this.configObject.useInformalName !== "undefined" ? this.configObject.useInformalName : false
                }],
            renderTo: parentId
        });      
    }
});
