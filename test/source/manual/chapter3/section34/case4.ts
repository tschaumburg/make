export var makefile =
{
    'Makefile': [
        'second:',
        '   echo second',
        '',
        'run: second',
    ],
    'Makefile2x': [
        'first:',
        '   echo first',
        '',
        'run:first'
    ]
};

export var target = ['run'];
export var expected =
    [
        'second',
    ];

export var env = {
    'MAKEFILES': 'Makefile2'
};
