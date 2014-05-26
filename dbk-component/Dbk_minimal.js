
Ext.define ("viewer.components.Dbk",{
    extend: "viewer.components.Component",    
    constructor: function (conf){
        
        console.log("viewer.components.Dbk.constructor 3rd-party");
        alert("viewer.components.Dbk.constructor 3rd-party");

        viewer.components.Dbk.superclass.constructor.call(this,conf);
    },
    getExtComponents: function() {
        return [];
    }
});
