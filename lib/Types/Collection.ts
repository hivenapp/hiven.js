export default interface Collection {
  collect: (t, v) => void;
  set: (k: any, v: any) => void;
  get: <T>(v: any) => T;
  delete: (k: any) => void;
}
