'use client';
import {useEffect,useRef,useState} from 'react';
import {Camera,X} from 'lucide-react';

/** Camera barcode scanning is optional and supported only in browsers exposing BarcodeDetector.
 * USB/Bluetooth keyboard-wedge scanners always work through the regular input. */
export default function BarcodeCamera({onScan,onClose}:{onScan:(barcode:string)=>void;onClose:()=>void}){
 const video=useRef<HTMLVideoElement>(null);
 const onScanRef=useRef(onScan);onScanRef.current=onScan;
 const [message,setMessage]=useState('Opening camera…');
 useEffect(()=>{
  let active=true,stream:MediaStream|undefined,frame=0,busy=false;
  type DetectorType = new (settings:{formats:string[]})=>{detect:(video:HTMLVideoElement)=>Promise<{rawValue:string}[]>};
  const Constructor=(window as unknown as {BarcodeDetector?:DetectorType}).BarcodeDetector;
  if(!Constructor||!navigator.mediaDevices?.getUserMedia){setMessage('Camera scanning is unavailable in this browser. Use a USB/Bluetooth scanner or type the barcode.');return;}
  let detector:InstanceType<DetectorType>;
  try{detector=new Constructor({formats:['code_128','code_39','ean_13','ean_8','upc_a']});}
  catch{setMessage('Camera barcode format not supported. Please use the scanner input.');return;}
  let last=0;
  const scan=async(timestamp:number)=>{
   if(!active)return;
   if(video.current&&video.current.readyState>=2&&!busy&&timestamp-last>180){
    last=timestamp;busy=true;
    try{const results=await detector.detect(video.current);if(active&&results.length&&results[0].rawValue){active=false;onScanRef.current(results[0].rawValue);return;}}catch{setMessage('Could not read the barcode. Position it inside the camera frame.');}
    finally{busy=false;}
   }
   if(active)frame=requestAnimationFrame(scan);
  };
  navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false}).then(s=>{
   if(!active){s.getTracks().forEach(t=>t.stop());return;}
   stream=s;if(video.current){video.current.srcObject=s;video.current.play().catch(()=>{});}setMessage('Point the camera at a barcode');frame=requestAnimationFrame(scan);
  }).catch(()=>{if(active)setMessage('Camera access denied or unavailable. Use the barcode input instead.');});
  return ()=>{active=false;cancelAnimationFrame(frame);stream?.getTracks().forEach(t=>t.stop());if(video.current)video.current.srcObject=null;};
 },[]);
 return <div className="barcode-camera"><div className="barcode-camera-top"><strong><Camera size={15}/> Camera Barcode Scanner</strong><button type="button" className="icon-button" aria-label="Close camera scanner" onClick={onClose}><X size={16}/></button></div><video ref={video} playsInline muted aria-label="Barcode camera preview"/><p className="muted small">{message}</p></div>;
}
