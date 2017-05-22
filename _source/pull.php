<?php

chdir('/var/www/html/app');
echo("<pre>".shell_exec('ls -l 2>&1')."</pre>");
echo("<pre>".shell_exec('git pull 2>&1')."</pre>"); 


?>