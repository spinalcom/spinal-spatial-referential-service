import { S_TYPE } from "./Constant";

export  const config  = {
  batchSize : 50,
  contextName: "spatial",
  buildingName: "SEML",
  attrs: { // Attributs recherché dans les props du batiment
    room : { // Piece du batiment
      attrName: 'category',
      attrVal: 'Revit Pièces',
    },
    level: { // Etage du batiment
      attrName: 'category',
      attrVal: 'Revit Level'
    },
    floors: { // sol des rooms
      attrName: 'Stype',
      attrVal: 'Floor_finish'
    }
  },
  roomNiveau: 'Etage',
  props: { // Proprieté a recuperer pour chaque type d'objet
    room: ['area', 'volume', 'perimeter', 'local', 'etage',  'stype', 'roomid', 'number'],
    level: {
      'components': {
        type: 'Array',

      }
    },
    floors: ['roomid']
  }
}
