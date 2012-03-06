<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Words_model extends CI_Model {
	
	/**
	 *	Runs a query like:
	 *
	 *	select word from words where letters <@ '{A0,A1,A2,D0,K0,R0,R1,V0}';
	 *
	 *	Returns an array of words.  Returns an empty array on failure.
	 */
	public function findWordsByEnumeratedLetters($letters, $prefix=null, $suffix=null, &$time=null) {
		$retval = array();
		$intvl = 0;
		$letterStuff = implode(',', $letters);
		
		$this->db->from('words')
			->select('trim(from word) as trimword', false)
			->where("letters <@ '\{$letterStuff}'")
			->order_by('len', "desc")
			->order_by("trimword")
			->limit(1000);
			
		if (!empty($prefix))
			$this->db->where("word like '$prefix%'");
		
		if (!empty($suffix))
			$this->db->where("word similar to '%$suffix *'");
			
		// measure the time it takes to query and fetch the data
		$time = microtime(true);

		$query = $this->db->get();			
		foreach($query->result() as $row)
			$retval[] = $row->trimword;
			
		$time = microtime(true) - $time;

		return $retval;
	}
	
	/**
	 *	Runs a query like:
	 *
	 *	select trim(word) as tword from words where 
	 *		(select count(*) from 
	 *			(select unnest(letters) 
	 *			except 
	 *			select unnest(ARRAY['A0','C0','T0','D0'])
	 *		) as ergh) <= 2;
	 *
	 *	Returns an array of words.  Returns an empty array on failure.
	 */
	public function findWordsBySetDifference($letters, $blanks=0, $prefix=null, $suffix=null, &$time=null) {
		$retval = array();
		$intvl = 0;
		$blanks = intval($blanks);
		$letterStuff = "ARRAY['" . implode("','", $letters) . "']";
		
		if ($blanks > 2)
			throw new Exception("Two blank maximum");
			
		$this->db->from('words')
			->select('trim(from word) as trimword', false)
			->where("(select count(*) from (select unnest(letters) except select unnest($letterStuff)) as ergh) <= $blanks")
			->order_by('len', "desc")
			->order_by("trimword")
			->limit(1000);
			
		if (!empty($prefix))
			$this->db->where("word like '$prefix%'");
		
		if (!empty($suffix))
			$this->db->where("word similar to '%$suffix *'");
			
		// measure the time it takes to query and fetch the data
		$time = microtime(true);

		$query = $this->db->get();			
		foreach($query->result() as $row)
			$retval[] = $row->trimword;
			
		$time = microtime(true) - $time;

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

