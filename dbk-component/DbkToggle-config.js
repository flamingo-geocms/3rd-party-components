/* 
 * Copyright (C) 2015 ARIS B.V.
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
 * Custom configuration object for DBK Toggle Button component configuration
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
//                    name: 'tooltip',
//                    fieldLabel: 'Tooltip',
//                    value: this.configObject.tooltip || "Tonen/verbergen DBK's"
//                },{
                    xtype: 'combo',
                    name: 'startupState',
                    fieldLabel: "DBK's zijn zichtbaar na opstarten",
                    anchor: '50%',
                    value: this.configObject.startupState || 'visible',
                    fields: ['value','text'],
                    store: [
                        ['visible','ja'],
                        ['invisible','nee']
                    ]
            }],
            renderTo: parentId
        });      
    }
});
