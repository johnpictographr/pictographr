<?php
// #! /bin/sh
// php /var/www/pictographr/_source/cleartemp.php

	echo(shell_exec('clear'));
	echo "\n";
	echo "\n";
	echo(shell_exec('sudo pkill -f phantomjs'));
	echo(shell_exec('sudo pkill -f pngquant'));
	echo "\n";
	echo "\n";
	
	
	echo(shell_exec('sudo rm -f -r  /var/www/pictographr/temp/*.pdf'));
	echo(shell_exec('sudo rm -f -r  /var/www/pictographr/temp/*.png'));
	echo(shell_exec('sudo rm -f -r  /var/www/pictographr/temp/*.js'));
	echo "\n";
	echo "\n";
	echo(shell_exec('ls -l  /var/www/pictographr/temp'));

	echo "\n";
	echo("<pre>: ".shell_exec('php /var/www/pictographr/index.php more clearHangingPhantomServer')."</pre>");
	echo("<pre>: ".shell_exec('php /var/www/pictographr/index.php more clearswitch')."</pre>");
	echo "\n";

?>