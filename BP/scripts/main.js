import { world } from '@minecraft/server';

const ValidBlocks = ['aga_chisel:test_1', 'aga_chisel:test_2'];
const ChiselItems = ['aga_chisel:chisel_iron'];
const OFFSETTOOL = 'aga_chisel:offsettool';

world.beforeEvents.playerBreakBlock.subscribe(event => {
  const { block, player, itemStack } = event;
  const is_chiselItem = itemStack?.typeId == OFFSETTOOL || ChiselItems.includes(itemStack?.typeId);
  if (!is_chiselItem) return;
  if (!ValidBlocks.includes(block.typeId)) return;

  if (
    block.typeId === 'aga_chisel:test_1' &&
    ChiselItems.includes(itemStack.typeId)
  )
    player.runCommandAsync(
      `setblock ${block.x} ${block.y} ${block.z} aga_chisel:test_2`
    );
  if (block.typeId === 'aga_chisel:test_2') {
    if (ChiselItems.includes(itemStack.typeId))
      player.runCommandAsync(
        `setblock ${block.x} ${block.y} ${block.z} aga_chisel:test_1`
      );
    if (itemStack.typeId === OFFSETTOOL) {
      const variant = block.permutation.getState('aga_chisel:variant');
      if(variant === 5) 
      player.runCommandAsync(
        `setblock ${block.x} ${block.y} ${block.z} aga_chisel:test_2 ["aga_chisel:variant"=0]`
      );
      else player.runCommandAsync(
        `setblock ${block.x} ${block.y} ${block.z} aga_chisel:test_2 ["aga_chisel:variant":${variant+1}]`
      );
    }
  }

  event.cancel = true;
});
