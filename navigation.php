<?php
	$url = "http://qt.qq.com/static/pages/news/phone/c13_list_1.shtml";
	$res = file_get_contents($url);
	echo $_GET['callback']."(".$res.")";
?>