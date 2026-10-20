"use client";
import {useEffect,useState} from "react";
import {readStudio,studioActor,subscribeStudio} from "./store";
import {touchDemoSession} from "../spreadsheetStore";
import type {StudioActor,StudioState} from "./types";
export function useStudio(){const [actor,setActor]=useState<StudioActor|null>(null),[state,setState]=useState<StudioState>(readStudio),[ready,setReady]=useState(false);
 useEffect(()=>{const sync=()=>{setActor(studioActor());setState(readStudio());setReady(true)};sync();const unsub=subscribeStudio(sync);window.addEventListener("focus",sync);const activity=()=>touchDemoSession();window.addEventListener("pointerdown",activity);window.addEventListener("keydown",activity);const timer=setInterval(sync,12000);return()=>{unsub();window.removeEventListener("focus",sync);window.removeEventListener("pointerdown",activity);window.removeEventListener("keydown",activity);clearInterval(timer)}},[]);
 return {actor,state,ready,refresh:()=>setState(readStudio())};}
export function openStudioWindow(url:string){window.open(url,"_blank","noopener,noreferrer")}
