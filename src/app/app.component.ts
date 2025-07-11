import { RouterLink, RouterOutlet } from '@angular/router';
import {MediaMatcher} from '@angular/cdk/layout';
import {Component, Inject, OnDestroy, PLATFORM_ID, inject, signal} from '@angular/core';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ConfigService } from './config.service';

interface Items {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, MatListModule, MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  items: Items[] = [
    { value: 'mfp', viewValue: 'MFP' },
    { value: 'tv', viewValue: 'Television' },
 ];

 itemsWall: any[] = [
    { value: 'white', viewValue: 'White Wall' },
    { value: 'green', viewValue: 'Green Wall' },
    { value: 'red', viewValue: 'Red Wall' },
    { value: 'pink', viewValue: 'Pink Wall' },
    { value: 'brown', viewValue: 'Brown Wall' },
 ];

  protected readonly isMobile = signal(true);

  private readonly _mobileQuery!: MediaQueryList;
  private readonly _mobileQueryListener!: () => void;

  constructor(@Inject(PLATFORM_ID) private platformId: object, private config: ConfigService) {

    if (isPlatformBrowser(this.platformId)) {
      const media = inject(MediaMatcher);

      this._mobileQuery = media.matchMedia('(max-width: 600px)');
      this.isMobile.set(this._mobileQuery.matches);
      this._mobileQueryListener = () => this.isMobile.set(this._mobileQuery.matches);
      this._mobileQuery.addEventListener('change', this._mobileQueryListener);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this._mobileQuery.removeEventListener('change', this._mobileQueryListener);
    }
  }


  getValue(eve: any) {
    console.log(eve.value);
    this.config.$currentItem.next(eve.value);
  }

   getWall(eve: any) {
    console.log(eve.value);
    this.config.$currentWall.next(eve.value);
  }

}
