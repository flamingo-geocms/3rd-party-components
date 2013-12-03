Ext.define ("viewer.components.rotercera.RoToc",{
    extend: "Ext.util.Observable",
    legendController : null,
    window: null,
    
    constructor : function(conf){
        this.callParent(arguments);
        this.initConfig(conf);
        this.createWindow();
    },
    createWindow: function(){
        this.window = Ext.create("Ext.window.Window",{
            title: "Ro-TOC",
            height: 600,
            width: 200,
            layout: 'fit',
            closeAction: 'hide',            
            html: '<div class="legendContent" id="roLegendContainer">\n\
                <a class="refreshLink" href="javascript: void(0)" onclick="legendController.refreshMap()">Klik hier om de kaart te verversen</a> <br/>\n\
                <div id="disclaimer">De legenda toont de mogelijke bestemmingen. Deze hoeven niet voor te komen op de kaart.</div>\n\
                <div><input name="all" type="checkbox" onclick="legendController.setAllChecked(this.checked)"/>Alle Lagen</div>\n\
                <!--Enkel-->\n\
                <h1>Enkelbestemmingen</h1>\n\
                <div><input name="enkelbestemming" type="checkbox" value="agrarisch"/> Agrarisch </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="agrarisch_met_waarden"/> Agrarisch Met Waarden </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="bedrijf"/> Bedrijf </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="bedrijventerrein"/> Bedrijventerrein </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="bos"/> Bos </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="centrum"/> Centrum </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="cultuur en ontspanning"/> Cultuur En Ontspanning </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="detailhandel"/> Detailhandel </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="dienstverlening"/> Dienstverlening </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="gemengd"/> Gemengd </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="groen"/> Groen </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="horeca"/> Horeca </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="kantoor"/> Kantoor </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="maatschappelijk"/> Maatschappelijk </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="natuur"/> Natuur </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="overig"/> Overig </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="recreatie"/> Recreatie </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="sport"/> Sport </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="tuin"/> Tuin </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="verkeer"/> Verkeer </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="water"/> Water </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="wonen"/> Wonen </div>\n\
                <div><input name="enkelbestemming" type="checkbox" value="woongebied"/> Woongebied </div>\n\
                <!-- Dubbel-->\n\
                <h1>Dubbelbestemmingen</h1>\n\
                <div><input name="dubbelbestemming" type="checkbox" value="leiding"/> Leiding </div>\n\
                <div><input name="dubbelbestemming" type="checkbox" value="waarde"/> Waarde </div>\n\
                <div><input name="dubbelbestemming" type="checkbox" value="waterstaat"/> Waterstaat </div>\n\
                <!-- Gebieds Aanduidingen-->\n\
                <h1>Gebiedsaanduidingen</h1>\n\
                <div><input name="gebiedsaanduiding" type="checkbox" value="geluidzone"/> Geluidzone </div>\n\
                <div><input name="gebiedsaanduiding" type="checkbox" value="luchtvaartverkeerzone"/> Luchtvaartverkeerzone </div>\n\
                <div><input name="gebiedsaanduiding" type="checkbox" value="milieuzone"/> Milieuzone </div>\n\
                <div><input name="gebiedsaanduiding" type="checkbox" value="reconstructiewetzone"/> Reconstructiewetzone </div>\n\
                <div><input name="gebiedsaanduiding" type="checkbox" value="veiligheidszone"/> Veiligheidszone </div>\n\
                <div><input name="gebiedsaanduiding" type="checkbox" value="vrijwaringszone"/> Vrijwaringszone </div>\n\
                <div><input name="gebiedsaanduiding" type="checkbox" value="wro-zone"/> Wro-Zone </div>\n\
                <div><input name="gebiedsaanduiding" type="checkbox" value="overige"/> Overige </div>\n\
                <div><input name="gebiedsaanduiding" type="checkbox" value="wetgevingzone"/> Wetgevingzone </div>\n\
                <div><input name="gebiedsaanduiding" type="checkbox" value="overige zone"/> Overige Zone </div>\n\
                <!-- -->\n\
                <h1>Overige</h1>\n\
                <div><input name="bouwvlakken" type="checkbox" value="bouwvlak"/> Bouwvlakken </div>\n\
\n\
                <div><input name="bouwaanduiding" type="checkbox" value="bouwaanduiding"/> Bouwaanduidingen </div>\n\
                <!-- -->\n\
                <div><input name="maatvoering" type="checkbox" value="maatvoering"/> Maatvoeringen </div>\n\
                <!-- -->\n\
                <div><input name="functieaanduiding" type="checkbox" value="functieaanduiding"/> Functieaanduidingen </div>\n\
                <!-- -->\n\
                <div><input name="figuur" type="checkbox" value="figuur"/> Figuren </div>\n\
                <!-- -->\n\
                <div><input name="analogeverbeelding" type="checkbox" value="analoge verbeelding"/> Analoge Verbeelding </div>\n\
            </div>' 
        });
    },
    reset : function(conf){           
        conf.roToc=this;
        //welke layer
        if(conf.type ==='Roonline'){
            legendController = new viewer.components.rotercera.RoOnlineLegendController(conf);
        }else{
            legendController = new viewer.components.rotercera.TerceraLegendController(conf);            
        }
        legendController.reset();
    },
    show: function(){
        this.window.show();
    }
});

Ext.define ("viewer.components.rotercera.LegendController",{
    extend: "Ext.util.Observable",
    config: {       
        planId: null,
        wmsLayer: null,
        roToc:null
    },
    
    disabledLayers :null,
    layers: null,
    sldUrl: null,
    
    constructor: function(conf){
        this.callParent(arguments);
        this.initConfig(conf);
        this.disabledLayers=[];
    },
    /**
    * Returns all values of the elements with name = "name" that are checked.
    * @param name the name of the html checkboxes.
    * @return a array of values.
    */
    getValues : function (){
        var returnValue= new Object();
        returnValue["enkelbestemming"]=this.getElementValuesByName("enkelbestemming");
        returnValue["dubbelbestemming"]=this.getElementValuesByName("dubbelbestemming");
        returnValue["gebiedsaanduiding"]=this.getElementValuesByName("gebiedsaanduiding");
        returnValue["bouwvlakken"]=this.getElementValuesByName("bouwvlakken");
        returnValue["bouwaanduiding"]=this.getElementValuesByName("bouwaanduiding");
        returnValue["maatvoering"]=this.getElementValuesByName("maatvoering");
        returnValue["functieaanduiding"]=this.getElementValuesByName("functieaanduiding");
        returnValue["figuur"]=this.getElementValuesByName("figuur");
        returnValue["analogeverbeelding"]=this.getElementValuesByName("analogeverbeelding");
        return returnValue;
    },
    getElementValuesByName : function(name){
        var elements=document.getElementsByName(name);
        var values = new Array();
        for (var i=0; i < elements.length; i++){
            if (elements[i].checked){
                values.push(elements[i].value);
            }
        }
        return values;
    },
    disableLayer : function(layer){        
        var found=false;
        for (var i=0; i < this.disabledLayers.length; i++){
            if (this.disabledLayers[i]==layer){
                return;
            }
        }
        if (!found){
            this.disabledLayers.push(layer);            
        }
    },
    enableLayer : function(layer){
        var newLayersArray= new Array();
        for (var i=0; i < this.disabledLayers.length; i++){
            if (layer!=this.disabledLayers[i]){
                newLayersArray.push(this.disabledLayers[i]);
            }
        }
        this.disabledLayers=newLayersArray;
    },
    getEnabledLayers : function(){
        return this.getFilteredLayers();
    },
    getFilteredLayers : function(){
        if (this.disabledLayers.length==0){
            return this.layers;
        }
        var layersArray = this.layers;
        var returnLayers= new Array();
        for (var i=0; i < layersArray.length; i++){
            var disabled=false;
            for (var d=0; d < this.disabledLayers.length; d++){
                //check if the layer is in the enabled layers and if the layer can be "checked-off"
                if(layersArray[i]==this.disabledLayers[d]){
                    //returnLayers.push(layersArray[i])
                    disabled=true;
                    break;
                }
            }
            if (!disabled){
                returnLayers.push(layersArray[i]);
            }
        }
        
        if (returnLayers.length>0){
            return returnLayers.join(",");
        }else{
            return "";
        }
    },
    /**
     *Reset the checkboxes.
     */
    setAllChecked : function(val){
        var allElements=document.getElementsByTagName("input");
        for (var i=0; i < allElements.length; i++){
            allElements[i].checked=val;
        }
    },
    reset : function(){
        var allElements=document.getElementsByTagName("input");
        for (var i=0; i < allElements.length; i++){            
            allElements[i].disabled=false;
            allElements[i].checked=true;
            allElements[i].parentElement.style.display="block";
        }
    },
    /**
     *Reload the layer
     */
    reloadLayer : function(){
        if (this.wmsLayer){
            //function addNewFlamingoWmsLayer(name,url,layers,querylayers,visiblelayers,srs,alpha,maptips,maxMapTips,initService,identPerLayer,zoomToLayer,minscale,maxscale,sldUrl){
            //flamingoWindow.addNewFlamingoWmsLayer(fl.getId(),fl.getUrl(),fl.getLayers(),fl.getQuerylayers(),fl.getVisible_layers(),fl.getSrs(),fl.getAlpha(),new Array(),null,false,false,false,null,null,fl.getSld(),true);
            var newLayers=this.getEnabledLayers();
            this.wmsLayer.setOGCParams({
                "SLD" : this.sldUrl,
                "LAYERS" : newLayers.split(",")
            });
            
                //
            this.wmsLayer.reload();
            /*
            flamingoWindow.setSldInLayer(this.layerId,this.sldUrl); 
            flamingoWindow.setLayersInLayer(this.layerId,newLayers);
            flamingoWindow.reloadLayer(this.layerId);*/
        }
    },
    getAllCheckboxValues : function(){
        var values= new Array();
        var allElements=document.getElementsByTagName("input");
        for (var i=0; i < allElements.length; i++){
            values.push(allElements[i].value);
        }
        return values;
    }
});
    
        //end global controller
//RO online Controller
Ext.define ("viewer.components.rotercera.RoOnlineLegendController",{
    extend: "viewer.components.rotercera.LegendController",
    EB_LAYER_NAME : "BP:Enkelbestemming",
    DB_LAYER_NAME : "BP:Dubbelbestemming",
    GA_LAYER_NAME : "BP:Gebiedsaanduiding",
    F_LAYER_NAME : "BP:Figuur",
    FA_LAYER_NAME : "BP:Functieaanduiding",
    BA_LAYER_NAME : "BP:Bouwaanduiding",
    MV_LAYER_NAME : "BP:Maatvoering",
    BV_LAYER_NAME : "BP:Bouwvlak",
    PG_ATTR_NAME: "app:plangebied",
    
    constructor: function(conf){
        this.callParent(arguments);
    },
            
    reset : function(){
        this.callParent();   
        this.layers= this.wmsLayer.getLayers();
        //document.getElementById("disclaimer").style.display="inline";
    },
    /**
     *Refresh the map
     */
    refreshMap : function(){
        var sldLayers= new Array();
        var sldFilters= new Array();
        var values=this.getValues();
        //Enkelbestemming
        if (values["enkelbestemming"].length>0 && document.getElementsByName("enkelbestemming").length != values["enkelbestemming"].length){                       
            var sldFilter = this.createSLDFilter("bestemmingshoofdgroep",values["enkelbestemming"]);
            sldFilter = this.addPlanFilter(sldFilter,this.planId);
            sldLayers.push(this.EB_LAYER_NAME);
            sldFilters.push(sldFilter);
        }
        //DubbelBestemming
        if (values["dubbelbestemming"].length>0 && document.getElementsByName("dubbelbestemming").length != values["dubbelbestemming"].length){            
            var sldFilter = this.createSLDFilter("bestemmingshoofdgroep",values["dubbelbestemming"]);
            sldFilter = this.addPlanFilter(sldFilter,this.planId);
            sldLayers.push(this.DB_LAYER_NAME);
            sldFilters.push(sldFilter);
        }
        //gebiedsaanduiding
        if (values["gebiedsaanduiding"].length>0 && document.getElementsByName("gebiedsaanduiding").length != values["gebiedsaanduiding"].length){            
            var sldFilter = this.createSLDFilter("gebiedsaanduidinggroep",values["gebiedsaanduiding"]);
            sldFilter = this.addPlanFilter(sldFilter,this.planId);
            sldLayers.push(this.GA_LAYER_NAME);
            sldFilters.push(sldFilter);
        }
        if (values["enkelbestemming"].length==0){
            this.disableLayer(this.EB_LAYER_NAME);
        }else{
            this.enableLayer(this.EB_LAYER_NAME);
        }
        if (values["dubbelbestemming"].length==0){
            this.disableLayer(this.DB_LAYER_NAME);
        }else{
            this.enableLayer(this.DB_LAYER_NAME);
        }
        if (values["gebiedsaanduiding"].length==0){
            this.disableLayer(this.GA_LAYER_NAME);
        }else{
            this.enableLayer(this.GA_LAYER_NAME);
        }    
        //bouwaanduiding
        if (values["bouwvlakken"].length==0){
            this.disableLayer(this.BV_LAYER_NAME);
        }else{
            this.enableLayer(this.BV_LAYER_NAME);
        }   
        //bouwaanduiding
        if (values["bouwaanduiding"].length==0){
            this.disableLayer(this.BA_LAYER_NAME);
        }else{
            this.enableLayer(this.BA_LAYER_NAME);
        }    
        //maatvoering
        if (values["maatvoering"].length==0){
            this.disableLayer(this.MV_LAYER_NAME);
        }else{
            this.enableLayer(this.MV_LAYER_NAME);
        } 
        //functieaanduiding
        if (values["functieaanduiding"].length==0){
            this.disableLayer(this.FA_LAYER_NAME);
        }else{
            this.enableLayer(this.FA_LAYER_NAME);
        } 
        //figuren
        if (values["figuur"].length==0){
            this.disableLayer(this.F_LAYER_NAME);
        }else{
            this.enableLayer(this.F_LAYER_NAME);
        } 
        //make missing plan filters
        var layers=this.getFilteredLayers().split(",");
        for (var i =0; i < layers.length; i++){
            //if not a filter is set, add the layer with filter
            if (!Ext.Array.contains(sldLayers,layers[i])){
                sldLayers.push(layers[i]);
                sldFilters.push(this.addPlanFilter("",this.planId));
            }
        }
        
        var layerParam=null;
        var filterParam=null;
        if (sldLayers.length > 0 && sldLayers.length==sldFilters.length){            
            layerParam=sldLayers;
            filterParam=sldFilters;
        }
        
        this.sldUrl=Ext.create("viewer.SLD").createURL(layerParam,null,filterParam,null,null,this.PG_ATTR_NAME +" = '"+this.planId +"'");
        this.reloadLayer();
    },
    /**
     *Create a CQL sld filter for feature type with values
     */    
    createSLDFilter : function(attribuut,values){
        var cql="";
        if (values.length==1){
            cql+=attribuut +"='"+values[0]+"'";
        }else{
            cql+=attribuut +" in ("
            for (var i=0; i< values.length; i++){
                if (i!=0){
                    cql+=",";
                }
                cql+="'"+values[i].toLowerCase()+"'";
            }
            cql+=")";
        }
        return cql;
    },
    
    /**
     * Overwrite the getFilteredLayers and return "", no layers= param needed for new RO-online service
     */
    getEnabledLayers : function(){
        return " ";
    },
    /**
     *Adds a filter to the sld so it wil only show this sld
     */
    addPlanFilter : function(sldFilter,planId){
        /*var newSldFilter="";
        if (sldFilter!=undefined && sldFilter!=null && sldFilter.length > 0){
            newSldFilter="("+sldFilter+") AND ";
        }
        newSldFilter+=this.PG_ATTR_NAME +" = \""+planId +"\"";
        return newSldFilter;*/
        return sldFilter;
    }    
});

Ext.define ("viewer.components.rotercera.TerceraLegendController",{
    extend: "viewer.components.rotercera.LegendController",
    EB_LAYER_NAME : "enkelbestemming",
    DB_LAYER_NAME : "dubbelbestemming",
    GA_LAYER_NAME : "gebiedsaanduiding",
    F_LAYER_NAME : "figuur",
    FA_LAYER_NAME : "functieaanduiding",
    BA_LAYER_NAME : "bouwaanduiding",
    MV_LAYER_NAME : "maatvoering",
    
    constructor: function(conf){
        this.callParent(arguments);
    },
            
    /**
     *Refresh the map
     */
    refreshMap : function(){   
        this.enabledLayers=new Array();        
        //Enkelbestemming
        var inputArray=document.getElementsByTagName("input");        
        for (var i=0; i < inputArray.length; i++){
            if (inputArray[i].checked){
                this.enableLayer(inputArray[i].value);
            }else{
                this.disableLayer(inputArray[i].value);
            }
        }        
        this.disableLayer(this.EB_LAYER_NAME);
        this.disableLayer(this.DB_LAYER_NAME);
        this.disableLayer(this.GA_LAYER_NAME);                 
        
        this.reloadLayer();
    },
    /**
     *Implement Reset function
     */
    reset : function(){
        //xxx:document.getElementById("disclaimer").style.display="none";        
        var url = this.wmsLayer.getUrl();
        
        var me=this;
        this.layers= this.wmsLayer.getLayers();
        var availableLayers = this.wmsLayer.getLayers();
        
        //walk the inputs and disable/enable them
        
        //var allElements=document.getElementsByTagName("input");
        var legendContainer = document.getElementById("roLegendContainer");
        if (legendContainer==null){
            return;
        }
        var allElements = Ext.query("input", legendContainer);
        for (var i=0; i < allElements.length; i++){
            var elem=allElements[i];
            if (elem.name=="all"){
                elem.checked=true;
            }else{
                if (Ext.Array.contains(availableLayers,elem.value)){
                    elem.disabled=false;
                    elem.checked=true;
                    elem.parentElement.style.display="block";
                }else{
                    elem.disabled=true;
                    elem.checked=false;
                    elem.parentElement.style.display="none";
                }
            }
        }
    }
});