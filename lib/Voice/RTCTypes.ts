export interface Transport {
  id: string;
  iceParameters: IceParameters;
  iceCandidates: IceCandidate[];
  dtlsParameters: DtlsParameters;
}

export interface DtlsParameters {
  fingerprints: Fingerprint[];
  role: string;
}

export interface Fingerprint {
  algorithm: string;
  value: string;
}

export interface IceCandidate {
  foundation: string;
  ip: string;
  port: number;
  priority: number;
  protocol: string;
  type: string;
}

export interface IceParameters {
  iceLite: boolean;
  password: string;
  usernameFragment: string;
}

export interface RTCTransports {
  send: Transport;
  recv: Transport;
}
