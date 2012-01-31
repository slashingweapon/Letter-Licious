/**
 *	Cheat With Words API
 *	by CJ Holmes
 *	Jan 2012
 *
 *	Requires JQuery
 */
 
function cww_api() {
	this.requestCounter = 0;
	this.debug = false;
};

/**
 *	Search for words that you can make from the letters in the given string.  The response will
 *	always be an array of words (which may be empty).  When the response arrives, the callback
 *	is invoked and passed the array of words.
 */
cww_api.prototype.search = function(letters,callback) {
	var url = '/words/json'

	var req = new Object();
	req.jsonrpc = "2.0";
	req.method = "search";
	req.id = this.requestCounter++;
	req.params = [letters];
	
	var reqString = JSON.stringify(req);
	if (this.debug)
		console.log(reqString);
		
	$.post(url, reqString, null, "json")
	.success(function(data, status, jqxhr) {
		var retval = [];
		if(typeof(data.result[0]) == 'string') {
			retval = data.result;
		} else if (this.debug && typeof(data.error.message) == 'string') {
			alert(data.error.message);
		}
		callback(retval);
	})
	.fail(function() {
		if (this.debug) {
			alert("JSON RPC failed");
		}
		callback([]);
	});	
};

/**
 *	Return one of the standard lists of words.  The currently-recognized lists are:
 *	- 2letter
 *	- 3letter
 *	- qwithoutu
 */
cww_api.prototype.list = function(lname,callback) {
	this.makeCall('/words/json', 'list', [lname], callback);
};


/**
 *	This is the lower-level word-grabbing function used by search() and list().  Just keeping
 *	things DRY.
 *
 *	@param string url The URL to call
 *	@param string method The method to call
 *	@param array params An array of parameters to pass to the method
 *	@param function callback The callback function, which must take a single array as its argument.
 */
cww_api.prototype.makeCall = function(url, method, params, callback) {
	var req = new Object();
	req.jsonrpc = "2.0";
	req.method = method;
	req.id = this.requestCounter++;
	req.params = params;
	
	var reqString = JSON.stringify(req);
	if (this.debug)
		console.log(reqString);
		
	$.post(url, reqString, null, "json")
	.success(function(data, status, jqxhr) {
		var retval = [];
		if(typeof(data.result[0]) == 'string') {
			retval = data.result;
		} else if (this.debug && typeof(data.error.message) == 'string') {
			alert(data.error.message);
		}
		callback(retval);
	})
	.fail(function() {
		if (this.debug) {
			alert("JSON RPC failed");
		}
		callback([]);
	});	
}
