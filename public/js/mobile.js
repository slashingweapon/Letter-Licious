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
api.debug = true;

function fillWordTable(words) {
	var html = "";
	var columns = 3;
	
	if (words.length > 0) {
		for(idx=0; idx<words.length; idx++) {
			if (idx % columns == 0) {
				html += "<tr>";
			}
			html += "<td>" + words[idx] + "</td>";
			if (idx % columns == columns - 1) {
				html += "</tr>"
			}
		}
		if (idx % columns != columns - 1) {
			html += "</tr>";
		}
	} else {
		html = "<tr><td>No Matching Words</td></tr>";
	}
	console.log(html);
	$("#wordTable tbody").html(html);
}

$(document).ready(function() {
	$("#searchBtn").click(function(evt) {
		evt.preventDefault();
		var searchLetters = $("#searchLetters").val();
		api.search(searchLetters, fillWordTable);
	});
	// Hook up our list links
	$("#2letter,#greek,#qwithoutu").click(function(evt) {
		evt.preventDefault();
		$("#wordTable caption").html(evt.target.title);
		api.list(evt.target.id, fillWordTable);
	});
});
