/*

    Adobe PDF Reader detector v0.3.1
    By Eric Gerds   http://www.pinlady.net/PluginDetect/

 Note:
  1) In your web page, load the PluginDetect script BEFORE you load this script.
  2) In your web page, have the output <div> BEFORE this script. The <div> looks like this:
       <div id="detectAdobeRdr_output"></div>
  3) Feel free to modify this script as you wish.


*/


(function(){

 // Object that holds all data on the plugin
 var P = {name:"AdobeReader", status:-1, version:null, minVersion:"11,0,0,0"},
      $ = PluginDetect;

 var out = document.getElementById("detectAdobeRdr_output");  // node for output text


 // $.onBeforeInstantiate(P.name, function($){$.message.write("[ $.onBeforeInstantiate(...) ]");})


 // Return text message based on plugin detection result
 var getStatusMsg = function(obj)
 {
   var Msg1 = " [PDF documents may be displayed using your browser with the Adobe plugin ";
   var Msg2 = "(but <object>/<embed> tags cannot be used) ";
   var Msg3 = "and/or using the Adobe Reader standalone application.]";

   if (obj.status==1) return "installed & enabled, version is >= " +
          obj.minVersion + Msg1 + Msg3;
   if (obj.status==0) return "installed & enabled, version is unknown" + Msg1 + Msg3;
   if (obj.status==-0.1) return "installed & enabled, version is < " +
          obj.minVersion + Msg1 + Msg3;
   if (obj.status==-0.15) return "installed but not enabled for <object>/<embed> tags. " +
      "This result occurs for Internet Explorer when the Adobe Reader ActiveX " +
      "control is disabled in the add-ons menu." + Msg1 + Msg2 + Msg3;
   if (obj.status==-1) return "not installed or not enabled " +
      "[The browser plugin is not installed/not enabled. However, it is still possible " +
      "that the Adobe Reader standalone application may be on your computer and can " +
      "display PDF documents. Note: PluginDetect can only detect browser plugins, " +
      "not standalone applications.]";
   if (obj.status==-1.5) return "unknown " +
      "[Unable to determine if the Adobe Reader plugin is installed and able " +
      "to display PDF documents in your browser. " +
      "This result occurs for Internet Explorer when ActiveX is disabled and/or " +
      "ActiveX Filtering is enabled. " +
      "Note: the Adobe Reader plugin can display a PDF document with or without " +
      "ActiveX in Internet Explorer. Without ActiveX, however, we cannot detect " + 
      "the presence of the plugin and we cannot use <object>/<embed> tags to display a PDF.]";

   if (obj.status==-3) return "error...bad input argument to PluginDetect method";
   return "unknown";

 };   // end of getStatusMsg()


 // Add text to output node
 var docWrite = function(text)
 {
     if (out){
        if (text){
          text = text.replace(/&nbsp;/g,"\u00a0");
          out.appendChild(document.createTextNode(text));
        };
        out.appendChild(document.createElement("br"));
     };
 };



   if ($.getVersion)
   {
      // Detect Plugin Version
      P.version = $.getVersion(P.name);
      docWrite("Adobe plugin version: " + P.version);
      docWrite("");
   };


   if ($.isMinVersion)
   {
      // Detect Plugin Status
      P.status = $.isMinVersion(P.name, P.minVersion);
      docWrite("Adobe plugin status: " + getStatusMsg(P));
      docWrite("");
   };



   if ($.browser.isIE)
   {
      docWrite("ActiveX enabled / ActiveX scripting enabled: " +
        ($.browser.ActiveXEnabled ? "true" : "false [this prevents detection of the plugin in Internet Explorer]")
      );
      docWrite("ActiveX Filtering enabled: " +
        ($.browser.ActiveXFilteringEnabled ? "true [this prevents detection of the plugin in Internet Explorer]" : "false")
      );
   };



})();    // end of function


