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
 * 
 * @author <a href="mailto:eddy.scheper@aris.nl">Eddy Scheper</a>
 */

OpenLayers.Strategy.Fixed.prototype.merge = function(mapProjection, resp) {
    var layer = this.layer;
    layer.destroyFeatures();
    var features = resp.features;
    if (features && features.length > 0) {
//        if(!mapProjection.equals(layer.projection)) {
//            var geom;
//            for(var i=0, len=features.length; i<len; ++i) {
//                geom = features[i].geometry;
//                if(geom) {
//                    geom.transform(layer.projection, mapProjection);
//                }
//            }
//        }
        layer.addFeatures(features);
    }
    layer.events.triggerEvent("loadend");
};
