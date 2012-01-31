<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Letters extends CI_Controller {

	function __construct() {
		parent::__construct();
		$this->load->helper('letter');
		$this->load->model('words_model', '', true);
	}
	
	public function index() {
		$search = $this->input->post("search");
		$words = array();
		$letters = false;
		$unique_letters = false;
		$stuff = false;
		
		if ($search !== false)
			list($letters, $unique_letters) = processLetters($search);
		
		if (!empty($unique_letters))
			$words = $this->words_model->getWordsForUniqueLetters($unique_letters);
		
		$this->template->assign(array(
			'search' => $search,
			'words' => $words,
			'letters' => $letters,
			'unique_letters' => $unique_letters,
		) );
		$this->template->display('letters.tpl');
	}
}
