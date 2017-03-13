<?php
	$url = "http://qt.qq.com/php_cgi/news/php/varcache_getnews.php?id=12&page=0&plat=ios&version=33";
	$res = file_get_contents($url);
	echo $_GET['callback']."(".$res.")";
	//echo $_GET['callback']."({list:[{title:'a'},{title:'b'},{title:'c'},{title:'d'}]})";
?>