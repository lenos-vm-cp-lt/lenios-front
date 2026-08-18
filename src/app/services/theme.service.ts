/**
 * Patrón Repository / Abstracción de Datos (Frontend):
 * Abstrae el acceso a datos remotos mediante la API REST y desacopla la persistencia/servicios de los componentes de la interfaz de usuario.
 */

import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private readonly STORAGE_KEY = 'lenios_theme';

    isDarkMode = signal<boolean>(this.getStoredPreference());

    constructor() {
        effect(() => {
            const dark = this.isDarkMode();
            document.body.classList.toggle('dark-theme', dark);
            localStorage.setItem(this.STORAGE_KEY, dark ? 'dark' : 'light');
        });
    }

    private getStoredPreference(): boolean {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) return stored === 'dark';
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    toggleTheme(): void {
        this.isDarkMode.update((v) => !v);
    }
}