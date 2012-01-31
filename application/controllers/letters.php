<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once("json_controller.php");

class Letters extends Json_Controller {

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
	
	public function noindex() {
		$search = $this->input->post("search");
		$words = array();
		$letters = false;
		$unique_letters = false;
		$stuff = false;
		
		if ($search !== false)
			list($letters, $unique_letters) = processLetters($search);
		
		if (!empty($unique_letters))
			$words = $this->words_model->findWordsByEnumeratedLetters($unique_letters);
		
		$this->template->assign(array(
			'search' => $search,
			'words' => $words,
			'letters' => $letters,
			'unique_letters' => $unique_letters,
		) );
		$this->template->display('letters.tpl');
	}
	
	public function qWithoutU() {
		$words = $this->words_model->findQWithoutU();
		
		$this->template->assign(array(
			'search' => false,
			'words' => $words,
		) );
		$this->template->display('letters.tpl');
	}
	
	public function two() {
		$this->byLength(2);
	}
	
	public function three() {
		$this->byLength(3);
	}
	
	private function byLength($len) {
		$words = $this->words_model->findWordsOfLength($len);
		
		$this->template->assign(array(
			'search' => false,
			'words' => $words,
		) );
		$this->template->display('letters.tpl');
	}
}
