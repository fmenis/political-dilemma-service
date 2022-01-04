# Authorization

## Role based authorization

Sistema di auth basato sui ruoli: ogni api viene configurata con dei ruoli; se l'utente corrente detiene quel ruolo può consumare l'API senno no.

## RBAC

- ruoli: insieme di permessi
- permessi: cosa si può fare sulla risorsa (eg: user:create)

I permessi sono una proprietà della risorsa (user) e vengono assegnati (uno o più) a dei ruoli.
Un ruolo è l'insieme dei permessi di un utente; un utente può evere più ruoli

## Permessi

I permessi sono delle entitò relative ad una risorsa (user, activity, ecc) ed ad una sua funzionalità
