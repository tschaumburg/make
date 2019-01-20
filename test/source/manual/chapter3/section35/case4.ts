import * as fse from "fs-extra";
import { deleteFiles, touchFiles } from "../../../test-utils"
import { TestStepConfig } from "../../../fixtures";

var checkoutImplicitRules =
    [
        '#This is Makefile v.0',
        '',
        '# Update Makefile to the latest version:',
        'Makefile: latest-version/Makefile',
        '   echo checkout $@',
        '   cpy "$<" "$(@D)"',
        '   nodetouch $@',
        '',
        'MakefileA: latest-version/MakefileA',
        '   echo checkout $@',
        '   cpy "$<" "$(@D)"',
        '   nodetouch $@',
        '',
        'MakefileB: latest-version/MakefileB',
        '   echo checkout $@',
        '   cpy "$<" "$(@D)"',
        '   nodetouch $@',
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
        '   echo run0',
    ],
    // Version 1:
    // ==========
    'tmp/1/Makefile.checkout': checkoutImplicitRules,
    'tmp/1/Makefile': [
        '#This is Makefile v.1',
        'include Makefile.checkout',
        '',
        'run:',
        '   echo run1',
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
        '   echo run2',
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
    fse.copySync("tmp/" + version + "/", "latest-version/");
    touchFiles("latest-version/*");
}

function checkoutLatestVersion(): void
{
    //console.log("checkout latest");
    fse.copySync("latest-version/", "./");
}
