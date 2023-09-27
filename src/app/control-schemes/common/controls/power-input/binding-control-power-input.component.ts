import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { NgIf } from '@angular/common';
import { TranslocoPipe } from '@ngneat/transloco';
import { MatInputModule } from '@angular/material/input';
import { ValidationMessagesDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-binding-control-power-input',
    templateUrl: './binding-control-power-input.component.html',
    styleUrls: [ './binding-control-power-input.component.scss' ],
    imports: [
        MatSliderModule,
        NgIf,
        ReactiveFormsModule,
        TranslocoPipe,
        MatInputModule,
        ValidationMessagesDirective
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BindingControlPowerInputComponent {
    @Input() public translocoTitle = 'controlScheme.outputPower';

    @Input() public control?: FormControl<number>;
}
