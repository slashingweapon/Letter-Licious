<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Words_model extends CI_Model {
	
	/**
	 *	Runs a query like:
	 *
	 *	select word from words where letters <@ '{A0,A1,A2,D0,K0,R0,R1,V0}';
	 *
	 *	Returns an array of words.  Returns an empty array on failure.
	 */
	public function getWordsForUniqueLetters($letters) {
		$retval = array();
		$letterStuff = implode(',', $letters);
		
		$query = $this->db->query("select word from words where letters <@ '\{$letterStuff}' order by len DESC, word");
		foreach($query->result() as $row) {
			$retval[] = $row->word;
		}
		
		return $retval;
	}
}

