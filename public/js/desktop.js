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
function desktopController() {
	this.currentColumns = 5;
	this.application = null;
}

desktopController.prototype.handleSearchStart = function(app) {
	$(".resultArea").hide();
	$(".resultArea.searching").show();
}

desktopController.prototype.handleSearchError = function(app, message) {

}

desktopController.prototype.handleSearchEnd = function(app) {
	this.renderWordTable();
}

desktopController.prototype.renderWordTable = function() {
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

desktopController.prototype.savePrefs = function() {
	var prefs = {
		group: false,
		sort: "first"
	};
	
	prefs.group = $("#sortPrefs input[name=group]:checked").val() ? true : false;
	prefs.sort = $("#sortPrefs input[name=sort]:checked").val();
	if(!prefs.sort)	// default to the first radio button
		prefs.sort = $("#sortPrefs input[name=sort]").val();
		
	this.application.setLocalValue("searchPrefs", prefs);
}

desktopController.prototype.restorePrefs = function() {
	var prefs = this.application.getLocalValue("searchPrefs", prefs);
	
	// read, clean, reflect in UI, and then save the cleaned result
	if (typeof(prefs.group) == "boolean" && prefs.group)
		$("#sortPrefs input[name=group][value=group]").attr("checked",true);
	if (typeof(prefs.sort) == "string") {
		var sortInput = $("#sortPrefs input[name=sort][value="+prefs.sort+"]");
		if (sortInput.length)
			sortInput.attr("checked",true);
		else
			$("#sortPrefs input[name=sort]").first().attr("checked",true);
	}
	
	this.savePrefs();
}

$(document).ready(function() {
	
	var deskManager = new desktopController();
	var app = new cwwApp(deskManager);
	deskManager.application = app;
	
	deskManager.restorePrefs();
	
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
	
	// Sort/Group preferences
	$("#sortPrefs input").change(function(evt) {
		deskManager.savePrefs();
		deskManager.renderWordTable();
	} );
	
	// Contact Form
	$("#contactForm button[type=submit]").click(function(evt) {
		evt.preventDefault();
		$(".resultArea.contact .error").html('');
		var req = {
			jsonrpc: "2.0",
			id: app.requestCounter++,
			method: "contact",
			params: [
				$("#contactForm [name=contactName]").val(),
				$("#contactForm [name=contactEmail]").val(),
				$("#contactForm [name=contactSubject]").val(),
				$("#contactForm [name=contactMessage]").val()
			]
		};
		$.post('/words/json', JSON.stringify(req), null, "json")
		 .success(function(data, status, jqxhr) {
		 	if (typeof(data.result) != 'undefined') {
				$(".resultArea").hide();
				$(".resultArea.contactThanks").show();
			} else if (typeof(data.error) != 'undefined' && typeof(data.error.message) == 'string') {
				$(".resultArea.contact .error").html(data.error.message);
			} else
				alert("unknown error");
		 })
		 .fail(function() {
		 	alert("Server failure.  Please try again later.");
		 });
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
	
});
