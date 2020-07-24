interface APIError {
    path: string;
    status: number;
    error: string;
    method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
  }
  
  export default class ApiError extends Error {
    private path: string;
    private status: number;
    private error: string;
    private method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
  
    constructor({ path, status, error, method }: APIError) {
      super();
      this.path = path;
      this.error = error;
      this.status = status;
      this.method = method;
    }
  }
  