export interface ECOEConfig {
  rounds_id: number[];
  rounds: InfoData[];
  ecoe: InfoData;
  reruns: number;
  schedules: {
    name: string;
    events: Event[];
    duration: number;
    order: number;
  }[];
}

export interface InfoData {
  id: number;
  name: string;
  time_start?: string;
  organization?: number;
}

export interface Event {
  is_countdown: boolean;
  stations: number[];
  message: string;
  sound: string;
  t: number;
}
