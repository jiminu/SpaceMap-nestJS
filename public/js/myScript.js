
function wowCallback() {

}



//동영상 리사이즈
function resizeVideo() {
	$("iframe").each(function(){
		if( /^https?:\/\/www.youtube.com\/embed\//g.test($(this).attr("src")) ) {
			$(this).css("width","100%");
			$(this).css("height",Math.ceil( parseInt($(this).css("width")) * 480 / 850 ) + "px");
		}
		if( /^https?:\/\/player.vimeo.com\/video\//g.test($(this).attr("src")) ) {
			$(this).css("width","100%");
			$(this).css("height",Math.ceil( parseInt($(this).css("width")) * 450 / 800 ) + "px");
		}
	});	
}



$(document).ready(function() {
	
	$("#header .openner").click(function() {
		var navContainer = $('#hd-nav-container');
		$('#hd-nav-container').animate({"top": "0"}, 400, 'easeInOutExpo').addClass('open');
		$('html').addClass('scrollDisable');
	});
	$("#hd-nav-container .closer").click(function() {
		$('#hd-nav-container').animate({"top": "-100%"}, 400, 'easeInOutExpo').removeClass('open');
		$('html').removeClass('scrollDisable');
	});

	$(".btn-member .opener").click(function() {
		$(this).parent().toggleClass('open');
	});
	
	
	$(".cesium-search .toggle-btn, .cesium-search .subject").click(function() {
		$('.cesium-search .toggle-container').slideToggle(300, 'easeInOutExpo');
		$('.cesium-search .inner').toggleClass('open');
	});


	$(".tbl-result .output_show").click(function() {
		var checked = $(this).is(":checked"),
			tblContainer = $('.tbl-result .tblContainer');

		if(checked) {
			$(tblContainer).slideDown(700, 'easeInOutExpo');
		} else {
			$(tblContainer).slideUp(700, 'easeInOutExpo');
		}
	});

	$(".ani-opacity").animate({"opacity": "1"}, 300);
	

	/*$("#page-wrapper:not(.mobileDevice) .toggleContainer .tabs li").click(function() {
		var other_target = $(this).parent().parent().find('.boxContainer .targetCon');
		var target = $(this).data("target");
		$(other_target).hide();
		$('#' + target).show();
	});
	$("#page-wrapper.mobileDevice .toggleContainer .tabs li").click(function() {
		var other_target = $(this).parent().parent().find('.boxContainer .targetCon');
		var target = $(this).data("target");
		$(other_target).hide();
		$('#' + target).show();
	});

	$('.toggle-list-wrap li .subject').click(function() {		
		$(this).parent().toggleClass('open');
		$(this).parent().find('.con').slideToggle(400, 'easeInOutExpo');
	});*/


	$('.popup-inline:not(.inside)').magnificPopup({
		type: 'inline',
		fixedContentPos: false,
		fixedBgPos: true,
		closeOnContentClick: false, 
        closeOnBgClick: true,
		overflowY: 'auto',
		closeBtnInside: false,
		preloader: false,
		midClick: true,
		removalDelay: 300,
		mainClass: 'my-mfp-zoom-in'
	});
	$(document).on('click', '.popClose', function (e) {
		e.preventDefault();
		$.magnificPopup.close();
	});
	$('.myClick').click();


});

