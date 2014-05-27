/*!
 *  Copyright (c) 2014 Milo van der Linden (milo@dogodigi.net)
 * 
 *  This file is part of safetymapDBK
 *  
 *  safetymapDBK is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  safetymapDBK is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with safetymapDBK. If not, see <http://www.gnu.org/licenses/>.
 *
 */

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.feature = {
    id: "dbk.modules.feature",
    /**
     * URL naar een statisch boringen bestand in gml formaat
     */
    features: [],
    /**
     * Laag. Wordt geiniteerd met de functie dbkobject.show() kan worden overruled
     */
    highlightlayer: null,
    timer: null,
    showlabels: true,
    layer: null,
    currentCluster: [],
    selection: null,
    /**
     * The layer that will hold the incidents
     */

    /**
     * The layer that will hold the incident sketches such as catchement areas and route
     */
//    sketch: new OpenLayers.Layer.Vector("Feature_sketch", {
//        rendererOptions: {
//            zIndexing: true
//        }
//    }),
    getActive: function() {
        var _obj = dbkjs.modules.feature;
        var feature;
        var _search_field = 'identificatie';
        var _search_value;
        if (!dbkjs.util.isJsonNull(dbkjs.options.dbk)) {
            _search_field = 'identificatie';
            _search_value = dbkjs.options.dbk;
        } else if (!dbkjs.util.isJsonNull(dbkjs.options.omsnummer)) {
            _search_field = 'OMSNummer';
            _search_value = dbkjs.options.omsnummer;
        }
        if (_search_value) {
            $.each(_obj.layer.features, function(fi, fv) {
                if (fv.cluster) {
                    $.each(fv.cluster, function(ci, cv) {
                        if (cv.attributes[_search_field]) {
                            if (cv.attributes[_search_field].toString() === _search_value.toString()) {
                                feature = cv;
                            }
                        }
                    });
                } else {
                    if (fv.attributes[_search_field]) {
                        if (fv.attributes[_search_field].toString() === _search_value.toString()) {
                            feature = fv;
                        }
                    }
                }
            });

            if (feature) {
                dbkjs.options.dbk = feature.attributes.identificatie;
                dbkjs.modules.updateFilter(dbkjs.options.dbk);
                return feature;
            } else {
                return false;
            }
        }
    },
    register: function(options) {
        console.log("feature.register");
        
        var _obj = dbkjs.modules.feature;
        
        /*@@
        $('#btngrp_navigation').append(
            '<a id="btn_refresh" class="btn btn-default navbar-btn" href="#" title="'+
            i18n.t('app.refresh') + '"><i class="icon-refresh"></i></a>'
        );
        $('#btn_refresh').click(function() {
            _obj.get();
        });
        */
        _obj.namespace = options.namespace || _obj.namespace;
        _obj.url = options.url || _obj.url;
        _obj.visibility = options.visible || _obj.visibility;
        _obj.layer = new OpenLayers.Layer.Vector("Feature", {
            rendererOptions: {
                zIndexing: true
            },
            strategies: [
                new OpenLayers.Strategy.Cluster({
                    distance: 100,
                    threshold: 2
                })
            ],
            minResolution: 1,
            styleMap: dbkjs.config.styles.dbkfeature
        });
        _obj.layer.setZIndex(2006);
        //_obj.sketch.setZIndex(2002);
        _obj.layer.displayInLayerSwitcher = false;
        //_obj.sketch.displayInLayerSwitcher = false;
        dbkjs.map.addLayer(_obj.layer);
        
        //Add the layer to the selectControl
        dbkjs.selectControl.setLayer((dbkjs.selectControl.layers || dbkjs.selectControl.layer).concat(_obj.layer));
        dbkjs.selectControl.activate();
        _obj.layer.events.on({
            "featureselected": _obj.getfeatureinfo,
            "featuresadded": function() {
            },
            "featureunselected": function(e) {
               // $('#infopanel').hide();
            }
        });
        
        _obj.get();
    },
    get: function() {
        console.log("feature.get");
        
        var _obj = dbkjs.modules.feature;
        if(_obj.layer){
            _obj.layer.destroyFeatures();
        }
        var params = {
            srid: dbkjs.options.projection.srid,
            timestamp: new Date().getTime()
        };
        //@@$.getJSON('api/features.json', params).done(function(data) {
        //$.getJSON('/viewer/viewer-html/components/dbk-component/dbk/data/features.json', params).done(function(data) {
        $.getJSON(dbkjs.dataPath + '/features.json', params).done(function(data) {
            var geojson_format = new OpenLayers.Format.GeoJSON();
                _obj.features = geojson_format.read(data);
//                var test = data.features.where( "( el, i, res, param ) => el.properties.gevaarlijkestof !== null");
//                console.log(test.length + ' DBK Features met gevaarlijke stoffen');
//                var test = data.features.where( "( el, i, res, param ) => el.properties.OMSNummer !== null");
//                console.log(test.length + ' DBK Features met OMS nummer');
//                var test = data.features.where( "( el, i, res, param ) => el.properties.typeFeature === 'Object'");
//                console.log(test.length + ' DBK objecten');
//                var test = data.features.where( "( el, i, res, param ) => el.properties.typeFeature === 'Gebied'");
//                console.log(test.length + ' DBK gebieden');
                _obj.layer.addFeatures(_obj.features);
                _obj.search_dbk();
        }).fail(function( jqxhr, textStatus, error ) {
            dbkjs.options.feature = null;
            dbkjs.util.alert('Fout', ' Features konden niet worden ingelezen', 'alert-danger');
        });
    },
    featureInfohtml: function(feature) {
        console.log("feature.featureInfohtml");
        
        var _obj = dbkjs.modules.feature;
        var ret_title = $('<li></li>');
        //@@ret_title.append('<a href="#">' + feature.attributes.formeleNaam + '</a>');
        ret_title.append('<a id="' + feature.attributes.identificatie + '" href="#">' + feature.attributes.formeleNaam + '</a>');

/*@@        $(ret_title).click(function() {
            //dbkjs.options.dbk = feature.attributes.identificatie;
            dbkjs.modules.updateFilter(feature.attributes.identificatie);
            dbkjs.protocol.jsonDBK.process(feature);
            _obj.zoomToFeature(feature);
            return false;
        }); */
        return ret_title;
    },
    search_dbk: function() {
        console.log("feature.search_dbk");

        var _obj = dbkjs.modules.feature;
        //Voeg de DBK objecten toe aan de typeahead set..
        var dbk_naam_array = [];

        $.each(_obj.features, function(key, value) {
            dbk_naam_array.push({
                value: value.attributes.formeleNaam + ' ' + value.attributes.informeleNaam,
                geometry: value.geometry,
                id: value.attributes.identificatie,
                attributes: value.attributes
            });
        });
        
        /*@@
        $('#search_input').typeahead('destroy');
        $('#search_input').val('');
        $('#search_input').typeahead({
            name: 'dbk',
            local: dbk_naam_array,
            limit: 10
        });
        $('#search_input').bind('typeahead:selected', function(obj, datum) {
            //dbkjs.options.dbk = datum.id;
            dbkjs.modules.updateFilter(datum.id);
            //@todo select the feature based on the datum
            dbkjs.protocol.jsonDBK.process(datum);
            _obj.zoomToFeature(datum);
        });
        */
    },
    search_oms: function() {
        var _obj = dbkjs.modules.feature;
        var dbk_naam_array = [];

        $.each(_obj.features, function(key, value) {
            //alert(value.properties.formeleNaam + ' (' + value.properties.identificatie_id + ')');
            if (!dbkjs.util.isJsonNull(value.attributes.OMSNummer)) {
                dbk_naam_array.push({
                    value: value.attributes.OMSNummer + ' - ' + value.attributes.formeleNaam,
                    geometry: value.geometry,
                    attributes: value.attributes,
                    id: value.attributes.identificatie
                });
            }
        });
        $('#search_input').typeahead('destroy');
        $('#search_input').val('');
        $('#search_input').typeahead({
            name: 'oms',
            local: dbk_naam_array,
            limit: 10
        });
        $('#search_input').bind('typeahead:selected', function(obj, datum) {
            dbkjs.modules.updateFilter(datum.id);
            dbkjs.protocol.jsonDBK.process(datum);
            _obj.zoomToFeature(datum);
        });
    },
    zoomToFeature: function(feature) {
        console.log("feature.zoomToFeature");
        
        dbkjs.options.dbk = feature.attributes.identificatie;
        dbkjs.modules.updateFilter(feature.attributes.identificatie);
        if (dbkjs.map.zoom < dbkjs.options.zoom) {
            dbkjs.map.setCenter(feature.geometry.getBounds().getCenterLonLat(), dbkjs.options.zoom);
        } else {
            dbkjs.map.setCenter(feature.geometry.getBounds().getCenterLonLat());
        }
    },
    //@@ Wordt aangeroepen bij klikken op een feature cluster.
    getfeatureinfo: function(e) {
        var _obj = dbkjs.modules.feature;
        
        //@@
        console.log("feature.getfeatureinfo");
        var dbkComp = dbkjs.viewerController.getComponentsByClassName("viewer.components.Dbk")[0];
        var infoPanel = dbkComp.infoPanel;
        //@@
        dbkjs.options.feature = null;
        
        if (typeof(e.feature) !== "undefined") {
            
            //@@ $('#infopanel_b').html('');
            infoPanel.updateHtml("");
            
            if (e.feature.cluster) {
                if (e.feature.cluster.length === 1) {
                    _obj.zoomToFeature(e.feature.cluster[0]);
                } else {
                    //@@
                    //@@ $('#infopanel_f').append('<ul id="Pagination" class="pagination"></ul>');
                    //@@ $('#infopanel_f').show();
                    infoPanel.updateTitle('<span class="h4"><i class="icon-info-sign"></i> &nbsp;Informatie</span>');
                    infoPanel.updateFooterHtml('<ul id="Pagination" class="pagination"></ul>');
                    //Show the panel, otherwise the Pagination callback function won't work!
                    infoPanel.show();
                    _obj.currentCluster = e.feature.cluster;
                    $("#Pagination").pagination(e.feature.cluster.length, {
                        items_per_page: 10,
                        callback: function(page_index, jq) {
                            var items_per_page = 10;
                            var max_elem = Math.min((page_index + 1) * items_per_page, _obj.currentCluster.length);
                            var feature = _obj.currentCluster[i];
                            //var item_ul = $('<ul class="nav nav-pills nav-stacked"></ul>');
                            var item_ul = $('<ul id="dbklist" class="nav nav-pills nav-stacked"></ul>');

                            //@@ $('#infopanel_b').html('');
                            infoPanel.updateHtml("");

                            for (var i = page_index * items_per_page; i < max_elem; i++) {
                                item_ul.append(_obj.featureInfohtml(_obj.currentCluster[i]));
                            }
                            //@@ $('#infopanel_b').append(item_ul);
                            var s = dbkjs.util.outerHtml(item_ul);
                            infoPanel.updateHtml(s);

                            //@@ Add a click-event to the list, for each anchor-tag
                            //@@ in the list.
                            $("#dbklist").on("click", "a", function(event) {
                                event.preventDefault();
                                dbkjs.options.dbk = $ (this).attr("id");
                                var feature = _obj.getActive();
                                dbkjs.protocol.jsonDBK.process(feature);
                                _obj.zoomToFeature(feature);
                                return false;
                            });
                        }
                    });
                    //@@ $('#infopanel').show(true);
                    infoPanel.show();
                }
            } else {
                //@@ Clicked on 1 DBK.
                _obj.currentCluster = [];
                //@@
                dbkjs.protocol.jsonDBK.process(e.feature);
                _obj.zoomToFeature(e.feature);
                //@@ $('#infopanel').hide();
                infoPanel.hide();
            }
        }
    }
};
