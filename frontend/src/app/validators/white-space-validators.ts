import { FormControl, ValidationErrors } from '@angular/forms';

export class WhiteSpaceValidators {

    //white space validator
    static notOnlyWhiteSpace(control: FormControl): ValidationErrors {
        //check if string only has spaces
        if ((control.value != null) && (control.value.trim().length === 0)) {
            return { 'notOnlyWhiteSpace': true }
        } else {
            return null;
        }

    }
}
