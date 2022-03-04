
$(document).ready(function() {
	
	$('.height-auto').each(function() {
		$(this).css({'min-height':$(window).height()});
	});
	setInterval(function() {
		$('.height-auto').each(function() {
			if($(this).height() < $(window).height()) {
				$(this).css({'min-height':$(window).height()});
			}
		});
	}, 100);
	
	$(window).scroll(function() {			
		if( $(this).scrollTop() > 80 ) {
			$('#header').addClass('scroll-fixed');
			$('#header').animate({"top": 0}, 700, 'easeInOutExpo');
		}
		if( $(this).scrollTop() < 20 ){
			$('#header').removeClass("scroll-fixed");
			$('#header').removeAttr("style");
			$('#header').clearQueue();
		}			
	});

});