<?php

    $spBaseUrl = 'https://pictographr.com/partners/onelogin'; //or http://<your_domain>

    $settingsInfo = array (
        'sp' => array (
            'entityId' => $spBaseUrl.'/demo1/metadata.php',
            'assertionConsumerService' => array (
                'url' => $spBaseUrl.'/demo1/index.php?acs',
            ),
            'singleLogoutService' => array (
                'url' => $spBaseUrl.'/demo1/index.php?sls',
            ),
            'NameIDFormat' => 'urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress',
        ),
        'idp' => array (
            'entityId' => 'https://app.onelogin.com/saml/metadata/545974',
            'singleSignOnService' => array (
                'url' => 'https://pictographr-dev.onelogin.com/trust/saml2/http-post/sso/545974',
            ),
            'singleLogoutService' => array (
                'url' => 'https://pictographr-dev.onelogin.com/trust/saml2/http-redirect/slo/545974',
            ),
            'x509cert' => '-----BEGIN CERTIFICATE-----
MIIELzCCAxegAwIBAgIUZQ9B9evQxLvuXI6hNJn4B31s0PMwDQYJKoZIhvcNAQEF
BQAwYDELMAkGA1UEBhMCVVMxGTAXBgNVBAoMEFBpY3RvZ3JhcGhyIEluYy4xFTAT
BgNVBAsMDE9uZUxvZ2luIElkUDEfMB0GA1UEAwwWT25lTG9naW4gQWNjb3VudCA4
Mjc5MzAeFw0xNjA0MjMyMjM2NThaFw0yMTA0MjQyMjM2NThaMGAxCzAJBgNVBAYT
AlVTMRkwFwYDVQQKDBBQaWN0b2dyYXBociBJbmMuMRUwEwYDVQQLDAxPbmVMb2dp
biBJZFAxHzAdBgNVBAMMFk9uZUxvZ2luIEFjY291bnQgODI3OTMwggEiMA0GCSqG
SIb3DQEBAQUAA4IBDwAwggEKAoIBAQDCNSUGswU92UTPZnko6n5lkjK5N5ReA2TJ
rZDm7nvd6QGYRgt843ynaNjzBSmpUFPtptoQ7CZYG7oBDiLA70nINegMsmzD2d6a
+LLwaRrVDI9GV5TTtIdZG+S6GhmKbVk9pZHq46YJrq4ZQHVT3nDEKueVzN+qu7F9
UT6TLLo/ZK3TG6hF55Hflsi+GllZroUK1poMBHCCy9GR3NFLFUlyRnakduI/xFtQ
498Ug58hGpWT7DOYaOSUzNZlGRTKPYefAsB+AsY2q7lA5UdB9UYf5e68nDhyEenz
UxUg9J6Wy87FZynI8sEju+URTDKycxHUYOHL7tQyrG4YxRBJtwVrAgMBAAGjgeAw
gd0wDAYDVR0TAQH/BAIwADAdBgNVHQ4EFgQUxwd2q/6ekezJCk/4hBIOWW+Y2/Qw
gZ0GA1UdIwSBlTCBkoAUxwd2q/6ekezJCk/4hBIOWW+Y2/ShZKRiMGAxCzAJBgNV
BAYTAlVTMRkwFwYDVQQKDBBQaWN0b2dyYXBociBJbmMuMRUwEwYDVQQLDAxPbmVM
b2dpbiBJZFAxHzAdBgNVBAMMFk9uZUxvZ2luIEFjY291bnQgODI3OTOCFGUPQfXr
0MS77lyOoTSZ+Ad9bNDzMA4GA1UdDwEB/wQEAwIHgDANBgkqhkiG9w0BAQUFAAOC
AQEAGRjm8hqCoSB+DVtu+WiazjL1RHabzQ7Ck1MTxw78x39ARIGELB0HMkWl7gKK
ffgX9Oa77MyQGWOPzGwpW2KeSrPxCavABVNMvIiHKSTmd5DStFNpBHePXArRKl+3
8voM38r2fwhtVMAjC5Pu6cFFRNwbUGzvIe45UaIf1csFXgGr/BqQOR4L78sKavBu
k/WNtePZkWzD+DGFnHeO0RB2eaSGJ3O5iVJZounV/VjOCDi2ixzc7q2ZH4F9ZzHr
UDNyfMri4UBsMBAT1ttMRJ+kiEFBa7dlrf2sg2duL9QNvku9uyT1/L9ogTx+RsLd
07tdMmG7mSERiZy2XVbtKJXsOA==
-----END CERTIFICATE-----
',
        ),
    );
