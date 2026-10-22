/** Text-node search keeps original document positions/formatting. No HTML rewriting. */
export type TextSegment={text:string;pos:number};
export type TextMatch={from:number;to:number};
export function findTextMatches(segments:readonly TextSegment[],query:string,caseSensitive=false,limit=1001):TextMatch[]{
 if(!query||query.length>100)return [];
 const needle=caseSensitive?query:query.toLocaleLowerCase();const matches:TextMatch[]=[];
 for(const segment of segments){const haystack=caseSensitive?segment.text:segment.text.toLocaleLowerCase();let start=0;
  while((start=haystack.indexOf(needle,start))!==-1){matches.push({from:segment.pos+start,to:segment.pos+start+query.length});if(matches.length>=limit)return matches;start+=Math.max(1,query.length)}
 }
 return matches;
}
export function adjacentTextMatch(matches:readonly TextMatch[],cursor:number,direction:1|-1):TextMatch|null{
 if(!matches.length)return null;
 if(direction===1)return matches.find(m=>m.from>=cursor)??matches[0];
 return [...matches].reverse().find(m=>m.to<=cursor)??matches[matches.length-1];
}
