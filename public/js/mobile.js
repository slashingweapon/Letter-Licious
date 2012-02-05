/**
 *	mobile.js
 *	by CJ Holmes
 *	Jan 2012
 *
 *	The page-specific scripts for the mobile interface to Cheat With Words.
 *
 *	requires:
 *		JQuery
 *		cssApp.js
 *
 */
function mobileDelegate() {
	this.currentColumns = 3;
	this.application = null;
}

mobileDelegate.prototype.handleSearchStart = function(app) {
	$(".resultArea").hide();
	$(".resultArea.searching").show();
}

mobileDelegate.prototype.handleSearchError = function(app, message) {

}

mobileDelegate.prototype.handleSearchEnd = function(app) {
	this.renderWordTable();
}

mobileDelegate.prototype.renderWordTable = function() {
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

var mobileManager = new mobileDelegate();
var app = new cwwApp(mobileManager);
mobileManager.application = app;

$(document).ready(function() {
	
	// Check for orientation changes.
	$("body").on("orientationchange", function() {
		switch(window.orientation) {
			case 90:
			case -90:
				mobileManager.currentColumns = 4;
				break;
			case 0:
			case 180:
			default:
				mobileManager.currentColumns = 3;
				break;
		}
		mobileManager.renderWordTable();
	});
	
	// Hook up the search box
	$("#searchBtn").click(function(evt) {
		evt.preventDefault();
		var searchLetters = $("#searchLetters").val();
		app.setLocalValue('searchTerm', searchLetters);
		app.setLocalValue('resultCaption', "Words using " + searchLetters);
		app.search(searchLetters);
	});

	// Hook up our list links to fire off the appropriate requests to the server
	$(".listNav button").click(function(evt) {
		evt.preventDefault();
		app.setLocalValue('resultCaption', evt.target.title);
		app.list(evt.target.id);
	});
	
	// The miscellaney buttons reveal hidden sections of HTML.
	$(".etcNav button").click(function(evt) {
		evt.preventDefault();
		$(".resultArea").hide();
		$(".resultArea."+evt.target.id).show();
	});
	
	if (app.getLocalValue("searchTerm") && app.getSearchResults()) {
		$("#searchLetters").val(app.getLocalValue('searchTerm'));
		mobileManager.renderWordTable();
	}
	
});
