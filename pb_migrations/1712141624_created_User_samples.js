/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "ljzwumejhobe8ul",
    "created": "2024-04-03 10:53:44.238Z",
    "updated": "2024-04-03 10:53:44.238Z",
    "name": "User_samples",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "k6oygide",
        "name": "sample",
        "type": "file",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "mimeTypes": [
            "application/ogg",
            "audio/mpeg",
            "audio/wav",
            "audio/aiff",
            "audio/x-m4a"
          ],
          "thumbs": [],
          "maxSelect": 1,
          "maxSize": 5242880,
          "protected": false
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("ljzwumejhobe8ul");

  return dao.deleteCollection(collection);
})
