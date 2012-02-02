<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once("json_controller.php");

class Words extends Json_Controller {

	function __construct() {
		parent::__construct();
		$this->load->helper('letter');
		$this->load->library('user_agent');
		$this->load->model('words_model', '', true);
	}
	
	public function index() {
//		$page = "desktop.html";
//		if ($this->agent->is_mobile())
			$page = "mobile.html";
		
		$file = APPPATH . "../public/$page";
		if (file_exists($file))
			readfile($file);
		else
			show_error("Could not locate $page ($file)",500);
	}
	
	public function manifest() {
		$this->config->load("application",true);
		$appinfo = $this->config->item("application");
		
		$ver = $appinfo['version'];
		if (ENVIRONMENT != 'production')
			$ver .= "." . rand();

		header("Content-type: text/cache-manifest");
		echo("CACHE MANIFEST\n\n");
		echo("# This file was automatically generated\n");
		echo("# $ver\n");
		echo("\n");
		echo("CACHE:\n");
		echo(implode("\n",$appinfo['manifest']));
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
	
}
