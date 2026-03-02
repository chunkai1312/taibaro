import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BarometerLevel,
  BAROMETER_WEATHER,
  BAROMETER_LABEL,
} from '../../../../../core/models/barometer.model';

interface GaugeStep {
  level: BarometerLevel;
  weather: string;
  label: string;
  active: boolean;
}

const GAUGE_ORDER: BarometerLevel[] = [
  BarometerLevel.STRONG_BEAR,
  BarometerLevel.BEAR,
  BarometerLevel.NEUTRAL,
  BarometerLevel.BULL,
  BarometerLevel.STRONG_BULL,
];

@Component({
  selector: 'app-barometer-gauge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barometer-gauge.component.html',
  styleUrl: './barometer-gauge.component.scss',
})
export class BarometerGaugeComponent {
  level = input.required<BarometerLevel>();

  readonly steps = computed<GaugeStep[]>(() =>
    GAUGE_ORDER.map((l) => ({
      level: l,
      weather: BAROMETER_WEATHER[l],
      label: BAROMETER_LABEL[l],
      active: l === this.level(),
    }))
  );
}
