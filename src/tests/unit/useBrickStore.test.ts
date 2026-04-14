import { describe, it, expect, beforeEach } from 'vitest';
import { useBrickStore } from '../../store/useBrickStore';

describe('useBrickStore', () => {
  beforeEach(() => {
    useBrickStore.setState({
      bricks: [], activeTool: 'place', activeColorId: 'bright-red',
      activeBrickType: '1x1', notification: null,
    });
  });

  it('T-FE-TOOL-001-01: activeTool defaults to place', () => {
    expect(useBrickStore.getState().activeTool).toBe('place');
  });

  it('T-FE-BRICK-001-01: placeBrick adds brick to store', () => {
    useBrickStore.getState().placeBrick(2, 0, 3);
    const { bricks } = useBrickStore.getState();
    expect(bricks).toHaveLength(1);
    expect(bricks[0]).toMatchObject({ x: 2, y: 0, z: 3, type: '1x1' });
  });

  it('T-FE-BRICK-001-02: duplicate placement is rejected', () => {
    useBrickStore.getState().placeBrick(2, 0, 3);
    useBrickStore.getState().placeBrick(2, 0, 3);
    expect(useBrickStore.getState().bricks).toHaveLength(1);
  });

  it('T-FE-TOOL-002-01: deleteBrick removes brick by id', () => {
    useBrickStore.getState().placeBrick(2, 0, 3);
    const id = useBrickStore.getState().bricks[0].id;
    useBrickStore.getState().deleteBrick(id);
    expect(useBrickStore.getState().bricks).toHaveLength(0);
  });

  it('T-FE-TOOL-003-01: rotateBrick rotates 90 degrees', () => {
    useBrickStore.getState().placeBrick(0, 0, 0);
    const id = useBrickStore.getState().bricks[0].id;
    useBrickStore.getState().rotateBrick(id);
    expect(useBrickStore.getState().bricks[0].rotation).toBe(90);
  });

  it('T-FE-TOOL-003-02: rotation wraps at 360 degrees', () => {
    useBrickStore.getState().placeBrick(0, 0, 0);
    const id = useBrickStore.getState().bricks[0].id;
    for (let i = 0; i < 4; i++) useBrickStore.getState().rotateBrick(id);
    expect(useBrickStore.getState().bricks[0].rotation).toBe(0);
  });

  it('T-FE-BRICK-002-01: setActiveColor updates color', () => {
    useBrickStore.getState().setActiveColor('bright-blue');
    expect(useBrickStore.getState().activeColorId).toBe('bright-blue');
  });

  it('T-FE-BRICK-003-01: setActiveBrickType updates type', () => {
    useBrickStore.getState().setActiveBrickType('2x4');
    expect(useBrickStore.getState().activeBrickType).toBe('2x4');
  });
});
