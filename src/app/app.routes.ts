import { Routes } from '@angular/router';
import { RoomSceneComponent } from './room-scene/room-scene.component';
import { AddDeviceComponent } from './add-device/add-device.component';

export const routes: Routes = [
    { path: '', component: RoomSceneComponent },
    { path: 'add-device', component: AddDeviceComponent }
];
