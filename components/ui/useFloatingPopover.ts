"use client";
import {useCallback,useEffect,useLayoutEffect,useRef,useState,type CSSProperties,type RefObject} from "react";
import {floatingPosition} from "../../lib/floatingPosition";

/** Fixed, viewport-aware floating position. Pair with a body portal to avoid scroll-container clipping. */
export function useFloatingPopover(open:boolean,anchor:RefObject<HTMLElement|null>,width:number,gap=8){
 const panel=useRef<HTMLDivElement>(null);
 const [style,setStyle]=useState<CSSProperties>({position:"fixed",top:8,left:8,visibility:"hidden"});
 const position=useCallback(()=>{
  const el=anchor.current;if(!el)return;
  const rect=el.getBoundingClientRect();
  const target=floatingPosition(rect,{width:window.innerWidth,height:window.innerHeight},
   {width,height:panel.current?.offsetHeight||320},gap);
  setStyle({position:"fixed",...target,overflowY:"auto",visibility:"visible",zIndex:10050});
 },[anchor,width,gap]);
 useLayoutEffect(()=>{if(open)position()},[open,position]);
 useEffect(()=>{if(!open)return;const update=()=>position();window.addEventListener("resize",update);window.addEventListener("scroll",update,true);return()=>{window.removeEventListener("resize",update);window.removeEventListener("scroll",update,true)}},[open,position]);
 return {panel,style};
}
