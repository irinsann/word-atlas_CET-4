import { dayKey } from "./store";

export function streakOf(days: Record<string, { r: number }>) {
  let n=0;
  const d=new Date();
  if(!(days[dayKey(d)]?.r>0)) d.setDate(d.getDate()-1);
  while(days[dayKey(d)]?.r>0) { n++;d.setDate(d.getDate()-1); }
  return n;
}
