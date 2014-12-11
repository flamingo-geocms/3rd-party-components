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

dbkjs.options = {
    projection: {
        code: "EPSG:28992",
        srid: 28992,
        coordinates: {
            numDigits: 0
        }
    },
    VERSION: "1.0",
    RELEASEDATE: "11-12-2014",
    APPLICATION: "DBK component",
    REMARKS: "",
    INFO: "",
    zoom: 13
};
