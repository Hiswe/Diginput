$(function(){
	$.ui.diginput.format(1000);
//    alert($.datepicker.iso8601Week( new Date(2007, 1 - 1, 26)));
	$('#change').hide();
	$('input.notionnel').diginput().bind('change', function(){
		$('#change').show().fadeOut('fast');
	});
	/* Buttons */
	$('#submit').click(function(event){
		$('#display span')
		.hide()
		.text($('#notionnel').val())
		.fadeIn(1000)
		.delay(1500)
		.fadeOut(500);
	});
	$('#disable').bind('click.action', function(){
		$(this).fadeTo('normal', 0.5);
		$('input.notionnel').diginput('disable');
	});	
	$('#enable').bind('click.action', function(){
		$(this).fadeTo('normal', 0.5);											   
		$('input.notionnel').diginput('enable');
	});
	$('#destroy').bind('click.action', function(){
		$(this).fadeTo('normal', 0.5);												
		$('input.notionnel').diginput('destroy');
	});
	$('#make').bind('click.action', function(){
		$(this).fadeTo('normal', 0.5);											 
		$('input.notionnel').diginput();
	});	
	$('#setValue').bind('click.action', function(){
		$(this).fadeTo('normal', 0.5);												 
		$('input.notionnel').diginput('option' ,'val', 123456789);
	});
});