export default interface Request {
  url: string;
  headers: any;
  method: string;
  path?: string;
  data?: any;
}
