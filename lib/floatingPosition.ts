/** Pure viewport geometry for popup portals. All coordinates are CSS pixels. */
export type FloatingAnchor={top:number;right:number;bottom:number};
export type FloatingPlacement={left:number;top:number;width:number;maxHeight:number};
export function floatingPosition(
 anchor:FloatingAnchor, viewport:{width:number;height:number}, content:{width:number;height:number},gap=8
):FloatingPlacement{
 const safeWidth=Math.max(1,Math.min(content.width,Math.max(1,viewport.width-16)));
 const left=Math.max(8,Math.min(anchor.right-safeWidth,viewport.width-safeWidth-8));
 const below=Math.max(0,viewport.height-anchor.bottom-gap-8);
 const above=Math.max(0,anchor.top-gap-8);
 const belowPreferred=below>=Math.min(content.height,250)||below>=above;
 const maxHeight=Math.max(1,Math.min(content.height,belowPreferred?below:above));
 return {
  left,
  top:belowPreferred?Math.min(viewport.height-8,anchor.bottom+gap):Math.max(8,anchor.top-gap-Math.min(content.height,maxHeight)),
  width:safeWidth,
  maxHeight,
 };
}
