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
			$letterArray = lettersort($oneWord);
			$sortletters = implode('', $letterArray);
			$letters = implode(',', $letterArray);
			
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
 *	Takes a word and returns its letters in a sorted array.  For example, the word AARDVARK
 *	returns array('A','A','A','D','K','R','R','V')
 *
 *	@param string $word The string to process
 *	@return array An array of characters, in ascending order
 */
function lettersort($word) {
	$letters = array();
	$count = strlen($word);
	
	for($idx=0; $idx<$count; $idx++)
		$letters[] = $word[$idx];
	sort($letters);
	return $letters;
}
