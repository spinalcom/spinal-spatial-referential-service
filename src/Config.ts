/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
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

export const config = {
  batchSize: 50,
  contextName: 'spatial',
  buildingName: 'building',
  attrs: {
    // Attributs recherché dans les props du batiment
    room: {
      // Piece du batiment
      attrName: 'category',
      attrVal: 'Revit Pièces',
    },
    level: {
      // Etage du batiment
      attrName: 'category',
      attrVal: 'Revit Level',
    },
    floors: {
      // sol des rooms
      attrName: 'Stype',
      attrVal: 'Floor_finish',
    },
  },
  roomNiveau: 'Etage',
  props: {
    // Proprieté a recuperer pour chaque type d'objet
    room: [
      'area',
      'volume',
      'perimeter',
      'local',
      'etage',
      'stype',
      'roomid',
      'number',
    ],
    level: {
      components: {
        type: 'Array',
      },
    },
    floors: ['roomid'],
  },
};
