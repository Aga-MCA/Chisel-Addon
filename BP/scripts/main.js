//@ts-check
import { system, EquipmentSlot, world } from '@minecraft/server';
import { ModalFormData } from "@minecraft/server-ui";

import chisel, { CHISEL_BLOCKS } from "./chisel.js";
import offset from "./offsettool.js";

/**@param {import('@minecraft/server').PlayerBreakBlockBeforeEvent}event@returns {import('./offsettool.js').PartialEvent}*/
function PlayerBreakBlockBeforeEvent_to_PartialEvent(
  event,
) {
  const { block, player } = event;
  const itemStack = event.itemStack;
  const extraData = player.getBlockFromViewDirection();
  if (!extraData) return { block, player, itemStack };
  const is_block_x = extraData.block.x === block.x;
  const is_block_y = extraData.block.y === block.y;
  const is_block_z = extraData.block.z === block.z;
  const is_block = is_block_x && is_block_y && is_block_z;
  if (!is_block) return { block, player, itemStack };
  const { faceLocation, face: blockFace } = extraData;
  return { block, blockFace, faceLocation, player, itemStack };
}

/**@param {import('./offsettool.js').PartialEvent}event*/
function isChanged(event) {
  const { block, itemStack, player } = event;
  if (!itemStack) return false;
  const is_offsetItem = itemStack?.getTags().includes("addon:offset");
  const is_chiselItem = itemStack?.getTags().includes("addon:chisel");

  if (player.timeout) return is_chiselItem || is_offsetItem;
  player.timeout = true;
  system.runTimeout(() => {
    player.timeout = false;
  }, 5);

  if (is_offsetItem && event.faceLocation && event.blockFace) offset(event);
  if (is_chiselItem) chisel(block, itemStack, player);
  return is_chiselItem || is_offsetItem;
}

world.beforeEvents.playerBreakBlock.subscribe((event) => {
  event.cancel = isChanged(PlayerBreakBlockBeforeEvent_to_PartialEvent(event));
});

world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  if (event.player.isSneaking && !event.isFirstEvent) return;
  event.cancel = isChanged(event);
});
const CHISEL_LORE = "§5+Chisel Data§r";
/**@param {import('@minecraft/server').ItemComponentUseEvent}event*/
function openUi(event) {
  const CHISEL_SELECTION = new ModalFormData().title({
    translate: "chisel.ui",
  }).toggle({ translate: "chisel.ui.active-data" }, { defaultValue: true });

  const NEVER = "gui.none";

  for (const list of CHISEL_BLOCKS) {
    CHISEL_SELECTION.dropdown(
      {
        translate: list.name
      },
      [NEVER, ...list].map((s) => ({
        translate: s == NEVER ? s : `tile.${s.replace("minecraft:", "")}.name`,
      })),
    );
  }
  CHISEL_SELECTION.show(event.source).then((formData) => {
    if (formData.canceled || !formData.formValues || !event.itemStack) return;
    const active = formData.formValues[0];

    const lists = [...CHISEL_BLOCKS];
    if (active) {
      const data = [];
      for (let i = 0; i < lists.length; i++) {
        const item = [...lists[i]][/**@type {number}*/(formData.formValues[i + 1]) - 1];
        data.push(item);
        event.itemStack.setDynamicProperty(
          "aga_chisel:data",
          JSON.stringify(data),
        );
        event.itemStack.setLore([
          ...event.itemStack.getLore().filter((l) => l != CHISEL_LORE),
          CHISEL_LORE,
        ]);
      }
    } else {
      event.itemStack.setDynamicProperty("aga_chisel:data");
      event.itemStack.setLore(
        event.itemStack.getLore().filter((l) => l != CHISEL_LORE),
      );
    }
    event.source.getComponent("equippable")?.setEquipment(
      EquipmentSlot.Mainhand,
      event.itemStack,
    );
  });
}
/**@typedef {import('@minecraft/server').ItemCustomComponent}ItemCustomComponent*/
/**@implements {ItemCustomComponent}*/
export class ItemChiselComponent {
	/**@param {import("@minecraft/server").ItemComponentUseEvent}event@param {import("@minecraft/server").CustomComponentParameters} component*/
  onUse(
    event,
    component,
  ) {
    const params = /**@type {{with_ui:boolean}}*/ (component.params);
    if (!(event.source.isSneaking && params.with_ui)) return;
    openUi(event);
  }
}


system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => itemComponentRegistry.registerCustomComponent("aga_chisel:chisel", new ItemChiselComponent()));