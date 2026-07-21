import { Component } from '@angular/core';
import { CatalogComponent } from './components/catalog/catalog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CatalogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'leños-rellenos';
}
