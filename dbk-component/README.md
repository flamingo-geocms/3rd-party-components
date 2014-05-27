Dbk component
=============

REMARKS
-------
- Er wordt nog gebruik gemaakt van een lokaal fatures.json bestand voor
  het tonen van de features. En van meerdere lokale json files voor het
  tonen van object info.
- De gebruikte features.json is anders dan de door B3P aangeleverde. De 
  gebruikte heeft dezelfde opbouw als die van Zeeland.
- In de aangeleverde features zitten meerdere features met hetzelfde adres!
- Printen zit er niet in (aparte branch).
- Het geselecteerde object kan (voor bijv. printen) worden opgevraagd met de functie dbk.getSelectedDBKObject.
- Objectinformatie m.b.t. afwijkendebinnendekking wordt niet getoond.
- Dialogen zijn fixed size.
- De applicatie is getest onder FF en Chrome.

KNOWN ISSUE
----------
- In FF worden er geen ikonen in de dialogen getoond. In Chrome wel.

TODO
----
- Andere licentie, terugkoppelen met Milo.
- README.md nog afmaken/stroomlijnen.
- README_milo.md nog (deels) toevoegen.
- Verder opschonen?
- Dbk component configuratie?
- Wat als je heel veel gevaarlijke stoffen hebt? Krijg je dan een scrollbare lijst?
- Interfacing voor de Zoeker zit er nog niet in.

TESTING
-------
Gebruik de volgende objecten voor uitgebreide info:
..5326 Bizonsp. 332 - verblijf,afwijk,pand,brandcomp,brandw.voorz,contact,foto,gevaarl,hulpl,toegang.
..0505 Bizonsp. 1002 (niet Maarssen2) - brandw.voorz,verdiep,pand,hulpl.
..8505 Utrechtsew. 351 - brandw.voorz,pand,tekstobj.
..2322 Univers.weg 100 - verblijf,pand,contact,hulpl.

