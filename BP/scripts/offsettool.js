//@ts-check
import { Direction, EquipmentSlot, GameMode, system } from '@minecraft/server';
import { damage_item } from './functions.js';

/**
 * @typedef {Object}PartialEvent
 * @property {import("@minecraft/server").Vector3}[faceLocation]
 * @property {import("@minecraft/server").Block}block
 * @property {import("@minecraft/server").Direction}[blockFace]
 * @property {import("@minecraft/server").Player}player
 * @property {import("@minecraft/server").ItemStack}[itemStack]
 */
/**@readonly @enum {'west'|'east'|'up'|'down'|'north'|'south'}*/
export const BlockFace = /**@type {const}*/({
	west: 'west',
	east: 'east',
	up: 'up',
	down: 'down',
	north: 'north',
	south: 'south',
});

/**@type {Record<BlockFace,Partial<Record<Direction,number>>>}*/
const FACE_MAP = {
	east: { [Direction.North]: 1, [Direction.South]: 2, [Direction.Up]: 3, [Direction.Down]: 4 },
	west: { [Direction.North]: 1, [Direction.South]: 2, [Direction.Up]: 3, [Direction.Down]: 4 },

	up: { [Direction.North]: 1, [Direction.South]: 2, [Direction.East]: 3, [Direction.West]: 4 },
	down: { [Direction.North]: 1, [Direction.South]: 2, [Direction.East]: 3, [Direction.West]: 4 },

	north: { [Direction.Up]: 1, [Direction.Down]: 2, [Direction.East]: 3, [Direction.West]: 4 },
	south: { [Direction.Up]: 1, [Direction.Down]: 2, [Direction.East]: 3, [Direction.West]: 4 },
};

/**@param {PartialEvent}event*/
function gold_eye(event) {
  const direction = event.blockFace;
  if (!direction) return;

	const blockFace = /**@type {BlockFace}*/ (event.block.permutation.getState('minecraft:block_face'));
	if (!blockFace) return;

	const face = FACE_MAP[blockFace]?.[direction];
	if (!face) return;

	system.run(() => {
    const stateName = /**@type {'rotation'}*/(`face:${face}`);
    const current = /**@type {number}*/ (
      event.block.permutation.getState(stateName)
    );
    const next = current + 1 > 6 ? 1 : current + 1;
    event.block.setPermutation(
      event.block.permutation.withState(stateName, next)
    );
	});
}

/**@param {PartialEvent}event*/
export default function offset(event) {
	const { block, player, itemStack } = event;
	if (block.typeId === 'aga_chisel:gold_eye') gold_eye(event);
	if (!itemStack) return;
	system.run(() => {
		if (player.getGameMode() === GameMode.Creative) return;
		const equippement = player.getComponent('equippable');

		const newItem = damage_item(itemStack);
		equippement?.setEquipment(EquipmentSlot.Mainhand, newItem);
		if (!newItem) {
			player.playSound('random.break', {
				volume: 1,
				pitch: 1,
			});
		}
	});
}
