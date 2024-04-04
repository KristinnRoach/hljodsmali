/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ljzwumejhobe8ul")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "k6oygide",
    "name": "sample_file",
    "type": "file",
    "required": false,
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
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ljzwumejhobe8ul")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "k6oygide",
    "name": "sample_file",
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
  }))

  return dao.saveCollection(collection)
})
