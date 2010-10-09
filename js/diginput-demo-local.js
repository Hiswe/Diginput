$(function(){
//	$.ui.diginput.format(1000);
    var $input = $('input.notionnel');
	$('#change').hide();
	$input.diginput();
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
		$input.diginput("disable");
	});
	$('#enable').bind('click.action', function(){
		$(this).fadeTo('normal', 0.5);
        $input.diginput('enable');
	});
	$('#destroy').bind('click.action', function(){
		$(this).fadeTo('normal', 0.5);
		$input.diginput('destroy');
	});
	$('#make').bind('click.action', function(){
		$(this).fadeTo('normal', 0.5);
		$input.diginput();
	});
	$('#setValue').bind('click.action', function(){
		$(this).fadeTo('normal', 0.5);
		$input.diginput('value', 123456789);
	});
});
