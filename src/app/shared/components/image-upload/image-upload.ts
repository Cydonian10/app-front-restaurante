import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideCloudUpload, LucideImage, LucideX } from '@lucide/angular';
import { Button } from '../button/button';

export interface ImageSelection {
  file: File | null;
  error: string;
}

@Component({
  selector: 'app-image-upload',
  imports: [Button, LucideCloudUpload, LucideImage, LucideX],
  templateUrl: './image-upload.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUpload implements OnDestroy {
  readonly inputId = input.required<string>();
  readonly existingImageUrl = input<string | null>(null);
  readonly disabled = input(false);
  readonly selectionChange = output<ImageSelection>();

  protected readonly file = signal<File | null>(null);
  protected readonly error = signal('');
  protected readonly dragging = signal(false);
  protected readonly previewUrl = signal('');
  protected readonly displayedImage = computed(() => this.previewUrl() || this.existingImageUrl());

  protected select(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    // Canceling the picker keeps the current selection; clearing the input allows selecting it again.
    if (!file) return;
    this.choose(file);
    input.value = '';
  }

  protected dragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled()) this.dragging.set(true);
  }

  protected dragLeave(event: DragEvent): void {
    const target = event.currentTarget as HTMLElement;
    if (event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) return;
    this.dragging.set(false);
  }

  protected drop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    if (this.disabled()) return;
    const files = event.dataTransfer?.files;
    if (!files?.length) return;
    if (files.length > 1) {
      this.reject('Selecciona una sola imagen.');
      return;
    }
    this.choose(files[0]);
  }

  protected clear(): void {
    this.releasePreview();
    this.file.set(null);
    this.error.set('');
    this.selectionChange.emit({ file: null, error: '' });
  }

  ngOnDestroy(): void {
    this.releasePreview();
  }

  private choose(file: File): void {
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      this.reject('La imagen debe ser JPG, PNG o WebP y no superar 5 MB.');
      return;
    }
    this.releasePreview();
    this.file.set(file);
    this.error.set('');
    if (typeof URL.createObjectURL === 'function') this.previewUrl.set(URL.createObjectURL(file));
    this.selectionChange.emit({ file, error: '' });
  }

  private reject(message: string): void {
    this.releasePreview();
    this.file.set(null);
    this.error.set(message);
    this.selectionChange.emit({ file: null, error: message });
  }

  private releasePreview(): void {
    const url = this.previewUrl();
    if (url) URL.revokeObjectURL(url);
    this.previewUrl.set('');
  }
}
