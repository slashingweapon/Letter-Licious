/**
 *	Cheat With Words API
 *	by CJ Holmes
 *	Jan 2012
 *
 *	Requires JQuery
 *
 *	This object is intended to be common to both the desktop and the mobile versions of the
 *	Cheat With Words application.  An implementation creates a delegate object to receive
 *	the various state changes and manage the UI.  The application object's job is to:
 *	
 *	- Keep track of global data, to keep the global namespace clean
 *	- Provide an API for localStorage data that is capability-independent
 *	- Perform searches
 *	- Notify the delegate when special state changes occur.
 *
 *	The delegate object MAY implement the following methods, each of which takes a cwwApp()
 *	as a parameter.
 *
 *	- handleSearchStart(app) - Called just before the search is dispatched
 *	- handleSearchError(app, message) - Called when a search error is detected.
 *	- handleSearchEnd(app) - Called when a search is complete, regardless if there was an error or not.
 */ 
function cwwApp(obj) {
	this.delegate = obj;
	this.lastSearchError = null;
	this.hasLocalStorage = (typeof(localStorage) == 'object');
	this.local = {};
	this.requestCounter = 0;
	this.debug = false;
}

/**
 *	setLocalValue saves some JavaScript data under the given key.  If local storage is available
 *	on the browser, then it is saved on the user's machine.  Otherwise, the data is saved internally
 *	in the cwwApp object.
 *
 *	Keys begining with 'cww_' are reserved for internal use.
 */
cwwApp.prototype.setLocalValue = function(key, value) {
	if(this.hasLocalStorage)
		localStorage[key] = JSON.stringify(value);
	else
		this.local[key] = value;
}

/**
 *	getLocalValue retrieves data saved with setLocalValue().  If the data can't be found, then
 *	the boolean false is returned.
 */
cwwApp.prototype.getLocalValue = function(key) {
	retval = false;
	
	if(this.hasLocalStorage && typeof(localStorage[key] != 'undefined'))
		retval = eval('(' + localStorage[key] + ')') ;
	else if(typeof(this.local[key] != 'undefined'))
		retval = this.local[key];
	return retval;
}

/**
 *	Retrieve the latest search results.  You are guaranteed to receive an array of strings,
 *	but that array may be empty.  (eg: the previous search produced no results, or an error.)
 */
cwwApp.prototype.getSearchResults = function() {
	retval = this.getLocalValue('cww_searchResults');
	if (typeof(retval[0]) != 'string')
		retval = [];
	return retval;
}

/**
 *	Search for words that match the given parameters.  When the search is complete, the delegate's
 *	handleSearchEnd() method will be called.  At that time, the response will be available through
 *	this object's getSearchResults() method.
 *
 *	search() accepts two kinds of parameters:
 *	- A string of letters to use in the search or
 *	- An object consisting of
 *		- letters: (required) the letters to search
 *		- prefix: restrict matches to those words matching the prefix
 *		- suffix: restrict matches to those words with this suffix
 *		- onBoard: if true, prefix and suffix characters are added to the letters
 *	Search for words that you can make from the letters in the given string.  The response will
 *	always be an array of words (which may be empty).
 */
cwwApp.prototype.search = function(params) {
	if (typeof(params)=='string')
		params = {letters:params};

	paramObj = $.extend({letters:'',prefix:'',suffix:'',onBoard:true}, params);
	this.makeCall('/words/json', 'advancedSearch', [paramObj]);
};

/**
 *	Return one of the standard lists of words.  The currently-recognized lists are:
 *	- 2letter
 *	- greek
 *	- qwithoutu
 */
cwwApp.prototype.list = function(lname) {
	this.makeCall('/words/json', 'list', [lname]);
};


/**
 *	This is the lower-level word-grabbing function used by search() and list().  Just keeping
 *	things DRY.
 *
 *	@param string url The URL to call
 *	@param string method The method to call
 *	@param array params An array of parameters to pass to the method
 */
cwwApp.prototype.makeCall = function(url, method, params) {
	var req = new Object();
	req.jsonrpc = "2.0";
	req.method = method;
	req.id = this.requestCounter++;
	req.params = params;
	thisApp = this;
	
	var reqString = JSON.stringify(req);
	if (this.debug)
		console.log(reqString);
	
	this.setLocalValue('cww_searchResults', []);
	
	if (typeof(this.delegate.handleSearchStart) == 'function')
		this.delegate.handleSearchStart(this);
		
	$.post(url, reqString, null, "json")
	.success(function(data, status, jqxhr) {
		var retval = [];
		if (typeof(data.result) == 'object') {
			if(typeof(data.result.words) == 'object')
				// advanced search result
				retval = data.result.words;
			else if (typeof(data.result[0] == 'string'))
				retval = data.result;
		} else if (typeof(data.error.message) == 'string') {
			thisApp.lastSearchError = data.error;
			if (typeof(thisApp.delegate.handleSearchError) == 'function')
				thisApp.delegate.handleSearchError(thisApp, data.error.message);
		}
		thisApp.setLocalValue('cww_searchResults', retval);

		if (typeof(thisApp.delegate.handleSearchEnd) == 'function')
			thisApp.delegate.handleSearchEnd(this);
	})
	.fail(function() {
		if (typeof(thisApp.delegate.handleSearchError) == 'function')
			thisApp.delegate.handleSearchError(this, "JSON RPC failed");
	});	
}
