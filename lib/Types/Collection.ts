export interface Collection {
  Collect: (t: any, v: any) => void;
  Set: (k: any, v: any) => void;
  Get: <T>(v: any) => T;
  Delete: (k: any) => void;
}
