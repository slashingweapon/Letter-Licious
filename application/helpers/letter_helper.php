<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 *	Takes a word and returns its letters in two different arrays.  The first is just the letters
 *	sorted alphabetically, and the second array numbers the letters so there are no duplicate
 *	letters.  For example, the word AARDVARK
 *	returns: 
 *		array(
 *			array('A','A','A','D','K','R','R','V'),
 *			array('A0','A1','A2','D0','K0','R0','R1','V0'),
 *		);
 *
 *	This function also removes all non-alphabetic characters from the string, and restricts the
 *	string size to 15 characters.
 *	
 *	@param string $word The string to process
 *	@return array An array of two arrays of characters
 */
function processLetters($word) {
	$letters = array();
	$letters_nr = array();
	
	$word = preg_replace('/[^a-zA-Z]/','', $word);
	$word = substr($word, 0, 15);
	$word = strtoupper($word);
	$count = strlen($word);
	
	for($idx=0; $idx<$count; $idx++)
		$letters[] = $word[$idx];
	sort($letters);
	
	$lastLetter = '';
	$repeat = 0;
	foreach($letters as $oneLetter) {
		if ($oneLetter == $lastLetter)
			$repeat++;
		else
			$repeat = 0;
		$letters_nr[] = "$oneLetter$repeat";
		$lastLetter = $oneLetter;
	}

	return array($letters, $letters_nr);
}
