# 📋 API Documentation - Commentaires des Feuilles Maîtresses

## 🎯 Vue d'ensemble

Cette API permet de gérer les commentaires individuels pour chaque feuille maîtresse générée lors d'un upload de fichier de balance. Chaque feuille maîtresse (clients, fournisseurs, etc.) peut avoir son propre commentaire.

## 🏗️ Structure des données

### Modèle GeneratedFile
```json
{
  "id": 5,
  "file_type": "feuille_maitresse",
  "group_name": "clients",
  "comment": "Commentaire pour la feuille clients",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Modèle BalanceUpload
```json
{
  "id": 1,
  "file": "/media/balances/file.xlsx",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "uploaded_at": "2024-01-15T10:30:00Z",
  "status": "success",
  "generated_files": [
    {
      "id": 5,
      "file_type": "feuille_maitresse",
      "group_name": "clients",
      "download_url": "/api/reports/download-generated/5/",
      "comment": "Commentaire pour la feuille clients",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## 🚀 Endpoints API

### 1. Ajouter/Mettre à jour un commentaire

**Endpoint:** `POST/PUT /api/reports/comment/{generated_file_id}/`

**Description:** Ajoute ou met à jour un commentaire pour une feuille maîtresse spécifique.

**Paramètres:**
- `generated_file_id` (int, requis): ID de la feuille maîtresse

**Body (JSON):**
```json
{
  "comment": "Votre commentaire ici (max 2000 caractères)"
}
```

**Réponses:**

#### ✅ Succès (200 OK)
```json
{
  "message": "Commentaire ajouté/mis à jour avec succès",
  "comment": "Votre commentaire ici",
  "generated_file_id": 5,
  "group_name": "clients",
  "file_type": "feuille_maitresse"
}
```

#### ❌ Erreur - Feuille maîtresse non trouvée (404 Not Found)
```json
{
  "error": "Feuille maîtresse non trouvée"
}
```

#### ❌ Erreur - Données invalides (400 Bad Request)
```json
{
  "comment": ["Ce champ ne peut pas être vide."]
}
```

**Exemples d'utilisation:**

```bash
# Ajouter un commentaire
curl -X POST http://localhost:8000/api/reports/comment/5/ \
  -H "Content-Type: application/json" \
  -d '{"comment": "Commentaire pour la feuille clients"}'

# Mettre à jour un commentaire
curl -X PUT http://localhost:8000/api/reports/comment/5/ \
  -H "Content-Type: application/json" \
  -d '{"comment": "Commentaire mis à jour"}'
```

### 2. Récupérer l'historique avec commentaires

**Endpoint:** `GET /api/reports/balance-history/`

**Description:** Récupère l'historique complet des uploads avec les commentaires de chaque feuille maîtresse.

**Réponse (200 OK):**
```json
{
  "history": [
    {
      "id": 1,
      "file": "/media/balances/file.xlsx",
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "uploaded_at": "2024-01-15T10:30:00Z",
      "status": "success",
      "error_message": null,
      "generated_files": [
        {
          "id": 5,
          "file_type": "feuille_maitresse",
          "group_name": "clients",
          "download_url": "/api/reports/download-generated/5/",
          "comment": "Commentaire pour la feuille clients",
          "created_at": "2024-01-15T10:30:00Z"
        },
        {
          "id": 6,
          "file_type": "feuille_maitresse",
          "group_name": "fournisseurs",
          "download_url": "/api/reports/download-generated/6/",
          "comment": "Commentaire pour la feuille fournisseurs",
          "created_at": "2024-01-15T10:30:00Z"
        },
        {
          "id": 7,
          "file_type": "TFT",
          "group_name": "",
          "download_url": "/api/reports/download-generated/7/",
          "comment": null,
          "created_at": "2024-01-15T10:30:00Z"
        }
      ],
      "tft_json": {...},
      "feuilles_maitresses_json": {...},
      "coherence": {...}
    }
  ]
}
```

**Exemple d'utilisation:**
```bash
curl -X GET http://localhost:8000/api/reports/balance-history/
```

### 3. Upload de fichier (avec commentaires dans la réponse)

**Endpoint:** `POST /api/reports/upload-balance/`

**Description:** Upload d'un fichier de balance qui génère les feuilles maîtresses avec leurs commentaires.

**Body (FormData):**
- `file`: Fichier Excel/CSV
- `start_date`: Date de début (YYYY-MM-DD)
- `end_date`: Date de fin (YYYY-MM-DD)

**Réponse (201 Created):**
```json
{
  "tft_json": {...},
  "feuilles_maitresses_json": {...},
  "coherence": {...},
  "history": {
    "id": 1,
    "file": "/media/balances/file.xlsx",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "uploaded_at": "2024-01-15T10:30:00Z",
    "status": "success",
    "generated_files": [
      {
        "id": 5,
        "file_type": "feuille_maitresse",
        "group_name": "clients",
        "download_url": "/api/reports/download-generated/5/",
        "comment": null,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

## 📝 Codes de statut HTTP

| Code | Description |
|------|-------------|
| 200 | Succès - Commentaire ajouté/mis à jour |
| 201 | Créé - Upload réussi |
| 400 | Requête invalide - Données de validation incorrectes |
| 404 | Non trouvé - Feuille maîtresse inexistante |
| 500 | Erreur serveur - Problème interne |

## 🔧 Validation des données

### Commentaire
- **Type:** String
- **Longueur maximale:** 2000 caractères
- **Obligatoire:** Non (peut être null ou vide)
- **Caractères autorisés:** Tous (UTF-8)

## 🎯 Cas d'usage typiques

### 1. Ajouter un commentaire à une feuille maîtresse
```javascript
const addComment = async (generatedFileId, comment) => {
  const response = await fetch(`/api/reports/comment/${generatedFileId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comment })
  });
  return await response.json();
};
```

### 2. Mettre à jour un commentaire existant
```javascript
const updateComment = async (generatedFileId, comment) => {
  const response = await fetch(`/api/reports/comment/${generatedFileId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comment })
  });
  return await response.json();
};
```

### 3. Récupérer l'historique avec commentaires
```javascript
const getHistory = async () => {
  const response = await fetch('/api/reports/balance-history/');
  const data = await response.json();
  return data.history;
};
```

### 4. Afficher les commentaires dans l'interface
```javascript
const displayComments = (upload) => {
  upload.generated_files.forEach(file => {
    if (file.file_type === 'feuille_maitresse') {
      console.log(`${file.group_name}: ${file.comment || 'Aucun commentaire'}`);
    }
  });
};
```

## 🚨 Gestion des erreurs

### Erreurs communes et solutions

1. **404 - Feuille maîtresse non trouvée**
   - Vérifiez que l'ID de la feuille maîtresse existe
   - Assurez-vous que la feuille maîtresse appartient à un upload valide

2. **400 - Données invalides**
   - Vérifiez que le commentaire ne dépasse pas 2000 caractères
   - Assurez-vous que le JSON est bien formé

3. **500 - Erreur serveur**
   - Contactez l'équipe backend pour résoudre le problème

## 🔐 Authentification

Actuellement, l'API ne nécessite pas d'authentification. Si vous souhaitez ajouter une authentification, contactez l'équipe backend.

## 📊 Exemple de flux complet

1. **Upload d'un fichier** → Génère plusieurs feuilles maîtresses
2. **Récupération de l'historique** → Obtient les IDs des feuilles maîtresses
3. **Ajout de commentaires** → Utilise les IDs pour commenter chaque feuille
4. **Affichage** → Montre les commentaires dans l'interface utilisateur

## 🆔 Identification des feuilles maîtresses

Chaque feuille maîtresse générée a :
- Un **ID unique** (`generated_file_id`)
- Un **type** (`feuille_maitresse`)
- Un **nom de groupe** (`clients`, `fournisseurs`, etc.)
- Un **commentaire** (optionnel)

Utilisez l'ID pour toutes les opérations de commentaire.

---

**Version:** 1.0  
**Dernière mise à jour:** Janvier 2024  
**Contact:** Équipe Backend
