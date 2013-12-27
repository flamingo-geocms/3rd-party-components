Ext.define("viewer.components.rotercera.IdentifyParser",{
    //statics
    BESLUITGEBIED_X : 6,
    COMMENTAARLAYOUT:5,
    STRUCTUURVISIELAYOUT:2,
    BESTEMMINGSPLANLAYOUT:1,
    UNKNOWNLAYOUT:0,

    TERCERALAYERID:"Tercera",

    checkForIdentification: [],
    
    wfsToWmsLayer: {},
    
    terceraMapping: null,
    
    //info placeholders
    info: "",
    commentaarInfo: "",
    
    highlightImage: null,
    highlightedImage: null,
    
    component: null,
    config: {
        domElement: null
    },
    constructor: function (conf,component){
        this.component = component;
        this.initConfig(conf);
        
        this.checkForIdentification.push("identificatie");
        this.checkForIdentification.push("plangebied");
        this.checkForIdentification.push("bestemmingsplangebiedid");
        
        this.wfsToWmsLayer['Besluitvlak_P'] = "PV:Besluitvlak";
        this.wfsToWmsLayer['Besluitgebied_P'] = "PV:Besluitgebied";
        this.wfsToWmsLayer['Besluitvlak_X'] = "XGB:Besluitvlak";
        this.wfsToWmsLayer['Besluitgebied_X'] = "XGB:Besluitgebied";
        this.wfsToWmsLayer['Besluitvlak_A'] = "AMB:Besluitgebied";      
        this.wfsToWmsLayer['Besluitgebied_A'] = "AMB:Besluitgebied";
        this.wfsToWmsLayer["Bestemmingsplangebied"] = "BP:Bestemmingsplangebied"; 
        this.wfsToWmsLayer["Wijzigingsplangebied"] = "BP:Wijzigingsplangebied"; 
        this.wfsToWmsLayer["Enkelbestemming"] = "BP:Enkelbestemming"; 
        this.wfsToWmsLayer["Figuur"] = "BP:Figuur"; 
        this.wfsToWmsLayer["Lettertekenaanduiding"] = "BP:Lettertekenaanduiding"; 
        this.wfsToWmsLayer["Maatvoering"] = "BP:Maatvoering"; 
        this.wfsToWmsLayer["Dubbelbestemming"] = "BP:Dubbelbestemming"; 
        this.wfsToWmsLayer["Bouwvlak"] = "BP:Bouwvlak"; 
        this.wfsToWmsLayer["Gebiedsaanduiding"] = "BP:Gebiedsaanduiding"; 
        this.wfsToWmsLayer["Inpassingsplangebied"] = "BP:Inpassingsplangebied";
        this.wfsToWmsLayer["Bouwaanduiding"] = "BP:Bouwaanduiding";
        this.wfsToWmsLayer["Functieaanduiding"] = "BP:Functieaanduiding";
        this.wfsToWmsLayer["ProvinciaalPlangebied"] = "PP:ProvinciaalPlangebied";
        this.wfsToWmsLayer["ProvinciaalGebied"] = "PP:ProvinciaalGebied";
        this.wfsToWmsLayer["ProvinciaalComplex"] = "PP:ProvinciaalComplex";
        this.wfsToWmsLayer["ProvinciaalVerbinding"] = "PP:ProvinciaalVerbinding";
        this.wfsToWmsLayer["NationaalPlangebied"] = "NP:NationaalPlangebied";
        this.wfsToWmsLayer["Besluitvlak"] = "XGB:Besluitvlak";
        this.wfsToWmsLayer["Besluitsubvlak"] = "XGB:Besluitsubvlak";
        this.wfsToWmsLayer["Exploitatieplangebied"] = "XGB:Exploitatieplangebied";
        this.wfsToWmsLayer["Gerechtelijkeuitspraakgebied"] = "XGB:Gerechtelijkeuitspraakgebied";
        this.wfsToWmsLayer["Projectbesluitgebied"] = "XGB:Projectbesluitgebied";
        this.wfsToWmsLayer["Tijdelijkeontheffingbuitenplansgebied"] = "XGB:Tijdelijkeontheffingbuitenplansgebied";
        this.wfsToWmsLayer["Voorbereidingsbesluitgebied"] = "XGB:Voorbereidingsbesluitgebied";
        this.wfsToWmsLayer["Plangebied"] = "PCP:Plangebied";

        this.highlightImage = Ext.String.urlAppend(this.component.resourceUrl,"resource=resources/images/map.png");
        this.highlightedImage = Ext.String.urlAppend(this.component.resourceUrl,"resource=resources/images/map_go.png");
        
        this.terceraMapping={
            enkelbestemming: [
                {key: "agrarisch", title: "Agrarisch"},
                {key: "agrarisch_met_waarden", title: "Agrarisch met waarden"},
                {key: "bedrijf", title: "Bedrijf"},
                {key: "bedrijventerrein", title: "Bedrijventerrein"},
                {key: "bos", title: "Bos"},
                {key: "centrum", title: "Centrum"},
                {key: "cultuur_en_ontspanning", title: "Cultuur en ontspanning"},
                {key: "detailhandel", title: "Detailhandel"},
                {key: "dienstverlening", title: "Dienstverlening"},
                {key: "gemengd", title: "Gemengd"},
                {key: "groen", title: "Groen"},
                {key: "horeca", title: "Horeca"},
                {key: "kantoor", title: "Kantoor"},
                {key: "maatschappelijk", title: "Maatschappelijk"},
                {key: "natuur", title: "Natuur"},
                {key: "overig", title: "Overig"},
                {key: "recreatie", title: "Recreatie"},
                {key: "sport", title: "Sport"},
                {key: "tuin", title: "Tuin"},
                {key: "verkeer", title: "Verkeer"},
                {key: "water", title: "Water"},
                {key: "wonen", title: "Wonen"},
                {key: "woongebied", title: "Woongebied"}
            ],
            dubbelbestemming: [
                {key: "leiding", title: "Leiding"},
                {key: "waarde", title: "Waarde"},
                {key: "waterstaat", title: "Waterstaat"}
            ],
            gebiedsaanduiding: [
                {key: "geluidzone", title: "Geluidzone"},
                {key: "luchtvaartverkeerzone", title: "Luchtvaartverkeerzone"},
                {key: "milieuzone", title: "Milieuzone"},
                {key: "reconstructiewetzone", title: "Reconstructiewetzone"},
                {key: "veiligheidszone", title: "Veiligheidszone"},
                {key: "vrijwaringszone", title: "Vrijwaringszone"},
                {key: "wro-zone", title: "Wro-zone"},
                {key: "overig", title: "Overig"},
                {key: "wetgevingzone  ", title: "Wetgevingzone  "},
                {key: "overige_zone", title: "Overige zone"}
            ]
        };     
    },
    resetData : function(){
        this.info="";
        this.commentaarInfo="";
    },
    /**
    *Is this feature part of the plan
    */
    isPartOfPlan : function(feature,plangebiedId){
        for (var i=0; i < this.checkForIdentification.length; i++){
            if (feature[this.checkForIdentification[i]]!=undefined){
                if (feature[this.checkForIdentification[i]].toLowerCase()==plangebiedId.toLowerCase()){
                    return true;
                }
            }
        }
        return false;
    },
            
    /**
     *Returns 1 if bestemmingsplan layout.
     */
    hasInfoWithLayout :function (obj,hetPlanObject,layoutType){
        if (hetPlanObject!=null){
            var typePlan=hetPlanObject["typeplan"];
            if (typePlan==undefined){
                typePlan="bestemmingsplan";
            }
            if (layoutType==this.BESTEMMINGSPLANLAYOUT){
                if(typePlan.indexOf("bestemmingsplan")>=0 ||
                    typePlan.indexOf("inpassingsplan")>=0 ||
                    typePlan.indexOf("wijzigingsplan")>=0 ||
                    typePlan.indexOf("uitwerkingsplan")>=0)
                    return true;                     
            }else if (layoutType==this.STRUCTUURVISIELAYOUT){
                if(typePlan.indexOf("structuurvisie")>=0)
                    return true;

            }else if (layoutType==this.BESLUITGEBIED_X){
                if (obj["besluitgebied_x"] || obj["besluitvlak_x"]){ 
                    return true;
                }
            }
        }else if (layoutType==this.COMMENTAARLAYOUT){
            if (obj["plannenbank_commentaar"])
                return true;
        }
        return false;
    },
            
    /**
    *Make the layer head.
    */
    makeLayerHead : function (obj){
        var head="<h1>";
        head+=obj["naam"];
        head+="(";
        head+=obj["planstatus"];
        head+=", ";
        head+=obj["typeplan"];
        head+=")";
        head+="</h1>"
        return head;
    },
            
    /**
    *Create the a table row with 3 columns
    */
    createRow : function(field1,field2,field3,field4){
       var array= new Array();
       if (field1)
           array.push(field1);
       else
           array.push("");
       if (field2)
           array.push(field2);
       else
           array.push("");
       if (field3)
           array.push(field3);
       else
           array.push("");
       if (field4)
           array.push(field4);
       else
           array.push("");

       var row="<tr>";
       for (var i=0; i < array.length; i++){
           row+="<td class=\"td"+i+"\" valign=\"top\">"+array[i]+"</td>";
       }           
       row+="</tr>";
       return row;
    },

    /**
    *Create a bestemming table row (
    */
    createBestemmingRow : function(name,bestemmingFeatures,plangebied,sldLayer,forceIsPartOfPlan){  
        if (forceIsPartOfPlan==undefined){
            forceIsPartOfPlan=false;
        }
        var infoPart="";
        for (var featureCount in bestemmingFeatures){          
            var feature=bestemmingFeatures[featureCount];
            //skip crap objects
            if (feature[null]){}
            else{
                if (forceIsPartOfPlan ||(plangebied!=undefined && this.isPartOfPlan(feature,plangebied))){   
                    var sldFilter=null;
                    if (feature["fid"] && sldLayer){
                        sldFilter=this.createSLDButton(feature["fid"],sldLayer);                        
                    }
                    infoPart+=this.createRow(name,
                        feature["naam"],
                        this.createLinks(feature["verwijzingnaartekst"]),
                        sldFilter);
                }
            }
        }
        return infoPart;
    },
            
    createSLDButton : function (id,layer){
        if (this.component.selectedPlan.origin !== "Tercera" &&
                this.wfsToWmsLayer[layer]!==undefined){
            layer= this.wfsToWmsLayer[layer];
        }
        var html="<a href='#'";
        html+=" onclick=\"viewerController.getComponentByName('"+this.component.name+"').highlight('"+id+"','"+layer+"')\">";
        html+="<img src='"+this.highlightImage+"' id=\"image_"+id+"\"/>";
        html+="</a>";
        return html;
    },
    /**
    *Create the links
    */
    createLinks : function(verwijzingNaarTekst){            
       var linkText="";
       if (verwijzingNaarTekst && verwijzingNaarTekst!="null"){
           var links=verwijzingNaarTekst.split(",");
           for (var i=0; i < links.length; i++){
               links[i]=links[i].replace(" ","");
               var theUrl=links[i];               
               var typeDoc=this.component.getDocType(links[i]);
               if (linkText.length>0){
                   linkText+="<br/>";
               }
               linkText+="<a href=\"#\" onclick=\"planDocWindow=window.open('"+theUrl+"','info',{})\">"+typeDoc+"</a><br>";
           }
       }
       return linkText;
    },
            
    /**
     *Create a plan info element
     */
    createPlanInfo : function(layerObj){
        if (layerObj){
            var infoPart="<h2>Algemene planinfo</h2>";
            infoPart+=this.createLinks(layerObj["verwijzingnaartekst"]);
            if (layerObj["verwijzingnaarvaststellingsbesluit"]){
                infoPart+=this.createLinks(layerObj["verwijzingnaarvaststellingsbesluit"]);
                infoPart+="<br/>";
            }
            infoPart+='<br/>';
            infoPart+="<table class='planinfo-table'>";
            infoPart+=this.createRow("Planstatus",layerObj["planstatus"]+" ("+layerObj["datum"]+")");
            infoPart+=this.createRow("Type plan", layerObj["typeplan"]);
            infoPart+=this.createRow("Overheid", layerObj["naamoverheid"]);
            infoPart+="</table>";
            return infoPart;
        }else{
            return "";
        }
    },
    dataToObj: function(data){
        var newObj = {};
        for (var i=0; i < data.length; i++){
            var resp = data[i];
            if (resp.features){
                newObj[resp.request.serviceLayer] = resp.features;                
            }
        }
        return newObj;
    },
    makeSimpleName : function (s){            
        var newS=s.toLowerCase();
        if (newS.indexOf(":")>=0){
            newS=newS.substring(newS.indexOf(":")+1);
        }
        return newS;
    },
    makeSimple : function (obj,layerId){
        var tercera = false;
        if (layerId==this.TERCERALAYERID){
            tercera = true;
        }
        var newObj= new Object();
        for (var featureName in obj){
            var simpleFeatureName=this.makeSimpleName(featureName);
            if (tercera){
                simpleFeatureName = obj[featureName][0].objecttype;
            }
            if (newObj[simpleFeatureName]==undefined){
                newObj[simpleFeatureName] = new Object();
            }
            for (var featureIndex in obj[featureName]){
                newObj[simpleFeatureName][featureIndex]= new Object();
                for (var attributeName in obj[featureName][featureIndex]){
                    var simpleAttributeName=this.makeSimpleName(attributeName);
                    newObj[simpleFeatureName][featureIndex][simpleAttributeName]= obj[featureName][featureIndex][attributeName];
                }
            }
        }
        return newObj;
    },
            
    /**
    *Get complex name for ROOnline layers
    */
    getComplexName : function(complexObj,simpleName){            
        for (var featureName in complexObj){
            if (featureName.toLowerCase().indexOf(simpleName)>=0){
                return featureName;
            }
            if (complexObj[featureName][0]!=undefined &&
                    complexObj[featureName][0].objecttype!=undefined &&
                    complexObj[featureName][0].objecttype === simpleName){
                return featureName;
            }
        }
        return simpleName;
    },
    /**
     *Get Complex name for Tercera layers
     */
    getComplexTerceraName : function (complexObj,simpleName){
        var simple=complexObj[simpleName];
        if (simple){                
            var fid;
            for (var i=0; i < simple.length; i++){
                fid=simple[i].fid;
                if (fid){
                    break;
                }
            }
            for (var featureName in complexObj){
                //find the complex name and return
                if (featureName!=simpleName){                        
                    var complex =complexObj[featureName];
                    //check if the complex has 1 feature with fid == fid of 1 of the simple
                    for (var i=0; i < complex.length; i++){
                        if (complex[i].fid==fid){
                            return featureName;
                        }
                    }    
                }
            }
        }
        return simpleName;
    },
            
    /*Get the correct plan that is selected*/        
    getCorrectPlan : function(planObjects,plangebied){
        for (fcount in planObjects){
            if (this.isPartOfPlan(planObjects[fcount],plangebied)){
                return planObjects[fcount];                        
            }                    
        }
    },
            
    
    /**
     *Makes the html.
     */
    parse : function (data,layerId,plangebied){  
        var objcomplex = this.dataToObj(data);
        //remove all ':' and set all names to lowercase.
        var obj = this.makeSimple(objcomplex,layerId);
        //Zoek het juiste bestemmingsplan object
        var hetPlanObject=null;
        //if tercera layer then the info is always of the loaded plan
        var forcePartOfPlan=false;            
        if (layerId==this.TERCERALAYERID){
            forcePartOfPlan=true;
        }
        if(obj["bestemmingsplangebied"])
            hetPlanObject=this.getCorrectPlan(obj["bestemmingsplangebied"],plangebied);            
        //if still null then it's not given as a bestemmingsplangebied'
        if (hetPlanObject == null && obj["plangebied"]){
            hetPlanObject=this.getCorrectPlan(obj["plangebied"],plangebied);
        }
        if (hetPlanObject == null && obj["plangebied_pcp"]){
            hetPlanObject=this.getCorrectPlan(obj["plangebied_pcp"],plangebied);
        }
        if (hetPlanObject == null && obj["besluitgebied_x"]){
            hetPlanObject = this.getCorrectPlan(obj["besluitgebied_x"],plangebied);
        }
        if (hetPlanObject == null && obj["besluitvlak_x"]){
            hetPlanObject = this.getCorrectPlan(obj["besluitvlak_x"],plangebied);                
        }
        if (hetPlanObject!=null && this.hasInfoWithLayout(obj,hetPlanObject,this.BESTEMMINGSPLANLAYOUT)){
            var infoPart="";
            if (hetPlanObject)
                infoPart+=this.makeLayerHead(hetPlanObject);
            infoPart+="<table class='featureinfo-table'>";
            //enkel
            if (obj["enkelbestemming"]){
                infoPart+=this.createBestemmingRow("Enkelbestemming",obj["enkelbestemming"],plangebied,this.getComplexName(objcomplex,"enkelbestemming"),forcePartOfPlan);
            }else if (layerId==this.TERCERALAYERID){
                //maybe it's a tercera feature?
                for (var i=0; i < this.terceraMapping.enkelbestemming.length; i++){
                    var mapping = this.terceraMapping.enkelbestemming[i];
                    if (obj[mapping.key]){                            
                        infoPart+=this.createBestemmingRow("Enkelbestemming",obj[mapping.key],plangebied,this.getComplexTerceraName(objcomplex,mapping.key),forcePartOfPlan);
                    }
                }
            }
            if (obj["dubbelbestemming"]){
                infoPart+=this.createBestemmingRow("Dubbelbestemming",obj["dubbelbestemming"],plangebied,this.getComplexName(objcomplex,"dubbelbestemming"),forcePartOfPlan);
            }else if (layerId==this.TERCERALAYERID){
                for (var i=0; i < this.terceraMapping.dubbelbestemming.length; i++){
                    var mapping = this.terceraMapping.dubbelbestemming[i];
                    if (obj[mapping.key]){
                        infoPart+=this.createBestemmingRow("Dubbelbestemming",obj[mapping.key],plangebied,this.getComplexTerceraName(objcomplex,mapping.key),forcePartOfPlan);
                    }
                }
            }
            if (obj["gebiedsaanduiding"]){ 
                infoPart+=this.createBestemmingRow("Gebiedsaanduiding",obj["gebiedsaanduiding"],plangebied,this.getComplexName(objcomplex,"gebiedsaanduiding"),forcePartOfPlan);
            }else if (layerId==this.TERCERALAYERID){
                for (var i=0; i < this.terceraMapping.gebiedsaanduiding.length; i++){
                    var mapping = this.terceraMapping.gebiedsaanduiding[i];
                    if (obj[mapping.key]){
                        infoPart+=this.createBestemmingRow(mapping.title,obj[mapping.key],plangebied,this.getComplexTerceraName(objcomplex,mapping.key),forcePartOfPlan);
                    }
                }
            }
            if (obj["bouwvlak"]){  
                for (var featureCount in obj["bouwvlak"]){
                    var feature=obj["bouwvlak"][featureCount];
                    if (forcePartOfPlan || this.isPartOfPlan(feature,plangebied))
                        if (feature["fid"]){
                            infoPart+=this.createRow("Bouwvlak","","",this.createSLDButton(feature["fid"],this.getComplexName(objcomplex,"bouwvlak")),forcePartOfPlan);
                        }
                }
            }
            if (obj["bouwaanduiding"]){          
                infoPart+=this.createBestemmingRow("Bouwaanduiding",obj["bouwaanduiding"],plangebied,null,forcePartOfPlan);

            }
            if (obj["maatvoering"]){
                for (var featureCount in obj["maatvoering"]){    
                    var feature=obj["maatvoering"][featureCount];
                    if (forcePartOfPlan || this.isPartOfPlan(feature,plangebied)){
                        var newValue="";
                        var maatVoeringen=[];
                        //roonline
                        if (feature["maatvoering"]){
                            maatVoeringen=feature["maatvoering"].split(", ");
                        //tercera
                        }else if (feature["waarde"]){
                            maatVoeringen = feature["waarde"].split(", ");
                        }
                        for (var m =0; m < maatVoeringen.length; m++){
                            if (newValue.length!=0){
                                newValue+="<br/>";
                            }
                            newValue+=maatVoeringen[m].replace(/\"/g,"");
                        }
                        infoPart+=this.createRow("Maatvoering",
                            /*feature["naam"]+*/newValue);
                    }

                }                    
            }
            if (obj["functieaanduiding"]){
                infoPart+=this.createBestemmingRow("Functieaanduiding",obj["functieaanduiding"],plangebied,this.getComplexName(objcomplex,"functieaanduiding"),forcePartOfPlan);
            }
            if (obj["figuur"]){
                for (var featureCount in obj["figuur"]){    
                    var feature=obj["figuur"][featureCount];
                    if (forcePartOfPlan || this.isPartOfPlan(feature,plangebied)){
                        infoPart+=this.createRow("figuur",
                            feature["naam"],
                            this.createLinks(feature["verwijzingnaarillustratie"]));
                    }
                }
            }
            infoPart+="</table>";

            infoPart+=this.createPlanInfo(hetPlanObject);

            this.info+=infoPart;
        }else if(hetPlanObject!=null && this.hasInfoWithLayout(obj,hetPlanObject,this.STRUCTUURVISIELAYOUT)){//hetPlanObject["typeplan"].indexOf("structuurvisie")>=0){
            var infoPart="";
            /*var layerObject=null;
            if (obj["structuurvisiegebied"])
                layerObject=obj["structuurvisiegebied"];                                    
            if (obj["structuurvisiecomplex"])
                layerObject=obj["structuurvisiecomplex"];  */

            infoPart+=this.makeLayerHead(hetPlanObject);
            infoPart+="<table class='featureinfo-table'>"; 
            infoPart+=this.createBestemmingRow("Structuurvisie",obj["functieaanduiding"],plangebied);
            infoPart+="</table>";                

            infoPart+=this.createPlanInfo(hetPlanObject);

            this.info=infoPart;                
        }else if(hetPlanObject!=null && this.hasInfoWithLayout(obj,hetPlanObject,this.BESLUITGEBIED_X)){
            var infoPart="";
            infoPart+=this.makeLayerHead(hetPlanObject);                
            infoPart+="<table class='featureinfo-table'>";                
            if (obj["besluitvlak_x"]){
                infoPart+=this.createBestemmingRow("Besluitvlak",obj["besluitvlak_x"],plangebied,this.getComplexName(objcomplex,"besluitvlak_x"),forcePartOfPlan);
            }
            infoPart+="</table>";
            infoPart+=this.createPlanInfo(hetPlanObject);

            this.info=infoPart;
        }else if(this.hasInfoWithLayout(obj,hetPlanObject,this.COMMENTAARLAYOUT)){
            //commentaar opmaak.
            var commentaarInfoPart="";
            commentaarInfoPart+="<h2>Commentaar</h2>";
            commentaarInfoPart+="<table class='featureinfo-table'>"
            var count=0;
            for (fcount in obj["plannenbank_commentaar"]){
                var feature=obj["plannenbank_commentaar"][fcount];
                if (this.isPartOfPlan(feature,plangebied)){
                    var openbaar=false;
                    if(feature["openbaar"]=="true"){
                        openbaar=true;
                    }
                    var eigenaar=feature["eigenaar"];                    
                    if(openbaar || username == eigenaar || (isUtrechtOrg(username) && isUtrechtOrg(eigenaar))){
                        commentaarInfoPart+=this.createRow(eigenaar,feature["thema"],feature["tekst"]);
                        var owner=feature["eigenaar"];
                        if (username == owner /*|| (isUtrechtOrg(username) && isUtrechtOrg(owner))*/){
                            var wijzigUrl=commentaarUrl+"?id="+feature["id"];
                            commentaarInfoPart+=this.createRow("<a href=\"javascript: var d=flamingoWindow.openPlanCommentaar('"+wijzigUrl+"');\">Wijzig</a>" );                        
                        }
                        count++;
                    }
                }
            }     
            commentaarInfoPart+="</table>"
            if (count>0){
                this.commentaarInfo+=commentaarInfoPart;
            }
        }else{
            var infoPart="";
            if (hetPlanObject){
                try{
                    var head=this.makeLayerHead(hetPlanObject);
                    if (head)
                        infoPart+=head;
                }catch(err){                        
                }                    
            }
            infoPart+=this.createPlanInfo(hetPlanObject);
            this.info+=infoPart;
        }
        return this.info;

    },   
    getInfo : function(){
        return this.info+this.commentaarInfo;
    }      
});