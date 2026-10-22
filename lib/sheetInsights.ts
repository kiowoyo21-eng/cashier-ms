/** Pivot-style read-only summary for the active workbook view.
 * Does not mutate cells, HRMS records, or produce saved chart objects.
 */
export type PivotOperation="sum"|"average"|"count";
export type PivotRow={label:string;value:number;count:number;numericCount:number};
export type PivotSummary={rows:PivotRow[];totalRows:number;skippedNonNumeric:number;categoryCount:number;truncated:boolean};
export function summarizeColumns(source:ReadonlyArray<{category:string;value:string}>,operation:PivotOperation,maxGroups=12):PivotSummary{
 if(!Number.isInteger(maxGroups)||maxGroups<1||maxGroups>30)throw Error("Invalid pivot display limit.");
 if(source.length>4000)throw Error("Pivot preview supports up to 4,000 rows.");
 const groups=new Map<string,{count:number;sum:number;numericCount:number}>();let skippedNonNumeric=0;
 for(const record of source){
  const label=(record.category.trim()||"(Blank)").slice(0,120);
  let g=groups.get(label);if(!g){g={count:0,sum:0,numericCount:0};groups.set(label,g)}
  g.count++;
  const raw=record.value.trim();
  // Currency symbols, error tokens, NaN, percent strings are not silently coerced.
  if(raw!==""&&Number.isFinite(Number(raw))){g.sum+=Number(raw);g.numericCount++}
  else if(operation!=="count")skippedNonNumeric++;
 }
 const measure=(g:{count:number;sum:number;numericCount:number})=>operation==="count"?g.count:operation==="sum"?g.sum:g.numericCount?g.sum/g.numericCount:0;
 const all=Array.from(groups,([label,g])=>({label,value:measure(g),count:g.count,numericCount:g.numericCount}));
 all.sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label));
 const keep=all.slice(0,maxGroups);
 if(all.length>maxGroups){
  const remaining=all.slice(maxGroups);
  const totalCount=remaining.reduce((sum,r)=>sum+r.count,0);
  const totalNumeric=remaining.reduce((sum,r)=>sum+r.numericCount,0);
  // Rebuild the weighted aggregate from the original sums rather than averaging averages.
  const totalSum=remaining.reduce((sum,r)=>sum+(operation==="average"?r.value*r.numericCount:r.value),0);
  keep.push({label:"Other categories",value:operation==="count"?totalCount:operation==="sum"?totalSum:totalNumeric?totalSum/totalNumeric:0,count:totalCount,numericCount:totalNumeric});
 }
 return {rows:keep,totalRows:source.length,skippedNonNumeric,categoryCount:groups.size,truncated:all.length>maxGroups};
}
