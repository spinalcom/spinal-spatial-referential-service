"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// export interface ArchiSelectUser {
//   key: RegExp;
//   value: RegExp;
//   isCat?: boolean;
// }
// export interface ConfigGetArchiUser {
//   basic: Basic;
//   levelSelect: ArchiSelectUser[];
//   roomSelect: ArchiSelectUser[];
//   structureSelect: ArchiSelectUser[];
//   floorSelect?: ArchiSelectUser[];
// }
// const testCfg = {
//   basic: { "addLevel": false, "buildingName": "64646", "selectedModel": "DEI (1).rvt" },
//   levelSelect: [{ "key": /^Category$/, "value": /^Revit Level$/, "isCat": true }],
//   roomSelect: [{ "key": /^Category$/, "value": /^Revit Pièces$/, "isCat": true }],
//   structureSelect: [
//     { "key": /^Category$/, "value": /^Revit Murs$/, "isCat": true },
//     { "key": /^Category$/, "value": /^Revit Portes$/, "isCat": true },
//     { "key": /^Category$/, "value": /^Revit Sols$/, "isCat": true },
//     { "key": /^Category$/, "value": /^Revit Garde-corps$/, "isCat": true },
//     { "key": /^Category$/, "value": /^Revit Fenêtres$/, "isCat": true }
//   ]
// }
// interface AttrItem { id: number, attrDef: any, d: ArchiSelectUser }
function getArchiSelectStr(archiSelect) {
    if (!archiSelect)
        return '[]';
    const data = ['['];
    for (const d of archiSelect) {
        let isCatStr = '';
        if (d.isCat === true)
            isCatStr = `, isCat: true`;
        const str = `{ key: ${d.key.toString()}, value: ${d.value.toString()}${isCatStr}},`;
        data.push(str);
    }
    data.push(']');
    return data.join('');
}
function createFctGetArchi(config) {
    const levelStr = getArchiSelectStr(config.levelSelect);
    const roomStr = getArchiSelectStr(config.roomSelect);
    const structureStr = getArchiSelectStr(config.structureSelect);
    const floorStr = getArchiSelectStr(config.floorSelect);
    let FLOOR_ROOM_NUMBER_ATTR_NAME = 'Number';
    let FLOOR_ROOM_NAME_ATTR_NAME = '';
    let FLOOR_LEVEL_NAME_ATTR_NAME = '';
    if (config.floorRoomNbr)
        FLOOR_ROOM_NUMBER_ATTR_NAME = config.floorRoomNbr; // 'Number
    if (config.floorRoomName)
        FLOOR_ROOM_NAME_ATTR_NAME = config.floorRoomName; // 'Local'
    if (config.floorLevelName)
        FLOOR_LEVEL_NAME_ATTR_NAME = config.floorLevelName; // 'Etage'
    const propsToGet = [
        'name',
        'elevation',
        'area',
        'volume',
        'perimeter',
        'stype',
        'roomid',
        'number',
    ];
    if (FLOOR_ROOM_NUMBER_ATTR_NAME)
        propsToGet.push(FLOOR_ROOM_NUMBER_ATTR_NAME.toLowerCase());
    if (FLOOR_ROOM_NAME_ATTR_NAME)
        propsToGet.push(FLOOR_ROOM_NAME_ATTR_NAME.toLowerCase());
    if (FLOOR_LEVEL_NAME_ATTR_NAME)
        propsToGet.push(FLOOR_LEVEL_NAME_ATTR_NAME.toLowerCase());
    let useFloor = false;
    if (Array.isArray(config.floorSelect) && config.floorSelect.length > 0) {
        useFloor = true;
    }
    const fct = `function userFunction(pdb) {
    // TEST
    // let useFloor = false;
    // const levelSelect = testCfg.levelSelect;
    // const roomSelect = testCfg.roomSelect;
    // const structureSelect = testCfg.structureSelect;
    // const propsNames = propsToGet
    // END TEST

    let useFloor = ${useFloor};
    const levelSelect = ${levelStr};
    const roomSelect = ${roomStr};
    const structureSelect = ${structureStr};
    const floorSelect = ${floorStr};
    const propsNames = ${JSON.stringify(propsToGet)};

    const FLOOR_ROOM_NUMBER_ATTR_NAME = "${FLOOR_ROOM_NUMBER_ATTR_NAME}";
    const FLOOR_ROOM_NAME_ATTR_NAME = "${FLOOR_ROOM_NAME_ATTR_NAME}";
    const FLOOR_LEVEL_NAME_ATTR_NAME = "${FLOOR_LEVEL_NAME_ATTR_NAME}";
    const attrLevel = [];
    const attrRoom = [];
    const attrStructure = [];
    const attrFloor = [];
    const props = [];
    function round(x, digits = 2) {
      return parseFloat(x.toFixed(digits))
    }

    function pushSelect(data, attrDef, idx, res) {
      for (const d of data) {
        if (
          (attrDef.displayName && d.key.test(attrDef.displayName)) ||
          (!attrDef.displayName && d.key.test(attrDef.name)) ||
          (d.isCat === true && attrDef.category === '__category__' && d.key.test(attrDef.name))
        ) {
          const item = res.find((item) => item.id === idx);
          if (item) item.d.push(d)
          else {
            res.push({
              id: idx,
              attrDef, d: [d]
            });
          }
        }
      }
    }

    function attrIsValid(attrs, attrId, value) {
      const attr = attrs.find((item) => item.id === attrId);
      if (!attr) return null;
      for (const d of attr.d) {
        if (d.value.test(value)) {
          return attr;
        }
      }
    }

    pdb.enumAttributes(function (idx, attrDef) {
      if (propsNames.includes(attrDef.name.toLowerCase()) ||
        (attrDef.name === 'Level' && attrDef.category === '__internalref__')) {
        props.push({ attrId: idx, attrDef })
      }
      pushSelect(levelSelect, attrDef, idx, attrLevel)
      pushSelect(roomSelect, attrDef, idx, attrRoom)
      pushSelect(structureSelect, attrDef, idx, attrStructure)
      pushSelect(floorSelect, attrDef, idx, attrFloor)
    });
    let dbIds = { floors: [], rooms: [], levels: [], structures: [] };
    const idExternal = {};

    let externalIdMapping = pdb.getExternalIdMapping();
    for (let key in externalIdMapping) {
      if (externalIdMapping.hasOwnProperty(key)) {
        idExternal[externalIdMapping[key]] = key;
      }
    }
    pdb.enumObjects(function (dbId) {
      const properties = [];
      let array = undefined;
      pdb.enumObjectProperties(dbId, function (attrId, valId) {
        let value = pdb.getAttrValue(attrId, valId);
        if (typeof value === "number") value = round(value);
        let prop = props.find(prop => prop.attrId === attrId)

        const levelProps = attrIsValid(attrLevel, attrId, value);
        const roomProps = attrIsValid(attrRoom, attrId, value);
        const structureProps = attrIsValid(attrStructure, attrId, value);
        const floorProps = attrIsValid(attrFloor, attrId, value);
        if (levelProps) {
          prop = levelProps;
          array = dbIds.levels;
        }
        if (roomProps) {
          prop = roomProps;
          array = dbIds.rooms;
        }
        if (floorProps) {
          prop = floorProps;
          array = dbIds.floors;
        }
        if (structureProps) {
          prop = structureProps;
          array = dbIds.structures;
        }

        if (prop) {
          const attrNameLowerCase = prop.attrDef.name.toLowerCase()
          let found =  false;
          for (const propertie of properties) {
            if (propertie.name.toLowerCase() === attrNameLowerCase && propertie.category !== '__internalref__') {
              if (value && propertie.value !== value) {
                propertie.oldValue = propertie.value
                propertie.value = value
              }
              found = true
              break;
            }
          }
          if (!found) {
            const res = { name: attrNameLowerCase, value }
            if (prop.attrDef.dataTypeContext)
              Object.assign(res, { dataTypeContext: prop.attrDef.dataTypeContext });
            if (attrNameLowerCase === 'level' && prop.attrDef.category === '__internalref__')
              Object.assign(res, { category: prop.attrDef.category });
            properties.push(res);
          }
        }


      });
      if (Array.isArray(array))
        array.push({ dbId, properties, externalId: idExternal[dbId] })

    });
    if (useFloor === false) dbIds.floors = dbIds.rooms
    function createArchitectureModel(object) {
      const archiModel = {};

      function getAttrValue(obj, attrName, attrCat) {
        const props = obj.properties;
        const attrNameLowerCase = attrName.toLowerCase()
        for (let i = 0; i < props.length; i++) {
          if (props[i].name.toLowerCase() === attrNameLowerCase) {
            if (attrCat && props[i].category !== attrCat) {
              continue;
            }
            return props[i].value
          }
        }
      }
      function setAttrValue(obj, attrName, value) {
        const props = obj.properties;
        const attrNameLowerCase = attrName.toLowerCase()
        for (let i = 0; i < props.length; i++) {
          if (props[i].name.toLowerCase() === attrNameLowerCase) {
            if (props[i].value === value) return;
            props[i].oldValue = props[i].value
            props[i].value = value
            return;
          }
        }
      }

      function getLevelByDbId(dbId) {
        for (const level of object.levels) {
          if (level.dbId === dbId) {
            return level
          }
        }
      }

      function findFloor(room, data) {
        const leveldbId = getAttrValue(room, "level", '__internalref__');
        const roomNumber = getAttrValue(room, "number").toString()
        const res = [];

        for (const floor of data.floors) {
          const floorRoomId = getAttrValue(floor, "roomid");
          const levelItemdbId = getAttrValue(floor, "level", '__internalref__');
          const floorRoomNumber = getAttrValue(floor, FLOOR_ROOM_NUMBER_ATTR_NAME)
          if (floorRoomId === room.externalId ||
            (leveldbId === levelItemdbId &&
            floorRoomNumber !== undefined &&
            roomNumber == floorRoomNumber.toString())
          ) {
            if (FLOOR_ROOM_NAME_ATTR_NAME) {
              const floorRoomName = getAttrValue(floor, FLOOR_ROOM_NAME_ATTR_NAME)
              if (floorRoomName)
                setAttrValue(room, 'name', floorRoomName)
            }
            if (FLOOR_LEVEL_NAME_ATTR_NAME) {
              const floorName = getAttrValue(floor, FLOOR_LEVEL_NAME_ATTR_NAME)
              if (floorName)
                setAttrValue(getLevelByDbId(leveldbId), 'name', floorName)
            }
            res.push(floor);
          }
        }
        return res;
      }


      for (let i = 0; i < object.levels.length; i++) {
        const obj = object.levels[i];
        archiModel[obj.dbId] = { properties: obj, children: {}, structures: {} }
      }
      for (let i = 0; i < object.rooms.length; i++) {
        const obj = object.rooms[i];
        const lvl = getAttrValue(obj, 'level', '__internalref__'); // check here;
        if (lvl) {
          archiModel[lvl].children[obj.externalId] = {
            properties: obj,
            children: findFloor(obj, object)
          }
        }
      }
      for (let i = 0; i < object.structures.length; i++) {
        const obj = object.structures[i];
        const lvl = getAttrValue(obj, 'level', '__internalref__');
        if (archiModel[lvl]) {
          archiModel[lvl].structures[obj.externalId] = {
            properties: obj,
          }
        }
      }
      return archiModel;
    }
    console.log("dbIds =>", dbIds);
    return createArchitectureModel(dbIds)
  }`;
    return fct;
}
exports.default = createFctGetArchi;
// (<any>window).testCreateFctGetArchi = async function () {
//   const cfg = {
//     "configName": "default",
//     "basic": { "addLevel": false, "buildingName": "Parallèle", "selectedModel": "enedis.rvt" },
//     "levelSelect": [{ "key": "/^Category$/", "value": "/^Revit Level$/", "isCat": true }],
//     "roomSelect": [{ "key": "/^Category$/", "value": "/^Revit Pièces$/", "isCat": true }],
//     "structureSelect": [
//       { "key": "/^Category$/", "value": "/^Revit Murs$/", "isCat": true },
//       { "key": "/^Category$/", "value": "/^Revit Sols$/", "isCat": true },
//       { "key": "/^Category$/", "value": "/^Revit Portes$/", "isCat": true },
//       { "key": "/^Category$/", "value": "/^Revit Fenêtres$/", "isCat": true }],
//     "floorSelect": [{ "key": "/^SCtype$/", "value": "/^Floor_finish$/" }],
//     "floorRoomNbr": "Number"
//   }
//   const fct = createFctGetArchi(cfg)
//   const modelArchi = await (<any>window).NOP_VIEWER.model.getPropertyDb().executeUserFunction(fct);
//   console.log(modelArchi);
// }
// (<any>window).test = async function () {
//   const cfg = {
//     "configName": "default",
//     "contextName": "spatial",
//     "contextId": "SpinalContext-538f2dd5-71d1-4a9a-e260-5e18de281e49-17163c0c1d0",
//     "basic": { "addLevel": false, "buildingName": "azerty", "selectedModel": "DEI (1).rvt" },
//     "levelSelect": [{ "key": "/^Category$/", "value": "/^Revit Level$/", "isCat": true }],
//     "roomSelect": [{ "key": "/^Category$/", "value": "/^Revit Pièces$/", "isCat": true }],
//     "structureSelect": [{ "key": "/^Category$/", "value": "/^Revit Murs$/", "isCat": true },
//     { "key": "/^Category$/", "value": "/^Revit Portes$/", "isCat": true },
//     { "key": "/^Category$/", "value": "/^Revit Sols$/", "isCat": true },
//     { "key": "/^Category$/", "value": "/^Revit Garde-corps$/", "isCat": true },
//     { "key": "/^Category$/", "value": "/^Revit Fenêtres$/", "isCat": true }],
//     "floorRoomNbr": "Number",
//   }
//   const fct = createFctGetArchi(cfg)
//   function userFunction(pdb) {
//     // TEST
//     // let useFloor = false;
//     // const levelSelect = testCfg.levelSelect;
//     // const roomSelect = testCfg.roomSelect;
//     // const structureSelect = testCfg.structureSelect;
//     // const propsNames = propsToGet
//     // END TEST
//     let useFloor = false;
//     const levelSelect = [{ key: /^Category$/, value: /^Revit Level$/, isCat: true },];
//     const roomSelect = [{ key: /^Category$/, value: /^Revit Pièces$/, isCat: true },];
//     const structureSelect = [{ key: /^Category$/, value: /^Revit Murs$/, isCat: true }, { key: /^Category$/, value: /^Revit Portes$/, isCat: true }, { key: /^Category$/, value: /^Revit Sols$/, isCat: true }, { key: /^Category$/, value: /^Revit Garde-corps$/, isCat: true }, { key: /^Category$/, value: /^Revit Fenêtres$/, isCat: true },];
//     const floorSelect = [];
//     const propsNames = ["name", "elevation", "area", "volume", "perimeter", "stype", "roomid", "number", "Number"];
//     const FLOOR_ROOM_NUMBER_ATTR_NAME = "Number";
//     const FLOOR_ROOM_NAME_ATTR_NAME = "";
//     const FLOOR_LEVEL_NAME_ATTR_NAME = "";
//     const attrLevel = [];
//     const attrRoom = [];
//     const attrStructure = [];
//     const attrFloor = [];
//     const props = [];
//     function round(x, digits = 2) {
//       return parseFloat(x.toFixed(digits))
//     }
//     function pushSelect(data, attrDef, idx, res) {
//       for (const d of data) {
//         if (
//           d.key.test(attrDef.displayName) ||
//           (d.isCat === true && attrDef.category === '__category__' && d.key.test(attrDef.name))
//         ) {
//           const item = res.find((item) => item.id === idx);
//           if (item) item.d.push(d)
//           else {
//             res.push({
//               id: idx,
//               attrDef, d: [d]
//             });
//           }
//         }
//       }
//     }
//     function attrIsValid(attrs, attrId, value) {
//       const attr = attrs.find((item) => item.id === attrId);
//       if (!attr) return null;
//       for (const d of attr.d) {
//         if (d.value.test(value)) {
//           return attr;
//         }
//       }
//     }
//     pdb.enumAttributes(function (idx, attrDef) {
//       if (propsNames.includes(attrDef.name.toLowerCase()) ||
//         (attrDef.name === 'Level' && attrDef.category === '__internalref__')) {
//         props.push({ attrId: idx, attrDef })
//       }
//       pushSelect(levelSelect, attrDef, idx, attrLevel)
//       pushSelect(roomSelect, attrDef, idx, attrRoom)
//       pushSelect(structureSelect, attrDef, idx, attrStructure)
//       pushSelect(floorSelect, attrDef, idx, attrFloor)
//     });
//     let dbIds = { floors: [], rooms: [], levels: [], structures: [] };
//     const idExternal = {};
//     let externalIdMapping = pdb.getExternalIdMapping();
//     for (let key in externalIdMapping) {
//       if (externalIdMapping.hasOwnProperty(key)) {
//         idExternal[externalIdMapping[key]] = key;
//       }
//     }
//     pdb.enumObjects(function (dbId) {
//       const properties = [];
//       let array = undefined;
//       pdb.enumObjectProperties(dbId, function (attrId, valId) {
//         let value = pdb.getAttrValue(attrId, valId);
//         if (typeof value === "number") value = round(value);
//         let prop = props.find(prop => prop.attrId === attrId)
//         const levelProps = attrIsValid(attrLevel, attrId, value);
//         const roomProps = attrIsValid(attrRoom, attrId, value);
//         const structureProps = attrIsValid(attrStructure, attrId, value);
//         const floorProps = attrIsValid(attrFloor, attrId, value);
//         if (levelProps) {
//           prop = levelProps;
//           array = dbIds.levels;
//         }
//         if (roomProps) {
//           prop = roomProps;
//           array = dbIds.rooms;
//         }
//         if (floorProps) {
//           prop = floorProps;
//           array = dbIds.floors;
//         }
//         if (structureProps) {
//           prop = structureProps;
//           array = dbIds.structures;
//         }
//         if (prop) {
//           const attrNameLowerCase = prop.attrDef.name.toLowerCase()
//           let found = false;
//           for (const propertie of properties) {
//             if (propertie.name.toLowerCase() === attrNameLowerCase && propertie.category !== '__internalref__') {
//               if (propertie.value !== value) {
//                 propertie.oldValue = propertie.value
//                 propertie.value = value
//               }
//               found = true
//               break;
//             }
//           }
//           if (!found) {
//             const res = { name: attrNameLowerCase, value }
//             if (prop.attrDef.dataTypeContext)
//               Object.assign(res, { dataTypeContext: prop.attrDef.dataTypeContext });
//             if (attrNameLowerCase === 'level' && prop.attrDef.category === '__internalref__')
//               Object.assign(res, { category: prop.attrDef.category });
//             properties.push(res);
//           }
//         }
//       });
//       if (Array.isArray(array))
//         array.push({ dbId, properties, externalId: idExternal[dbId] })
//     });
//     if (useFloor === false) dbIds.floors = dbIds.rooms
//     function createArchitectureModel(object) {
//       const archiModel = {};
//       function getAttrValue(obj, attrName, attrCat?) {
//         const props = obj.properties;
//         const attrNameLowerCase = attrName.toLowerCase()
//         for (let i = 0; i < props.length; i++) {
//           if (props[i].name.toLowerCase() === attrNameLowerCase) {
//             if (attrCat && props[i].category !== attrCat) {
//               continue;
//             }
//             return props[i].value
//           }
//         }
//       }
//       function setAttrValue(obj, attrName, value) {
//         const props = obj.properties;
//         const attrNameLowerCase = attrName.toLowerCase()
//         for (let i = 0; i < props.length; i++) {
//           if (props[i].name.toLowerCase() === attrNameLowerCase) {
//             if (props[i].value === value) return;
//             props[i].oldValue = props[i].value
//             props[i].value = value
//             return;
//           }
//         }
//       }
//       function getLevelByDbId(dbId) {
//         for (const level of object.levels) {
//           if (level.dbId === dbId) {
//             return level
//           }
//         }
//       }
//       function findFloor(room, data) {
//         const leveldbId = getAttrValue(room, "level", '__internalref__');
//         const roomNumber = getAttrValue(room, "number").toString()
//         const res = [];
//         for (const floor of data.floors) {
//           const levelItemdbId = getAttrValue(floor, "level", '__internalref__');
//           const floorRoomNumber = getAttrValue(floor, FLOOR_ROOM_NUMBER_ATTR_NAME)
//           if (
//             leveldbId === levelItemdbId &&
//             floorRoomNumber !== undefined &&
//             roomNumber == floorRoomNumber.toString()
//           ) {
//             if (FLOOR_ROOM_NAME_ATTR_NAME) {
//               const floorRoomName = getAttrValue(floor, FLOOR_ROOM_NAME_ATTR_NAME)
//               if (floorRoomName)
//                 setAttrValue(room, 'name', floorRoomName)
//             }
//             if (FLOOR_LEVEL_NAME_ATTR_NAME) {
//               const floorName = getAttrValue(floor, FLOOR_LEVEL_NAME_ATTR_NAME)
//               if (floorName)
//                 setAttrValue(getLevelByDbId(leveldbId), 'name', floorName)
//             }
//             res.push(floor);
//           }
//         }
//         return res;
//       }
//       for (let i = 0; i < object.levels.length; i++) {
//         const obj = object.levels[i];
//         archiModel[obj.dbId] = { properties: obj, children: {}, structures: {} }
//       }
//       for (let i = 0; i < object.rooms.length; i++) {
//         const obj = object.rooms[i];
//         const lvl = getAttrValue(obj, 'level', '__internalref__'); // check here;
//         if (lvl) {
//           archiModel[lvl].children[obj.externalId] = {
//             properties: obj,
//             children: findFloor(obj, object)
//           }
//         }
//       }
//       for (let i = 0; i < object.structures.length; i++) {
//         const obj = object.structures[i];
//         const lvl = getAttrValue(obj, 'level', '__internalref__');
//         if (archiModel[lvl]) {
//           archiModel[lvl].structures[obj.externalId] = {
//             properties: obj,
//           }
//         }
//       }
//       return archiModel;
//     }
//     console.log("dbIds =>", dbIds);
//     return dbIds
//     // return createArchitectureModel(dbIds)
//   }
//   const modelArchi = await (<any>window).NOP_VIEWER.model.getPropertyDb().executeUserFunction(fct);
//   console.log(modelArchi);
// }
//# sourceMappingURL=createFctGetArchi.js.map