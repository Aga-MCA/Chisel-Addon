import { ItemComponentTypes } from '@minecraft/server';
/**@param {import('@minecraft/server').ItemStack}item*/
export function damage_item(item) {
	const durability = item.getComponent(ItemComponentTypes.Durability);
	const unbreaking = item.getComponent(ItemComponentTypes.Enchantable)?.getEnchantment('unbreaking')?.level || 0;
	if (durability) {
		if (durability.damage >= durability.maxDurability) {
			return;
		}

		durability.damage += Number(1 / (unbreaking + 1) >= Math.random());
	}
	return item;
}
