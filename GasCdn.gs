
     
function doGet (e) {
  
  // set up default manifest
  e = e || {parameter:{manifests:''}};
  var code = GasCdn.getManifests( (e.parameter.manifests || 'default').split(',') );
  
  // serve it up
  return ContentService
    .createTextOutput(code)
    .setMimeType(ContentService.MimeType.TEXT); 

  
}
var GasCdn = (function (gasCdn) {
  'use strict';
  
  // these control which info can be served up over web service
  // should contain lists of script file names against some manifests name
  // called with ?manifests= on the url
  gasCdn.manifests = (gasCdn.manifests || []).concat([
    { name:'all', gs:['Utils'],html:['main.js','ColorMath.js'] },
    { name:'default', gs:['Utils'],html:[] },
    { name:'color', gs:[],html:['ColorMath.js'] }
  ]);
  
  /**
   * get code for all manifests
   * @param {string[]} manifest names to get
   * @return {string{ the code
   */
   
  gasCdn.getManifests = function (manifests) {
    
    var code = '//--served up by GasCdn\n';
    
    code += manifests.map(function(d) {
      // find requested manifest
      var target = gasCdn.manifests.filter (function (m) {
        return m.name === d;
      });
      
      // can only be 1
      if(target.length !== 1) { 
        throw 'manifest not found or ambiguous ' +d;
      }
      
      // get the code
      return gasCdn.getCode (target[0]);
    
    }).join('\n');

    return code;
  }
  
  /**
   * serve up contents of manifest
   * @param {string} manifest name
   * @return {string{ the code
   */
  gasCdn.getCode = function (manifest) {
  
    var code = '//--manifest:' + manifest.name + '\n';
    
    // add any apps script code
    code += (manifest.gs || []).map ( function (d) {
      return '//--apps script:' + d + '\n' + ScriptApp.getResource(d).getDataAsString();
    }).join("\n");
    
    // and any html/js code
    code += (manifest.html || []).map ( function (d) {
      return '//--html/js:' + d + '\n' + HtmlService.createHtmlOutputFromFile(d).getContent();
    }).join("\n");
    
    return code;
  };
  
  return gasCdn;
})(GasCdn || {});


