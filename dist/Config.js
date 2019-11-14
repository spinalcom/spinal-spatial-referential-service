"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = {
    batchSize: 50,
    contextName: "spatial",
    buildingName: "SEML",
    attrs: {
        room: {
            attrName: 'category',
            attrVal: 'Revit Pièces',
        },
        level: {
            attrName: 'category',
            attrVal: 'Revit Level'
        },
        floors: {
            attrName: 'Stype',
            attrVal: 'Floor_finish'
        }
    },
    roomNiveau: 'Etage',
    props: {
        room: ['area', 'volume', 'perimeter', 'local', 'etage', 'stype', 'roomid', 'number'],
        level: {
            'components': {
                type: 'Array',
            }
        },
        floors: ['roomid']
    }
};
//# sourceMappingURL=Config.js.map