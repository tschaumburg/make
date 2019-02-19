import * as fse from "fs-extra";
import { deleteFiles, touchFiles, touchFilesRelative } from "../../../test-utils"
import { TestStepConfig } from "../../../fixtures";

var checkoutImplicitRules =
    [
        '#This is Makefile v.0',
        '',
        '# Update Makefile to the latest version:',
        'Makefile: latest-version/Makefile',
        '\techo checkout $@',
        '\tcpy "$<" "$(@D)"',
        '\techo. >> $@',
        '',
        'MakefileA: latest-version/MakefileA',
        '\techo checkout $@',
        '\tcpy "$<" "$(@D)"',
        '\techo. >> $@',
        '',
        'MakefileB: latest-version/MakefileB',
        '\techo checkout $@',
        '\tcpy "$<" "$(@D)"',
        '\techo. >> $@',
        '',
    ];

export var makefile =
{
    // Version 0:
    // ==========
    'tmp/0/Makefile.checkout': checkoutImplicitRules,
    'tmp/0/Makefile': [
        '#This is Makefile v.0',
        'include Makefile.checkout',
        '',
        'run:',
        '\techo run0',
    ],
    // Version 1:
    // ==========
    'tmp/1/Makefile.checkout': checkoutImplicitRules,
    'tmp/1/Makefile': [
        '#This is Makefile v.1',
        'include Makefile.checkout',
        '',
        'run:',
        '\techo run1',
        '',
        'include MakefileA',
    ],
    'tmp/1/MakefileA': [
        '#This is MakefileA v.1',
        '',
    ],
    // Version 2:
    // ==========
    'tmp/2/Makefile.checkout': checkoutImplicitRules,
    'tmp/2/Makefile': [
        '#This is Makefile v.2',
        'include Makefile.checkout',
        '',
        'run:',
        '\techo run2',
        '',
        'include MakefileA',
        'include MakefileB',
        '',
        '# No newer versions available',
    ],
    'tmp/2/MakefileA': [
        '#This is MakefileA v.2',
        '',
        '# No newer versions available',
    ],
    'tmp/2/MakefileB': [
        '#This is MakefileB v.2',
        '',
        '# No newer versions available',
    ],
};

export const steps: TestStepConfig[] =
    [
        {
            title: 'Version 0: update single Makefile',
            prepare: () =>
            {
                //rm(["version/*"]);
                setLatestVersion(0);
                checkoutLatestVersion();
            },
            targets: ['run'],
            expect: ['run0'],
        },
        {
            title: 'version 1: retrieve included Makefiles',
            prepare: () => { setLatestVersion(1); },
            targets: ['run'],
            expect: [
                'checkout Makefile',
                'checkout MakefileA',
                'run1',
            ],
        },
        {
            title: 'version 2: retrieve indirectly included Makefiles',
            prepare: () => { setLatestVersion(2); },
            targets: ['run'],
            expect: [
                'checkout Makefile',
                'checkout MakefileA',
                'checkout MakefileB',
                'run2',
            ],
        }
    ];
function setLatestVersion(version: number): void
{
    console.log("checkin v." + version);
    deleteFiles("latest-version/*");
    fse.copySync("tmp/" + version + "", "latest-version", { preserveTimestamps: true, overwrite: true });
    touchFilesRelative(0, "latest-version/*");
}

function checkoutLatestVersion(): void
{
    //console.log("checkout latest");
    fse.copySync("latest-version/", "./", { preserveTimestamps: true });
    touchFilesRelative(0, "./*");
}
