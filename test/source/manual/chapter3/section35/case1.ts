import { deleteFiles, touchFiles, touchFilesRelative } from "../../../test-utils"
import { TestStepConfig } from "../../../fixtures";

export var makefile =
{
    'Makefile.template': [
        'run:',
        '\techo Makefile updated',
    ],
    'Makefile': [
        'run:',
        '\techo Makefile unchanged',
        '',
        'Makefile: Makefile.template',
        '\tcopy /Y Makefile.template Makefile > nul',
    ],
};

export const steps: TestStepConfig[] =
    [
        {
            title: 'No changes',
            prepare: () => 
                {
                    touchFilesRelative(-10000, 'Makefile.template'); 
                    touchFilesRelative(0, 'Makefile'); 
                },
            targets: ['run'],
            expect: ['Makefile unchanged'],
        },
        {
            title: 'Update',
            prepare: () => 
                {
                    touchFilesRelative(-10000, 'Makefile'); 
                    touchFilesRelative(0, 'Makefile.template'); 
                },
            targets: ['run'],
            expect: ['Makefile updated'],
        }
    ];
