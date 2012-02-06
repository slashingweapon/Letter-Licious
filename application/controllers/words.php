<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once("json_controller.php");

class Words extends Json_Controller {

	function __construct() {
		parent::__construct();

		// Save the application.php configuration as $this->appinfo
		$this->config->load("application",true);
		$this->appinfo = $this->config->item("application");

		$this->load->helper('letter');
		$this->load->library('user_agent');
		$this->load->model('words_model', '', true);
	}
	
	/*	I had to write this because CodeIgniter's so-called date helper doesn't know how to properly
		format an RFC 1123 date-time.  Assholes!
	*/
	private function httpDate($time) {
		return gmdate('D, d M Y H:i:s', $time) . ' GMT';
	}
	
	public function index() {
		$page = "desktop.html";
		if ($this->agent->is_mobile())
			$page = "mobile.html";
		
		$file = APPPATH . "../public/$page";
		if (file_exists($file)) {
			$lmod = filemtime($file);
			$maxAge = $this->appinfo['clientCache'];
			header("Cache-control: public, max-age=$maxAge");
			$date = $this->httpDate($lmod);
			header("Last-Modified: $date");
			$date = $this->httpDate(time()+$maxAge);
			header("Expires: $date");
			
			readfile($file);
		} else
			show_error("Could not locate $page ($file)",500);
	}
	
	public function manifest() {
		
		$ver = $this->appinfo['version'];
		if (ENVIRONMENT != 'production')
			$ver .= "." . rand();

		header("Content-type: text/cache-manifest");
		echo("CACHE MANIFEST\n\n");
		echo("# This file was automatically generated\n");
		echo("# $ver\n");
		echo("\n");
		echo("CACHE:\n");
		echo(implode("\n",$this->appinfo['manifest']));
	}
	
	/**
	 *	The simplest API we have.  You send a string of letters, and this function returns
	 *	an array of matching words.  All of the words are capitalized, and sorted first by length
	 *	and then alphabetically.  
	 *
	 *	@param string $search The letters to use for making words
	 *	@return array An array of strings, each one a word that can be made form the search letters
	 */
	public function _json_search($search) {
		$words = array();
		$letters = false;
		$unique_letters = false;
		$stuff = false;
		
		if (!empty($search))
			list($letters, $unique_letters) = processLetters($search);
		
		if (!empty($unique_letters))
			$words = $this->words_model->findWordsByEnumeratedLetters($unique_letters);
		
		return $words;
	}
	
	/**
	 *	Returns an array of words from one of the common lists we keep in the cache.  These are
	 *	used so frequently that we make them a special case.
	 *
	 *	The list names are case-insensitive, and are rather self-explanatory:
	 *	- 2letter
	 *	- greek
	 *	- qwithoutu
	 *
	 *	@param string $listName The name of the list to return
	 *	@return array An array of valid words from the given list
	 */
	public function _json_list($listName=false) {
		$words = array();
		$listName = strtolower($listName);
		$listName = preg_replace('/[^a-z0-9]/','', $listName);
		$fileName = APPPATH . "../public/lists/{$listName}.txt";

		if (file_exists($fileName))
			$words = file($fileName,FILE_IGNORE_NEW_LINES);
			
		return $words;
	}
	
	/**
	 *	Takes an object with a variety of search parameters, and returns an object with detailed 
	 *	results.
	 *
	 *	The input object may have the following properties:
	 *	- letters (required) The player's letters
	 *	- prefix (optional) Limit results to words starting with these letters
	 *	- suffix (optional) Limit results to words ending with these letters
	 *	- onBoard (optinal) If true, the prefix/suffix letters are already on the board
	 *	
	 *	The output object has the following properties:
	 *	- words An array of matching words.  Could be empty.
	 *	- letters The actual search letters used
	 *	- duration_ms How long it took to perform the search, in milliseconds.
	 */
	public function _json_advancedSearch($terms) {
		$retval = (object)array(
			'letters' => '',
			'duration_ms' => 0,
			'words' => array(),
		);

		if (!is_object($terms))
			throw new Exception("Expected object for parameter 1");
		
		if (!isset($terms->letters) || !is_string($terms->letters))
			throw new Exception("Expected string for p1.letters");
		else
			$terms->letters = filterString($terms->letters);
		
		// set some default values for other parts of the object, to simplify our logic later
		if (!isset($terms->prefix) || !is_string($terms->prefix))	
			$terms->prefix = '';
		else
			$terms->prefix = filterString($terms->prefix);
			
		if (!isset($terms->suffix) || !is_string($terms->suffix))	
			$terms->suffix = '';
		else
			$terms->suffix = filterString($terms->suffix);
			
		if (!isset($terms->onBoard)) 
			$terms->onBoard = false;
		
		if ($terms->onBoard)
			$terms->letters .= $terms->prefix . $terms->suffix;
		else {
			$_ixes = $terms->prefix . $terms->suffix;
			$len = strlen($_ixes);
			for($idx=0; $idx<$len; $idx++) {
				$char = $_ixes[$idx];
				// we have to make sure that all the letters we use in the prefix and suffix
				// are in fact available in ->letters.  This includes counting incidences of
				// letters.
				if (substr_count($terms->letters, $char) < substr_count($_ixes, $char))
					throw new Exception("You need more letters for that prefix/suffix.");
			}
		}
		
		if (strlen($terms->letters)>15)
			throw new Exception("You have too many letters.  Fifteen is the maximum.");
		
		list($searchLetters, $uniqueLetters) = processLetters($terms->letters);
		$retval->letters = implode('', $searchLetters);
		$intvl = 1;
		
		if (!empty($uniqueLetters))
			$retval->words = $this->words_model->findWordsByEnumeratedLetters($uniqueLetters, 
				$terms->prefix, $terms->suffix, $intvl);
		
		$retval->duration_ms = intval($intvl*1000);
		
		return $retval;
	}
	
}
