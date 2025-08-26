/*
 * Copyright 2025 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

export interface ArchiSelect {
  key: string;
  value: string;
  isCat?: boolean;
}

export interface IFloorOnlyItemProp {
  name: string;
  value: string | number;
  category?: string;
  dataTypeContext?: string;
}
export interface IFloorOnlyItem {
  dbId: number;
  externalId: string;
  properties: IFloorOnlyItemProp[];
  children?: IFloorOnlyItem[];
}

export interface IFloorOnlyData {
  levels: IFloorOnlyItem[];
  structures: IFloorOnlyItem[];
}

function getArchiSelectStr(archiSelect: ArchiSelect[]) {
  if (!archiSelect) return '[]';
  const data = ['['];
  for (const d of archiSelect) {
    let isCatStr = '';
    if (d.isCat === true) isCatStr = `, isCat: true`;
    const str = `{ key: ${d.key.toString()}, value: ${d.value.toString()}${isCatStr}},`;
    data.push(str);
  }
  data.push(']');
  return data.join('');
}

export function getArchiFloorOnly(
  model: Autodesk.Viewing.Model,
  levelSelect: ArchiSelect[],
  structureSelect: ArchiSelect[]
): Promise<IFloorOnlyData> {
  const levelStr = getArchiSelectStr(levelSelect);
  const structureStr = getArchiSelectStr(structureSelect);

  const propsToGet = [
    'name',
    'elevation',
    'area',
    'volume',
    'perimeter',
    'stype',
  ];

  const fct = `function userFunction(pdb) {
    // TEST
    // const levelSelect = levelStr;
    // const structureSelect = structureStr;
    // const propsNames = propsToGet;
    // END TEST

    const levelSelect = ${levelStr};
    const structureSelect = ${structureStr};
    const propsNames = ${JSON.stringify(propsToGet)};

    const attrLevel = [];
    const attrStructure = [];
    const props = [];

    function round(x, digits = 2) {
      return parseFloat(x.toFixed(digits));
    }

    function pushSelect(data, attrDef, idx, res) {
      for (const d of data) {
        if (
          (attrDef.displayName && d.key.test(attrDef.displayName)) ||
          (!attrDef.displayName && d.key.test(attrDef.name)) ||
          (d.isCat === true &&
            attrDef.category === '__category__' &&
            d.key.test(attrDef.name))
        ) {
          const item = res.find((item) => item.id === idx);
          if (item) item.d.push(d);
          else {
            res.push({
              id: idx,
              attrDef,
              d: [d],
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
      if (
        propsNames.includes(attrDef.name.toLowerCase()) ||
        (attrDef.name.toLowerCase() === 'level' &&
          attrDef.category === '__internalref__')
      ) {
        props.push({ attrId: idx, attrDef });
      }
      pushSelect(levelSelect, attrDef, idx, attrLevel);
      pushSelect(structureSelect, attrDef, idx, attrStructure);
    });
    const dbIds = { levels: [], structures: [] };
    const idExternal = {};

    const externalIdMapping = pdb.getExternalIdMapping();
    for (const key in externalIdMapping) {
      if (Object.prototype.hasOwnProperty.call(externalIdMapping, key)) {
        idExternal[externalIdMapping[key]] = key;
      }
    }
    pdb.enumObjects(function (dbId) {
      const properties = [];
      let array = undefined;
      pdb.enumObjectProperties(dbId, function (attrId, valId) {
        let value = pdb.getAttrValue(attrId, valId);
        if (typeof value === 'number') value = round(value);
        let prop = props.find((prop) => prop.attrId === attrId);

        const levelProps = attrIsValid(attrLevel, attrId, value);
        const structureProps = attrIsValid(attrStructure, attrId, value);
        if (levelProps) {
          prop = levelProps;
          array = dbIds.levels;
        }
        if (structureProps) {
          prop = structureProps;
          array = dbIds.structures;
        }

        if (prop) {
          const attrNameLowerCase = prop.attrDef.name.toLowerCase();
          let found = false;
          for (const propertie of properties) {
            if (
              propertie.name.toLowerCase() === attrNameLowerCase &&
              propertie.category !== '__internalref__'
            ) {
              if (value && propertie.value !== value) {
                propertie.oldValue = propertie.value;
                propertie.value = value;
              }
              found = true;
              break;
            }
          }
          if (!found) {
            const res = { name: attrNameLowerCase, value };
            if (prop.attrDef.dataTypeContext)
              Object.assign(res, {
                dataTypeContext: prop.attrDef.dataTypeContext,
              });
            if (
              attrNameLowerCase === 'level' &&
              prop.attrDef.category === '__internalref__'
            )
              Object.assign(res, { category: prop.attrDef.category });
            properties.push(res);
          }
        }
      });
      if (Array.isArray(array))
        array.push({ dbId, properties, externalId: idExternal[dbId] });
    });
    console.log('dbIds =>', dbIds);
    return dbIds;
  }`;
  return model.getPropertyDb().executeUserFunction(<any>fct);
}
