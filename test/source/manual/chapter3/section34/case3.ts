export var makefile =
{
    'Makefile': [
        'second:',
        '   echo second',
        '',
        'run: second',
    ],
    'Makefile2': [
        'first:',
        '   echo first',
        '',
        'run:first'
    ]
};

export var target = [''];
export var expected =
    [
        'second',
    ];

export var env = {
    'MAKEFILES': 'Makefile2'
};
