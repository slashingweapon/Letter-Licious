<?php

$dsn = 'pgsql:host=localhost;dbname=letteredman;user=slashingweapon;password=jacobo';
$username = 'root';
$password = '';

$dbh = new PDO($dsn);
if (!($dbh instanceof PDO)) {
	echo "No db connection";
	exit(1);
}

processLines('TWL06.txt', $dbh);

function processLines($inFilename, $dbConn) {
	$query = "INSERT INTO words (len, sortletters, letters, word) 
		VALUES (?, ?, string_to_array(?,','), ?)";
	$statement = $dbConn->prepare($query);
	$linecount = 0;
	
	$lines = file($inFilename);
	foreach($lines as $oneWord) {
		$oneWord = trim($oneWord);
		if (!empty($oneWord)) {
			$oneWord = strtoupper($oneWord);
			$length = strlen($oneWord);
			list($sortletters, $letters) = lettersort($oneWord);
			$sortletters = implode('', $sortletters);
			$letters = implode(',', $letters);
			if (! $statement->execute(array($length, $sortletters, $letters, $oneWord))) {
				echo "Insert failed\n";
				exit();
			}
			
			$linecount++;
			if (!($linecount % 1000))
				echo "Added $linecount words\n";
		}
	}
}

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
 *	@param string $word The string to process
 *	@return array An array of two arrays of characters
 */
function lettersort($word) {
	$letters = array();
	$letters_nr = array();
	
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
