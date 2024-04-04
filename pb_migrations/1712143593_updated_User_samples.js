/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ljzwumejhobe8ul")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tlvfsxg8",
    "name": "name",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 1,
      "max": 50,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ljzwumejhobe8ul")

  // remove
  collection.schema.removeField("tlvfsxg8")

  return dao.saveCollection(collection)
})
