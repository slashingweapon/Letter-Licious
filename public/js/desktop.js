/**
 *	desktop.js
 *	by CJ Holmes
 *	Jan 2012
 *
 *	The page-specific scripts for the desktop interface to Cheat With Words.
 *
 *	requires:
 *		JQuery
 *		cwwApp.js
 *
 */
function desktopDelegate() {
	this.currentColumns = 5;
	this.application = null;
}

desktopDelegate.prototype.handleSearchStart = function(app) {
	$(".resultArea").hide();
	$(".resultArea.searching").show();
}

desktopDelegate.prototype.handleSearchError = function(app, message) {

}

desktopDelegate.prototype.handleSearchEnd = function(app) {
	this.renderWordTable();
}

desktopDelegate.prototype.renderWordTable = function() {
	var html = "";
	
	$(".resultArea").hide();
	
	$("#wordTable caption").html(this.application.getLocalValue('resultCaption'));
	currentWords = this.application.getSearchResults();
	
	if (currentWords.length > 0) {
		for(idx=0; idx<currentWords.length; idx++) {
			if (idx % this.currentColumns == 0) {
				html += "<tr>";
			}
			html += "<td>" + currentWords[idx] + "</td>";
			if (idx % this.currentColumns == this.currentColumns - 1) {
				html += "</tr>"
			}
		}
		if (idx % this.currentColumns != this.currentColumns - 1) {
			html += "</tr>";
		}
		$(".resultArea.results").show();
	} else {
		$(".resultArea.noResults").show();
	}
	$("#wordTable tbody").html(html);
}

var deskManager = new desktopDelegate();
var app = new cwwApp(deskManager);
deskManager.application = app;

$(document).ready(function() {
	
	// Hook up the search box
	$("#searchBtn").click(function(evt) {
		evt.preventDefault();
		var searchParams = {
			letters:	$("#searchLetters").val(),
			prefix:		$("#prefixLetters").val(),
			suffix:		$("#suffixLetters").val(),
			onBoard:	($("#onBoard:checked").length > 0) ? true : false
		};
		
		app.setLocalValue('searchTerm', searchParams);
		app.setLocalValue('resultCaption', "Words using " + searchParams.letters);
		app.search(searchParams);
	});

	// Hook up our list links to fire off
	$(".listNav button").click(function(evt) {
		evt.preventDefault();
		app.setLocalValue('resultCaption', evt.target.title);
		app.list(evt.target.id);
	});
	
	// The Miscellaneous buttons simply display some alternate hidden div
	$(".etcNav button").click(function(evt) {
		evt.preventDefault();
		$(".resultArea").hide();
		$(".resultArea."+evt.target.id).show();
	});
	
	// During startup we want to restore the last search state
	oldTerms = app.getLocalValue("searchTerm");
	oldResults = app.getSearchResults();
	if (typeof(oldTerms) == 'object' && typeof(oldResults)=='object') {
		$("#searchLetters").val(oldTerms.letters);
		$("#prefixLetters").val(oldTerms.prefix);
		$("#suffixLetters").val(oldTerms.suffix);
		$("#onBoard").prop('checked', oldTerms.onBoard);
		deskManager.renderWordTable();
	}
	
	<!-- Google +1 button-->
	var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
	po.src = 'https://apis.google.com/js/plusone.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);

});

// Facebook API
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

!function(d,s,id) {
	var js,fjs=d.getElementsByTagName(s)[0];
	if(!d.getElementById(id)) {
		js=d.createElement(s);
		js.id=id;
		js.src="//platform.twitter.com/widgets.js";
		fjs.parentNode.insertBefore(js,fjs);
	}
}(document,"script","twitter-wjs");
