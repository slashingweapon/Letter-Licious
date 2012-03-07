<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

$config['version'] = "r8";

$config['clientCache'] = 43200;	// 12 hours (in seconds) before a date check

$config['manifest'] = array(
	"/mobile.html",
	"/js/jquery-1.7.1.min.js",
	"/js/cwwApp.js",
	"/js/mobile.js",
	"/css/small-device.css",
	"/word.png",
);

$config['searchLog'] = APPPATH . '../tmp/log/search_' . gmdate('Ymd');

$config['contactEmail'] = 'cj@vbbn.com';

