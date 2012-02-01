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

var currentWords = [];
var currentColumns = 3;
var api = new cww_api();
api.debug = false;

function setWords(words) {
	currentWords = words;
	renderWordTable();
}

function renderWordTable() {
	var html = "";
	
	if (currentWords.length > 0) {
		for(idx=0; idx<currentWords.length; idx++) {
			if (idx % currentColumns == 0) {
				html += "<tr>";
			}
			html += "<td>" + currentWords[idx] + "</td>";
			if (idx % currentColumns == currentColumns - 1) {
				html += "</tr>"
			}
		}
		if (idx % currentColumns != currentColumns - 1) {
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
				currentColumns = 4;
				break;
			case 0:
			case 180:
			default:
				currentColumns = 3;
				break;
		}
		renderWordTable();
	});
	
	// Hook up the search box
	$("#searchBtn").click(function(evt) {
		evt.preventDefault();
		var searchLetters = $("#searchLetters").val();
		localStorage.searchTerm = searchLetters;
		$("#wordTable caption").html("Words using " + searchLetters);
		api.search(searchLetters, setWords);
	});

	// Hook up our list links
	$("#2letter,#greek,#qwithoutu").click(function(evt) {
		evt.preventDefault();
		$("#wordTable caption").html(evt.target.title);
		api.list(evt.target.id, setWords);
	});
	
	if (typeof(localStorage.searchTerm) == 'string') {
		$("#searchLetters").val(localStorage.searchTerm);
		$("#searchBtn").click();
	}
});
