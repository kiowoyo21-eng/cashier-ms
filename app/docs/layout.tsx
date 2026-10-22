import type {ReactNode} from "react";
import "../studio/studio.css";
/** Docs routes need the same scoped styles as the existing /studio editor routes. */
export default function DocsLayout({children}:{children:ReactNode}){
 return <div className="studio-scope">{children}</div>;
}
