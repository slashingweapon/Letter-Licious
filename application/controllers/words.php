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
		
		$this->searchTime = microtime(true);
	}
	
	/*	I had to write this because CodeIgniter's so-called date helper doesn't know how to properly
		format an RFC 1123 date-time.  Assholes!
	*/
	private function httpDate($time) {
		return gmdate('D, d M Y H:i:s', $time) . ' GMT';
	}
	
	public function index() {
		$this->load->helper('url');
		
		if ($this->agent->is_mobile())
			redirect("/mobile.html");
		else
			redirect("/desktop.html");
	}
	
	public function manifest() {
		
		$ver = $this->appinfo['version'];
		if (ENVIRONMENT != 'production')
			$ver .= "." . rand();

		$lmod = time();
		$maxAge = $this->appinfo['clientCache'];
		header("Cache-control: public, max-age=$maxAge");
		$date = $this->httpDate($lmod);
		header("Last-Modified: $date");
		$date = $this->httpDate(time()+$maxAge);
		header("Expires: $date");

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
		
		$this->logSearch('search', implode('', $letters));
		
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
		
		$this->logSearch('list', $listName);
		
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
		$blanks = 0;
		$retval = (object)array(
			'letters' => '',
			'duration_ms' => 0,
			'words' => array(),
		);

		if (!is_object($terms))
			throw new Exception("Expected object for parameter 1");
		
		if (!isset($terms->letters) || !is_string($terms->letters))
			throw new Exception("Expected string for p1.letters");
		else {
			$blanks = substr_count($terms->letters, '?');
			$terms->letters = filterString($terms->letters);
		}
		
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
		
		if (!empty($uniqueLetters)) {
			if (!$blanks) {
				$retval->words = $this->words_model->findWordsByEnumeratedLetters($uniqueLetters, 
					$terms->prefix, $terms->suffix, $intvl);
			} else {
				$retval->words = $this->words_model->findWordsBySetDifference($uniqueLetters, 
					$blanks, $terms->prefix, $terms->suffix, $intvl);
			}
		}
		$retval->duration_ms = intval($intvl*1000);
		
		$this->logSearch('asearch', $retval->letters);
		
		return $retval;
	}
	
	/**
	 *	Log the search operation.
	 *
	 *	$type must be 'search', 'list', or 'error'
	 *	$terms must be empty or a string.
	 *
	 *	If both of these requirements aren't met, then this function silently fails.
	 */
	private function logSearch($type='', $terms='') {
		$timeTaken = intval((microtime(true) - $this->searchTime) * 1000);
		$date = gmdate('Y-m-d H:i:s');
		$referer = isset($_SERVER['HTTP_REFERER']) 
			? @parse_url($_SERVER['HTTP_REFERER'], PHP_URL_HOST) 
			: '';
		$ip = isset($_SERVER['REMOTE_ADDR'])
			? $_SERVER['REMOTE_ADDR']
			: '';
			
		if (in_array($type, array('search', 'asearch', 'list', 'error')) && is_string($terms)) {
			if ( ($fp = fopen($this->appinfo['searchLog'], 'a')) !== false) {
				fwrite($fp, "$date\t$timeTaken\t$ip\t$referer\t$type\t$terms\n");
				fclose($fp);
			}
		}
	}

	/**
	 *	Sends contact email.  Expects the following strings:
	 *	- name: sender name
	 *	- address: sender's email address
	 *	- subject: Subject of the email
	 *	- body: body of message
	 */
	public function _json_contact($name='', $address='', $subject='', $body='') {
		$this->load->library('template');
		$this->load->library('email');

		$safetyPattern = '/[^A-Z0-9_ -]/i';
		$emailAddressPattern = "/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i";
		
		$this->template->debugging = false;
		
		$validAddresses;
		if (! preg_match($emailAddressPattern, $address, $validAddresses))
			throw new Exception("You did not enter an email address!");
		
		$safeName = preg_replace($safetyPattern, ' ', $name);
		$safeSubject = preg_replace($safetyPattern, ' ', $subject);
		
		// Stuff that goes into email headers has to be cleaned up a bit.  We can print the full
		// version in the body without worry, but certain characters can be a problem for headers.
		// I don't even want to think about what I could do with "Blah blah \r\nHeader: bad data".
		$this->email->from($validAddresses[0], $safeName);
		$this->email->subject("Cheat With Words Feedback: $safeSubject");
		$this->email->to($this->appinfo['contactEmail']);
		
		$this->template->assign( array(
			'fromEmail' => $validAddresses[0],
			'fromName' => $name,
			'subject' => $subject,
			'body' => $body,
		) );
		$this->email->message( $this->template->fetch('contact.tpl') );
		if(!$this->email->send())
			throw new Exception("Server error: Unable to process email.");
		
		return true;
	}
}
