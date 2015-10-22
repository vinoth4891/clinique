// JavaScript Document
$(document).ready(function(){
var vregion = $("#id_region").val();
var url = $("#url").val();
     var url = url +"/my/ajax_region.php";
	  $.ajax({
        type: "POST",
        url: url,
        data:"region="+vregion,
        success: function(html){    //alert(html);
		  var return_value = html;
          $("#id_regionkey").val(return_value);
        }
       });

$("#id_region").change( function () { 
	 var rand=Math.random()*500;
	 var region = $(this).val();
	 var url = $("#url").val();
     var url = url +"/my/ajax_region.php";
	
	  $.ajax({
        type: "POST",
        url: url,
        data:"region="+region,
        success: function(html){    //alert(html);
		  var return_value = html;
          $("#id_regionkey").val(return_value);
        }
       });															   
  });

});