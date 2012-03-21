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
	this.currentColumns = 4;
	this.application = null;
}

desktopController.prototype.handleSearchStart = function(app) {
	$(".resultArea").hide();
	$(".resultArea.searching").show();
}

desktopController.prototype.handleSearchError = function(app, message) {
	$(".resultArea").hide();
	$(".resultArea.searchError p").html(message);
	$(".resultArea.searchError").show();
}

desktopController.prototype.handleSearchEnd = function(app) {
	this.renderWordTable();
}

desktopController.prototype.renderWordTable = function() {
	var html = "";
	
	$(".resultArea").hide();
	
	$("#wordTable caption").html(this.application.getLocalValue('resultCaption'));
	var currentWords = this.application.getSearchResults();
	
	if (currentWords.length > 0) {
		currentWords = this.sortWords(currentWords);
		
		if (typeof(currentWords._group) != 'undefined') {
			html = this.renderGroupedWordTable(currentWords);
		} else {
			html = this.renderRows(currentWords);
		}
		$(".resultArea.results").show();
	} else {
		$(".resultArea.noResults").show();
	}
	$("#wordTable tbody").html(html);
	$("#searchLetters").focus();
}

desktopController.prototype.renderGroupedWordTable = function(groupedList) {
	var html = '';
	var keyList = [];
	var group = '';
	
	// Find out how the list is grouped
	for (var name in groupedList) {
		if (name == "_group")
			group = groupedList._group;
		else
			keyList.push(name);
	}
	
	// Length goes from highest to lowest.  All other groupings go alphabetically.
	if (group == 'length') {
		keyList.sort(function(left,right) {
			return parseInt(right) - parseInt(left);
		} );
	} else {
		keyList.sort();
	}
	
	for(var idx in keyList) {
		var key = keyList[idx];
		var title = '';
		
		switch(group) {
			case 'first':
				title = 'words starting with ' + key;
				break;
			case 'last':
				title = 'words ending with ' + key;
				break;
			case 'length':
				title = '' + key + '-letter words';
				break;
			default:
				title = key;
				break;
		}
		
		html += "<tr><td class='groupRow' colspan='5'>"+title+"</td></tr>";
		html += this.renderRows(groupedList[keyList[idx]]);
	}
	
	return html;
}

desktopController.prototype.renderRows = function(wordList) {
	var html = '';
	
	for(idx=0; idx<wordList.length; idx++) {
		if (idx % this.currentColumns == 0) {
			html += "<tr>";
		}
		html += "<td>" + wordList[idx] + "</td>";
		if (idx % this.currentColumns == this.currentColumns - 1) {
			html += "</tr>"
		}
	}
	if (idx % this.currentColumns != this.currentColumns - 1) {
		html += "</tr>";
	}

	return html;
};

desktopController.prototype.sortWords = function(wordList) {
	var prefs = this.application.getLocalValue("searchPrefs");
	var sfunc;
	var ifunc;	// a function which returns the value on which a string is grouped
	
	switch (prefs.sort) {
		case "first":
			sfunc = function(left,right) {
				retval = 0;
				if (left < right)
					retval = -1;
				else if (left > right)
					retval = 1;
				return retval;
			};
			ifunc = function(item) {
				return item[0];
			};
			break;
		case "last":
			sfunc = function(left,right) {
				left = left.split("").reverse().join("");
				right = right.split("").reverse().join("");
				retval = 0;
				if (left < right)
					retval = -1;
				else if (left > right)
					retval = 1;
				return retval;
			};
			ifunc = function(item) {
				return item[item.length-1];
			};
			break;
		case "length":
		default:
			sfunc = function(left,right) {
				var retval = 0;
				if (left.length > right.length)
					retval = -1;
				else if (left.length < right.length)
					retval = 1;
				else if (left < right)
					retval = -1;
				else if (left > right)
					retval = 1;
				return retval;
			};
			ifunc = function(item) {
				return item.length;
			};
			break;
	}
	wordList = wordList.sort(sfunc);
	
	if (prefs.group) {
		var grph = {};
		grph._group = prefs.sort;
		for (var idx=0; idx<wordList.length; idx++) {
			var section = ifunc(wordList[idx]);
			if (typeof(grph[section]) == 'undefined')
				grph[section] = [];
			grph[section].push(wordList[idx]);
		}
		wordList = grph;
	}

	return wordList;
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

// read, clean, reflect in UI, and then save the cleaned result
desktopController.prototype.restorePrefs = function() {
	var prefs = {
		group: true,
		sort: "length"
	};
	var savedPrefs = this.application.getLocalValue("searchPrefs", prefs);
	if (typeof(savedPrefs) == "object") 
		prefs = $.extend(prefs, savedPrefs);
		
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

/*
	How nice we are, not putting anything into the global name space except a couple of classes.
*/
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
		app.setLocalValue('resultCaption', "WORDS USING " + searchParams.letters);
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
	// Come to think of it, this might be a good technique to use for search terms/results, too.
	$("#sortPrefs input").change(function(evt) {
		deskManager.savePrefs();
		deskManager.renderWordTable();
	} );
	
	// Contact Form
	$("#contactForm button[type=submit]").click(function(evt) {
		evt.preventDefault();
		$(".resultArea.contact .error").html('');

		$.jsonRPC('/words/json', "contact", 				
			$("#contactForm [name=contactName]").val(),
			$("#contactForm [name=contactEmail]").val(),
			$("#contactForm [name=contactSubject]").val(),
			$("#contactForm [name=contactMessage]").val()
		)
		 .done(function(data) {
			$(".resultArea").hide();
			$(".resultArea.contactThanks").show();
		 })
		 .fail(function(jqx, statusString, exc) {
		 	if (exc instanceof JSONRPCError)
				$(".resultArea.contact .error").html(exc.message);
			else
			 	$(".resultArea.contact .error").html("Server failure.  Please try again later. (" + exc +")");
		 });
	});
	
	// During startup we want to restore the last search terms and results
	oldTerms = app.getLocalValue("searchTerm");
	oldResults = app.getSearchResults();
	if (typeof(oldTerms) == 'object' && typeof(oldResults)=='object') {
		$("#searchLetters").val(oldTerms.letters);
		$("#prefixLetters").val(oldTerms.prefix);
		$("#suffixLetters").val(oldTerms.suffix);
		$("#onBoard").prop('checked', oldTerms.onBoard);
		deskManager.renderWordTable();
	}
	
	jQuery("#searchLetters").focus();
});
