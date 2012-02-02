/**
 *	mobile.js
 *	by CJ Holmes
 *	Jan 2012
 *
 *	The page-specific scripts for the mobile interface to Cheat With Words.
 *
 *	requires:
 *		JQuery
 *		cww_api.js
 *
 */

var api = new cww_api();
api.debug = false;

var app = new cww_app();
app.currentColumns = 3;

cww_app.prototype.renderWordTable = function() {
	var html = "";
	
	$("#wordTable caption").html(app.getValue('resultCaption'));
	currentWords = app.getValue('searchResults');
	
	if (currentWords.length > 0) {
		for(idx=0; idx<currentWords.length; idx++) {
			if (idx % app.currentColumns == 0) {
				html += "<tr>";
			}
			html += "<td>" + currentWords[idx] + "</td>";
			if (idx % app.currentColumns == app.currentColumns - 1) {
				html += "</tr>"
			}
		}
		if (idx % app.currentColumns != app.currentColumns - 1) {
			html += "</tr>";
		}
	} else {
		html = "<tr><td>No Matching Words</td></tr>";
	}
	$("#wordTable tbody").html(html);
}

$(document).ready(function() {
	
	// Check for orientation changes.
	$("body").on("orientationchange", function() {
		switch(window.orientation) {
			case 90:
			case -90:
				app.currentColumns = 4;
				break;
			case 0:
			case 180:
			default:
				app.currentColumns = 3;
				break;
		}
		app.renderWordTable();
	});
	
	// Hook up the search box
	$("#searchBtn").click(function(evt) {
		evt.preventDefault();
		var searchLetters = $("#searchLetters").val();
		app.setValue('searchTerm', searchLetters);
		app.setValue('resultCaption', "Words using " + searchLetters);
		app.setValue('searchResults', []);
		app.renderWordTable();
		api.search(searchLetters, function(words) {
			app.setValue('searchResults', words);
			app.renderWordTable();
		});
	});

	// Hook up our list links
	$("#2letter,#greek,#qwithoutu").click(function(evt) {
		evt.preventDefault();
		app.setValue('resultCaption', evt.target.title);
		app.setValue('searchResults', []);
		app.renderWordTable();
		api.list(evt.target.id, function(words) {
			app.setValue('searchResults', words);
			app.renderWordTable();
		});
	});
	
	if (app.getValue("searchTerm") && app.getValue("searchResults")) {
		$("#searchLetters").val(app.getValue('searchTerm'));
		app.renderWordTable();
	}
});
