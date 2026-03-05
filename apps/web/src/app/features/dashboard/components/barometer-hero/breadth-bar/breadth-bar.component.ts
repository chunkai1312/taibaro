import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-breadth-bar',
  standalone: true,
  imports: [],
  templateUrl: './breadth-bar.component.html',
  styleUrl: './breadth-bar.component.scss',
})
export class BreadthBarComponent {
  advanceCount = input<number | null | undefined>(null);
  unchangedCount = input<number | null | undefined>(null);
  declineCount = input<number | null | undefined>(null);

  readonly hasData = computed(() => {
    const a = this.advanceCount();
    const d = this.declineCount();
    return a != null && d != null;
  });

  readonly total = computed(() => {
    const a = this.advanceCount() ?? 0;
    const u = this.unchangedCount() ?? 0;
    const d = this.declineCount() ?? 0;
    return a + u + d || 1;
  });

  readonly advancePct = computed(() =>
    +((this.advanceCount() ?? 0) / this.total() * 100).toFixed(1)
  );

  readonly unchangedPct = computed(() =>
    +((this.unchangedCount() ?? 0) / this.total() * 100).toFixed(1)
  );

  readonly declinePct = computed(() =>
    +((this.declineCount() ?? 0) / this.total() * 100).toFixed(1)
  );
}
