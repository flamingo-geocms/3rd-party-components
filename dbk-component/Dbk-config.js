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
    constructor: function (parentid,config){
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentid,config);
        if(config === undefined || config === null){
            config = new Object();
        }
        var me = this;
        
        me.labelWidth = 150;
        
        this.form = new Ext.form.FormPanel({
            url: 'Home/SubmitForm',
            frame: false,
            title: 'Configureer dit component',
            width: me.formWidth,
            bodyPadding: me.formPadding,
            defaultType: 'textfield',
            defaults: {
                anchor: '100%',
                labelWidth: me.labelWidth
            },
            items: [{
                    xtype: 'label',
                    text: 'Data',
                    style: 'font-weight:bold;'
                },{
                    name: 'dataPath',
                    fieldLabel: 'Url van DBK data service:',
                    value: config.dataPath || ''
                },{
                    xtype: 'label',
                    text: 'WMS service met lagen voor het printen',
                    style: 'font-weight:bold;'
                },{
                    name: 'printWMSPath',
                    fieldLabel: 'Url van de service',
                    value: config.printWMSPath || ''
                },{
                    name: 'printLayerNames',
                    fieldLabel: 'Namen van de lagen',
                    value: config.printLayerNames || ''
                },{
                    xtype: 'combo',
                    name: 'printFormat',
                    fieldLabel: 'Formaat',
                    anchor: '50%',
                    value: config.printFormat || 'image/png',
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
                    value: config.printSRS || 'EPSG%3A28992',
                    fields: ['value','text'],
                    store: [
                        ['EPSG%3A28992','EPSG:28992'],
                        ['EPSG%3A4326','EPSG:4326']
                    ]
                },{
                    xtype: 'checkbox',
                    name: 'printTransparent',
                    fieldLabel: 'Transparant',
                    checked: typeof config.printTransparent !== "undefined" ? config.printTransparent : true
                },{
                    xtype: 'numberfield',
                    name: 'printAlpha',
                    fieldLabel: 'Transparantie %',
                    anchor: '35%',
                    minValue: 0,
                    maxValue: 100,
                    value: config.printAlpha || 100
            }],
            renderTo: parentid
        });      
    }
});
