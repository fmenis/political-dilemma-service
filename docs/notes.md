# Notes

## Criticità

### Casing diverso tra campi tabelle e output API

Siccome postgres accetta solo nomi lowercase, i campi a db sono in snake casing, invece l'output delle API in camelcase.
Questo genera molte scomodità e brutture:

- impossibilità di passare i nomi dei campi diretti dal FE, per esempio nei filtri di una lista. Dovrà esserci per forza qualcosa che li converte nel casing adatto al db
- forzatura nel dover tradurre tutti i campi in arrivo dal db in camelcase

Possibili risoluzioni:

- uniformare il casing del db, forzando pg ad avere i nomi in camelcase. Questo vuol dire dover racchiudere ogni nome tra doppi apici, molto scomodo da fare a mano. Per cui trovare una libreria che con cui questo passaggio possa essere fatto da lei

### Usare il libreria per postgres a basso livello

Utilizzare pg rende piuttosto complicato e pastrocciato il codice.  
Unito al punto precedente, tutto indica che è il caso di utilizzare una libreria un pò più ad alto livello.  
Guardare massive.js
