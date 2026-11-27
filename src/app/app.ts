import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeToggle } from './shared/components/theme-toggle/theme-toggle';
import { AlertViewport } from './shared/components/alert-viewport/alert-viewport';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeToggle, AlertViewport],
  templateUrl: './app.html',
})
export class App {}
