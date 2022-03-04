

$(document).ready(function() {
	
	$('.height-auto').each(function() {
		$(this).css({'height':$(window).height()});
	});

	$(window).scroll(function() {			
		if( $(this).scrollTop() > 120 ) {
			$('#header').addClass('scroll-fixed');
			$('#header').animate({"top": 0}, 700, 'easeInOutExpo');
		}
		if( $(this).scrollTop() < 20 ){
			$('#header').removeClass("scroll-fixed");
			$('#header').removeAttr("style");
			$('#header').clearQueue();
		}			
	});
	

	$('.subnav_ul li.active').each(function() {
		$(this).parent().addClass('open');
		$(this).parent().parent().addClass('active');
	});

	$('#nav > li').hover(function() {
		var el = $(this).find('.subnav_ul');
		if(el.length != 0) {
			$('.subnav_bg').addClass('open');
		}
	},function(){
		$('.subnav_bg').removeClass('open');
	});

});
