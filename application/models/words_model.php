<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Words_model extends CI_Model {
	
	/**
	 *	Runs a query like:
	 *
	 *	select word from words where letters <@ '{A0,A1,A2,D0,K0,R0,R1,V0}';
	 *
	 *	Returns an array of words.  Returns an empty array on failure.
	 */
	public function findWordsByEnumeratedLetters($letters) {
		$retval = array();
		$letterStuff = implode(',', $letters);
		
		$query = $this->db->from('words')
			->select('trim(from word) as trimword', false)
			->where("letters <@ '\{$letterStuff}'")
			->order_by('len', "desc")
			->order_by("trimword") 
			->get();
		
		foreach($query->result() as $row)
			$retval[] = $row->trimword;
			
		return $retval;
	}
	
	/**
	 *	Returns a list of all words of a given length.  This is meant to be used only with values
	 *	2 or 3.  Using bigger numbers could be detrimental to your database performance.
	 *
	 *	@param int len The number of letters in the words.
	 *	@return array An array of words
	 */
	 public function findWordsOfLength($len) {
	 	$retval = array();
	 	
	 	$query = $this->db->from('words')
	 		->select('trim(from word) as trimword', false)
	 		->where('len', $len)
	 		->order_by('trimword')
	 		->get();
	 	
	 	foreach($query->result() as $row)
	 		$retval[] = $row->trimword;
	 		
	 	return $retval;
	 }
	 
	 /**
	  *	Finds all words that contain Q but do not include the letter U.
	  *
	  *	select trim(from word) as trimword from words where '{Q0}' <@ letters and NOT '{U0}' <@ letters;
	  *
	  *	@return array An array of strings
	  */
	 public function findQWithoutU() {
	 	$retval = array();
	 	
	 	$query = $this->db->query("select trim(from word) as trimword from words where '{Q0}' <@ letters and NOT '{U0}' <@ letters");
	 	
	 	foreach($query->result() as $row)
	 		$retval[] = $row->trimword;
	 		
	 	return $retval;
	 }
	 
}

