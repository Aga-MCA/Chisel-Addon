//@ts-check
import { BlockTypes} from '@minecraft/server';
/**@typedef {Record<string,string|boolean|number>}States*/
/**@typedef {import('@minecraft/server').Block}Block*/

export class StateBlock {
	/**@param {string}id@param {States}states*/
	constructor(id, states) {
		this.id = id;
		this.states = states;
	}
}

/**@typedef {string|StateBlock}BlockListItem*/
/**@typedef {[string,States|undefined]}BlockData*/

export class BlockList {
	/**@param {BlockListItem}bli@returns {BlockData}*/
  static BlockListItemToData(bli) {
    return bli instanceof StateBlock ? [bli.id, bli.states] : [bli, undefined]
  }
	/**@param {BlockListItem[]}blocks@param {string|undefined}name*/
	constructor(blocks, name) {
		this.name = name;
		this.blocks = blocks;
	}
	/**@param {Block|BlockListItem}block*/
	includes(block) {
		return this.blocks.some(b => {
			if (typeof block == 'string') return block === b;
			if (block instanceof StateBlock)
				return b instanceof StateBlock
					? b.id === block.id && Object.entries(b.states).every(v => block.states[v[0]] === v[1])
					: b === block.id;
			return b instanceof StateBlock
				? b.id === block.typeId && Object.entries(b.states).every(v => block.permutation.getAllStates()[v[0]] === v[1])
				: b === block.typeId;
		});
	}
	/**@param {Block}block*/
	getNext(block) {
		let index = this.blocks.findIndex(b =>
			b instanceof StateBlock
				? b.id === block.typeId && Object.entries(b.states).every(v => block.permutation.getAllStates()[v[0]] === v[1])
				: b === block.typeId
		);
		if (index === -1) return null;
		if (index === this.blocks.length - 1) index = -1;
		index++;
		return BlockList.BlockListItemToData(this.blocks[index]);
	}
	/**@param {Block|BlockListItem}block*/
  getItem(block){
    const index = this.blocks.findIndex(b =>{
			if (typeof block == 'string') return block === b;
			if (block instanceof StateBlock)
				return b instanceof StateBlock
					? b.id === block.id && Object.entries(b.states).every(v => block.states[v[0]] === v[1])
					: b === block.id;
			return b instanceof StateBlock
				? b.id === block.typeId && Object.entries(b.states).every(v => block.permutation.getAllStates()[v[0]] === v[1])
				: b === block.typeId;
		});
		if (index === -1) return null;
    return this.blocks[index];
  }
	*[Symbol.iterator]() {
		for (const block of this.blocks) {
			const id = typeof block == 'string' ? block : block.id;
			if (BlockTypes.get(id)) yield id;
		}
	}
}
export class Manager {
	/**@param {BlockList[]}lists*/
	constructor(lists) {
		this.lists = lists;
	}
	/**@param {Block}block*/
	includes(block) {
		return this.lists.some(list => list.includes(block));
	}
	/**@param {Block}block*/
	getNext(block) {
		for (const list of this.lists) {
			const next = list.getNext(block);
			if (next) return next;
		}
		return null;
	}
	/**@param {Block}block*/
	getList(block) {
		return this.lists.find(l => l.includes(block));
	}
	/**@param {Block}block@param {string|StateBlock}other*/
	getItemInList(block, other) {
		const list = this.getList(block);
		if (!list) return false;
		return list.includes(other);
	}
	*[Symbol.iterator]() {
		for (const list of this.lists) {
			if (list.name) yield list;
		}
	}
}
