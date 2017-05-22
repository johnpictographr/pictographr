<?php

$images = glob("*.png");

//print each file name
foreach($images as $image)
{
  echo "&nbsp;<img src='" . $image. "'>$image "."<br />";;
}