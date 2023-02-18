export async function seedPermissions(client) {
  const permissions = [
    // role
    {
      resource: 'role',
      action: 'create',
      ownership: null,
      description: 'Creazione ruolo',
    },
    {
      resource: 'role',
      action: 'delete',
      ownership: null,
      description: 'Cancellazione ruolo',
    },
    {
      resource: 'role',
      action: 'list',
      ownership: null,
      description: 'Lista ruoli',
    },
    {
      resource: 'role',
      action: 'add-permission',
      ownership: null,
      description: 'Aggiunta permesso al ruolo',
    },
    {
      resource: 'role',
      action: 'remove-permission',
      ownership: null,
      description: 'Rimozione permesso dal ruolo',
    },
    {
      resource: 'role',
      action: 'update',
      ownership: null,
      description: 'Aggiornamento ruolo',
    },
    {
      resource: 'role',
      action: 'read',
      ownership: null,
      description: 'Dettaglio ruolo',
    },
    {
      resource: 'role',
      action: 'user-assign',
      ownership: null,
      description: 'Assegnazione ruolo',
    },
    // user
    {
      resource: 'user',
      action: 'delete',
      ownership: null,
      description: 'Cancellazione utente',
    },
    {
      resource: 'user',
      action: 'list',
      ownership: null,
      description: 'Lista utenti',
    },
    {
      resource: 'user',
      action: 'read',
      ownership: null,
      description: 'Dettaglio utente',
    },
    {
      resource: 'user',
      action: 'update',
      ownership: null,
      description: 'Aggiornamento utente',
    },
    {
      resource: 'user',
      action: 'block',
      ownership: null,
      description: 'Blocco utente',
    },
    {
      resource: 'user',
      action: 'unblock',
      ownership: null,
      description: 'Sblocco utente',
    },
    // article
    {
      resource: 'article',
      action: 'create',
      ownership: null,
      description: 'Creazione articolo',
    },
    {
      resource: 'article',
      action: 'list',
      ownership: 'any',
      description: 'Lista articoli (tutti)',
    },
    {
      resource: 'article',
      action: 'list',
      ownership: 'own',
      description: 'Lista articoli (solo propri)',
    },
    {
      resource: 'article',
      action: 'delete',
      ownership: 'any',
      description: 'Cancellazione articolo (tutti)',
    },
    {
      resource: 'article',
      action: 'delete',
      ownership: 'own',
      description: 'Cancellazione articolo (solo propri)',
    },
    {
      resource: 'article',
      action: 'read',
      ownership: 'any',
      description: 'Dettaglio articolo (tutti)',
    },
    {
      resource: 'article',
      action: 'read',
      ownership: 'own',
      description: 'Dettaglio articolo (solo propri)',
    },
    {
      resource: 'article',
      action: 'update',
      ownership: 'any',
      description: 'Aggiornamento articolo (tutti)',
    },
    {
      resource: 'article',
      action: 'update',
      ownership: 'own',
      description: 'Aggiornamento articolo (solo propri)',
    },
    {
      resource: 'article',
      action: 'review',
      ownership: 'any',
      description: 'Review articolo (tutti)',
    },
    {
      resource: 'article',
      action: 'review',
      ownership: 'own',
      description: 'Review articolo (solo propri)',
    },
    {
      resource: 'article',
      action: 'rework',
      ownership: 'any',
      description: 'Rework articolo (tutti)',
    },
    {
      resource: 'article',
      action: 'rework',
      ownership: 'own',
      description: 'Rework articolo (solo propri)',
    },
    {
      resource: 'article',
      action: 'approve',
      ownership: 'any',
      description: 'Approvazione articolo (tutti)',
    },
    {
      resource: 'article',
      action: 'approve',
      ownership: 'own',
      description: 'Approvazione articolo (solo propri)',
    },
    {
      resource: 'article',
      action: 'publish',
      ownership: 'any',
      description: 'Pubblicazione articolo (tutti) ',
    },
    {
      resource: 'article',
      action: 'publish',
      ownership: 'own',
      description: 'Pubblicazione articolo (solo propri)',
    },
    {
      resource: 'article',
      action: 'archive',
      ownership: 'any',
      description: 'Archiviazione articolo (tutti)',
    },
    {
      resource: 'article',
      action: 'archive',
      ownership: 'own',
      description: 'Archiviazione articolo (solo propri)',
    },
    {
      resource: 'article',
      action: 'remove',
      ownership: 'any',
      description: 'Cancellazione logica articolo (tutti)',
    },
    {
      resource: 'article',
      action: 'remove',
      ownership: 'own',
      description: 'Cancellazione logica articolo (solo propri)',
    },
    // ACTIVITIES
    {
      resource: 'activity',
      action: 'create',
      ownership: null,
      description: 'Creazione attività',
    },
    {
      resource: 'activity',
      action: 'list',
      ownership: 'any',
      description: 'Lista attività (tutte)',
    },
    {
      resource: 'activity',
      action: 'list',
      ownership: 'own',
      description: 'Lista attività (solo proprie)',
    },
    {
      resource: 'activity',
      action: 'read',
      ownership: 'any',
      description: 'Dettaglio attività (tutte)',
    },
    {
      resource: 'activity',
      action: 'read',
      ownership: 'own',
      description: 'Dettaglio attività (solo proprie)',
    },
    {
      resource: 'activity',
      action: 'update',
      ownership: 'any',
      description: 'Aggiornamento attività (tutte)',
    },
    {
      resource: 'activity',
      action: 'update',
      ownership: 'own',
      description: 'Aggiornamento attività (solo proprie)',
    },
    {
      resource: 'activity',
      action: 'delete',
      ownership: 'any',
      description: 'Cancellazione attività (tutte)',
    },
    {
      resource: 'activity',
      action: 'delete',
      ownership: 'own',
      description: 'Cancellazione attività (solo proprie)',
    },
    {
      resource: 'activity',
      action: 'review',
      ownership: 'any',
      description: 'Review attività (tutte)',
    },
    {
      resource: 'activity',
      action: 'review',
      ownership: 'own',
      description: 'Review attività (solo proprie)',
    },
    {
      resource: 'activity',
      action: 'rework',
      ownership: 'any',
      description: 'Rework attività (tutte)',
    },
    {
      resource: 'activity',
      action: 'rework',
      ownership: 'own',
      description: 'Rework attività (solo proprie)',
    },
    {
      resource: 'activity',
      action: 'approve',
      ownership: 'any',
      description: 'Approve attività (tutte)',
    },
    {
      resource: 'activity',
      action: 'approve',
      ownership: 'own',
      description: 'Approve attività (solo proprie)',
    },
  ]

  for (const permission of permissions) {
    await client.permissions.save(permission)
  }
}
