// JavaScript Document
$(document).ready(function(){ 

	$(".ui-btn").on('click',function(){
	    $(this).removeClass("ui-btn-active");
	    var inputType = $(this).prev().attr('type');
		var selectBox = $(this).find("select");
		if(inputType!="checkbox" && inputType!="radio" && (!selectBox))
			$(this).addClass("ui-btn-active"); 	
		
		//$(".ui-btn.ui-shadow.ui-btn-corner-all.ui-fullsize.ui-btn-block.ui-submit.ui-btn-up-d.ui-focus").addClass("ui-btn-active");
    });
});