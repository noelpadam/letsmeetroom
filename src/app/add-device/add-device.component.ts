import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-device',
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './add-device.component.html',
  styleUrl: './add-device.component.css'
})
export class AddDeviceComponent {
  items: any = [
    {id: 1, type: 'MFP', name: 'MFP1' },
    {id: 2, type: 'TV', name: 'TV1' },
  ];
}
