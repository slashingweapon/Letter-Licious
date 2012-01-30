<?php

processLines('TWL06.txt', 'parsedwords.txt');

function processLines($inFilename, $outFilename) {
	$outfile = fopen($outFilename, "w");
	
	$lines = file($inFilename);
	foreach($lines as $oneLine) {
		if (!empty($oneLine)) {
			$oneLine = trim($oneLine);
			$sortWord = lettersort($oneLine);
			$length = strlen($sortWord);
			fwrite($outfile, "$length\t$sortWord\t$oneLine\n");
		}
	}
}

function lettersort($word) {
	$letters = array();
	$word = trim($word);
	$word = strtoupper($word);
	$count = strlen($word);
	
	for($idx=0; $idx<$count; $idx++)
		$letters[] = $word[$idx];
	sort($letters);
	$word = implode('', $letters);
	return $word;
}
