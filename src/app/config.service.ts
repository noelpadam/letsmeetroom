import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  $currentItem: Subject<any> = new Subject<any>();

  $currentWall: Subject<any> = new Subject<any>();

  webGlInfo: any = {

    "tv": {
      scale: { x: 20, y: 20, z: 20 },
      position: { x: -60, y: 10, z: 0 },
    },
    "mfp": {
      scale: { x: 20, y: 20, z: 20 },
      position: { x: -60, y: -30, z: 0 },
    }

  };

  constructor() { }

  getWebGlInfo(type: string) {
    return this.webGlInfo[type];
  }



}
