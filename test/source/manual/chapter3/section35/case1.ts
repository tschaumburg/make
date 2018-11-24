import { deleteFiles, touchFiles } from "../../../test-utils"
import { TestStep } from "../../../fixtures";

export var makefile =
{
    'Makefile.template': [
        'run:',
        '   echo Makefile updated',
    ],
    'Makefile': [
        'run:',
        '   echo Makefile unchanged',
        '',
        'Makefile: Makefile.template',
        '   copy /Y Makefile.template Makefile > NUL',
    ],
};

export const steps: TestStep[] =
    [
        {
            title: 'No changes',
            prepare: () => { touchFiles('Makefile'); },
            targets: ['run'],
            expect: ['Makefile unchanged'],
        },
        {
            title: 'Update',
            prepare: () => { touchFiles('Makefile.template'); },
            targets: ['run'],
            expect: ['Makefile updated'],
        }
    ];
