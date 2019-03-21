# Installation
First you need to install dependencies and build the project:
```
npm i
npm run build
```

# Usage
- download your Google Dialogflow agent as a .zip archive
- uncompress the .zip archive
- put the contents of the zip archive into the ``assets`` folder
- delete your ``Fallback Intent``
- run the script using the correct language (e.g. DE, EN)
```
node build/index --language DE
```
- find a ``cognigy-intents.json`` in your ``/assets`` folder
- upload these into a ``Cognigy.AI flow `` (within the Intent Editor)